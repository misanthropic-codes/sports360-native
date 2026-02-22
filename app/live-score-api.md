# Live Score & User Search — Frontend API Guide

> **Base URL:** `http://localhost:8080/api/v1`
> **Auth:** Protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.
> **Content-Type:** All POST/PUT/PATCH requests require `Content-Type: application/json`.

---

## Table of Contents

1. [Scoring Flow — Step by Step](#1-scoring-flow--step-by-step)
2. [Prerequisite APIs (Get IDs)](#2-prerequisite-apis-get-ids)
3. [Score Endpoints (Organizer)](#3-score-endpoints-organizer)
4. [Guest Endpoints (No Auth)](#4-guest-endpoints-no-auth)
5. [WebSocket — Real-time Updates](#5-websocket--real-time-updates)
6. [User Search](#6-user-search)
7. [MatchScoreState Response Shape](#7-matchscorestate-response-shape)
8. [Error Responses](#8-error-responses)
9. [Enums Reference](#9-enums-reference)

---

## 1. Scoring Flow — Step by Step

This is the **exact sequence** the organizer frontend must follow:

```
┌─────────────────────────────────────────────────┐
│  Step 1: Login → get JWT token                  │
│  POST /api/v1/auth/login                        │
├─────────────────────────────────────────────────┤
│  Step 2: Get match details → get matchId,       │
│          tournamentId, teamAId, teamBId          │
│  GET /api/v1/matches/:id                         │
├─────────────────────────────────────────────────┤
│  Step 3: Get team rosters → get player UUIDs     │
│  GET /api/v1/team/:teamId/members                │
│  (call for both teams)                           │
├─────────────────────────────────────────────────┤
│  Step 4: Set match status to "ongoing"           │
│  PATCH /api/v1/matches/:id/status                │
│  Body: { "status": "ongoing" }                   │
├─────────────────────────────────────────────────┤
│  Step 5: Set initial players                     │
│  POST /api/v1/score/set-players                  │
│  (striker, non-striker, bowler, maxOvers)         │
├─────────────────────────────────────────────────┤
│  Step 6: Score balls (loop)                      │
│  POST /api/v1/score/ball                         │
│                                                  │
│  ┌─ After WICKET → call set-players with new     │
│  │  batsman (server won't auto-pick one)         │
│  ├─ After OVER ENDS → call change-bowler         │
│  ├─ After 1st INNINGS ENDS → call set-players    │
│  │  with swapped teams (new batting/bowling)     │
│  └─ MATCH COMPLETE → display result              │
├─────────────────────────────────────────────────┤
│  Step 7: Set match status to "completed"         │
│  PATCH /api/v1/matches/:id/status                │
│  Body: { "status": "completed" }                 │
└─────────────────────────────────────────────────┘
```

### Key Rules for Frontend

| Scenario | What to do |
|----------|-----------|
| **After a wicket** | Show player picker. Call `POST /score/set-players` with the new batsman. Dismissed batsmen cannot bat again — the server tracks this. |
| **After 6 legal deliveries (over ends)** | The server auto-increments the over. Frontend must call `POST /score/change-bowler` with the next bowler. |
| **After 1st innings ends** | The server auto-completes innings and sets `target`. Frontend should call `POST /score/set-players` with the **chasing team's** opener pair and a bowler from the other team. |
| **Undo mistakes** | Call `POST /score/reset-ball/:matchId`. This reverses everything including dismissed list. |
| **Manual strike swap** | Call `POST /score/swap-batsmen` (e.g., between overs). |
| **Match auto-completes** when target is chased, all-out (10 wickets), or all overs bowled in 2nd innings. The response will contain `matchComplete: true` and `result`. |

### How to Detect State in Response

```javascript
// After each API call, check:
if (state.matchComplete) {
    // Show result banner — state.result.margin
}
if (state.innings1Complete && state.currentInnings === 2) {
    // Show target — state.target
}
if (state.currentBall === 0 && state.currentOver > 0) {
    // Over just ended — prompt to change bowler
}
if (state.totalWickets > previousWickets) {
    // Wicket fell — prompt for new batsman
}
```

---

## 2. Prerequisite APIs (Get IDs)

These existing endpoints provide the UUIDs that scoring endpoints require.

### 2a. Login (Get JWT Token)

```
POST /api/v1/auth/login
```

```json
{
  "email": "organizer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "organizer-uuid",
      "fullName": "John Doe",
      "email": "organizer@example.com",
      "role": "organizer"
    }
  }
}
```

> Use the `token` in all subsequent `Authorization: Bearer <token>` headers.

### 2b. Get Match Details

```
GET /api/v1/matches/:matchId
```

> ❌ No auth required (guest accessible)

**Response:**
```json
{
  "id": "match-uuid",
  "tournamentId": "tournament-uuid",
  "teamAId": "team-a-uuid",
  "teamBId": "team-b-uuid",
  "round": 1,
  "matchNumber": 3,
  "matchTime": "2025-03-15T14:00:00.000Z",
  "matchType": "group",
  "status": "scheduled",
  "scoreA": null,
  "scoreB": null,
  "result": null,
  "winnerTeamId": null
}
```

> You need `matchId`, `tournamentId`, `teamAId`, `teamBId` from here.

### 2c. Get Team Members (Player Roster)

```
GET /api/v1/team/:teamId/members
Authorization: Bearer <token>
```

> Call this **twice** — once for Team A and once for Team B.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "userId": "player-uuid-1",
      "fullName": "Virat Kohli",
      "role": "captain",
      "status": "active",
      "isBenched": false
    },
    {
      "userId": "player-uuid-2",
      "fullName": "Rohit Sharma",
      "role": "player",
      "status": "active",
      "isBenched": false
    }
  ]
}
```

> Use `userId` as the `strikerId`, `nonStrikerId`, `bowlerId`, `batsmanId` etc. in scoring APIs.
> Use `fullName` as `strikerName`, `nonStrikerName`, `bowlerName`.
> Filter out benched players (`isBenched: true`) from the playing XI.

### 2d. Get Match-Specific Team Players

```
GET /api/v1/team/:teamId/matches/:matchId/players
Authorization: Bearer <token>
```

> More specific — returns players assigned to a particular match (if different from full roster).

### 2e. Update Match Status

```
PATCH /api/v1/matches/:matchId/status
Authorization: Bearer <token>
```

```json
{
  "status": "ongoing"
}
```

> Call this to set match to `"ongoing"` before scoring starts, and `"completed"` after the match ends.
> Valid statuses: `"scheduled"` → `"ongoing"` → `"completed"`.

---

## 3. Score Endpoints (Organizer — Auth Required)

All score-write endpoints require JWT auth. Only the **tournament organizer** can update scores.

### 3a. Set Players

Sets the striker, non-striker, bowler, and max overs. **Must be called before first ball and after every wicket/innings change.**

```
POST /api/v1/score/set-players
Authorization: Bearer <token>
```

```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
  "strikerId": "player-uuid-1",
  "strikerName": "Virat Kohli",
  "nonStrikerId": "player-uuid-2",
  "nonStrikerName": "Rohit Sharma",
  "bowlerId": "player-uuid-3",
  "bowlerName": "Mitchell Starc",
  "maxOvers": 20
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `matchId` | UUID | ✅ | |
| `tournamentId` | UUID | ✅ | |
| `strikerId` | UUID | ✅ | |
| `strikerName` | string | ✅ | |
| `nonStrikerId` | UUID | ✅ | Must differ from strikerId |
| `nonStrikerName` | string | ✅ | |
| `bowlerId` | UUID | ✅ | |
| `bowlerName` | string | ✅ | |
| `maxOvers` | int | ❌ | 1–50, defaults to 20 |

**Response:** Full [`MatchScoreState`](#7-matchscorestate-response-shape)

---

### 3b. Update Ball Score

Records a single delivery.

```
POST /api/v1/score/ball
Authorization: Bearer <token>
```

#### Normal delivery (2 runs)
```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
  "runs": 2,
  "deliveryType": "normal",
  "batsmanId": "player-uuid-1",
  "bowlerId": "player-uuid-3",
  "currentOver": 0,
  "currentBall": 0,
  "isFour": false,
  "isSix": false
}
```

#### Dot ball
```json
{ "runs": 0, "deliveryType": "normal", "..." }
```

#### Boundary four
```json
{ "runs": 4, "deliveryType": "normal", "isFour": true, "isSix": false, "..." }
```

#### Six
```json
{ "runs": 6, "deliveryType": "normal", "isFour": false, "isSix": true, "..." }
```

#### Wide (no extra runs)
```json
{ "runs": 0, "deliveryType": "wide", "..." }
```
> Server auto-adds 1 penalty run. `runs` = additional runs scored off the wide. Does **not** count as a legal delivery.

#### Wide + batsman ran 2
```json
{ "runs": 2, "deliveryType": "wide", "..." }
```
> Total added = 1 (penalty) + 2 (runs) = 3 runs.

#### No ball (batsman scored 2)
```json
{ "runs": 2, "deliveryType": "no_ball", "..." }
```
> Server auto-adds 1 penalty run. Does **not** count as a legal delivery.

#### Bye (2 runs)
```json
{ "runs": 2, "deliveryType": "bye", "..." }
```
> Runs go to team extras, NOT to batsman's personal score.

#### Leg bye (1 run)
```json
{ "runs": 1, "deliveryType": "leg_bye", "..." }
```

#### Wicket — bowled (0 runs)
```json
{
  "runs": 0,
  "deliveryType": "wicket",
  "wicketType": "bowled",
  "batsmanId": "striker-uuid",
  "bowlerId": "bowler-uuid",
  "currentOver": 3,
  "currentBall": 4,
  "isFour": false,
  "isSix": false
}
```

#### Wicket — run out (non-striker dismissed, 1 run scored)
```json
{
  "runs": 1,
  "deliveryType": "wicket",
  "wicketType": "run_out",
  "batsmanId": "striker-uuid",
  "bowlerId": "bowler-uuid",
  "outBatsmanId": "non-striker-uuid",
  "currentOver": 5,
  "currentBall": 0,
  "isFour": false,
  "isSix": false
}
```

#### Wicket — caught / LBW / stumped / hit-wicket
```json
{
  "runs": 0,
  "deliveryType": "wicket",
  "wicketType": "caught",
  "batsmanId": "striker-uuid",
  "bowlerId": "bowler-uuid",
  "currentOver": 2,
  "currentBall": 3
}
```

**All fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `matchId` | UUID | ✅ | |
| `tournamentId` | UUID | ✅ | |
| `runs` | int | ✅ | 0–7 |
| `deliveryType` | enum | ✅ | See [Enums](#9-enums-reference) |
| `wicketType` | enum | ❌ | Required when `deliveryType = "wicket"` |
| `batsmanId` | UUID | ✅ | Current striker's UUID |
| `bowlerId` | UUID | ✅ | Current bowler's UUID |
| `currentOver` | int | ✅ | Completed overs count |
| `currentBall` | int | ✅ | 0–5, legal balls in current over |
| `isFour` | bool | ❌ | Boundary four flag |
| `isSix` | bool | ❌ | Boundary six flag |
| `outBatsmanId` | UUID | ❌ | If different batsman dismissed (run out) |
| `commentary` | string | ❌ | Auto-generated if omitted |

**Response:** Full [`MatchScoreState`](#7-matchscorestate-response-shape)

> **Tip:** Frontend should read `batsmanId` from `state.striker.playerId`, `bowlerId` from `state.currentBowler.playerId`, `currentOver` from `state.currentOver`, and `currentBall` from `state.currentBall` — so the organizer only needs to tap the runs and delivery type.

---

### 3c. Change Bowler

```
POST /api/v1/score/change-bowler
Authorization: Bearer <token>
```

```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
  "bowlerId": "new-bowler-uuid",
  "bowlerName": "Jasprit Bumrah"
}
```

**Response:** Full [`MatchScoreState`](#7-matchscorestate-response-shape)

---

### 3d. Swap Batsmen

Manually swap striker ↔ non-striker positions.

```
POST /api/v1/score/swap-batsmen
Authorization: Bearer <token>
```

```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid"
}
```

**Response:** Full [`MatchScoreState`](#7-matchscorestate-response-shape)

---

### 3e. Undo Last Ball

Reverses the most recent ball — restores all stats, dismissed batsmen list, and strike position.

```
POST /api/v1/score/reset-ball/:matchId
Authorization: Bearer <token>
```

```json
{
  "tournamentId": "tournament-uuid"
}
```

**Response:** Full [`MatchScoreState`](#7-matchscorestate-response-shape)

---

### 3f. Reset Entire Match

Completely resets the score to initial state. **Use with caution.**

```
POST /api/v1/score/reset/:matchId
Authorization: Bearer <token>
```

```json
{
  "tournamentId": "tournament-uuid"
}
```

**Response:** Fresh [`MatchScoreState`](#7-matchscorestate-response-shape) (all zeros)

---

## 4. Guest Endpoints (No Auth)

### 4a. Get Live Matches

```
GET /api/v1/matches/live
```

**Response:**
```json
{
  "matches": [
    {
      "id": "match-uuid",
      "tournamentId": "tournament-uuid",
      "tournamentName": "IPL 2025",
      "round": 1,
      "matchNumber": 3,
      "teamAId": "team-a-uuid",
      "teamAName": "Mumbai Indians",
      "teamBId": "team-b-uuid",
      "teamBName": "Chennai Super Kings",
      "matchTime": "2025-03-15T14:00:00.000Z",
      "matchType": "knockout",
      "status": "ongoing",
      "scoreA": "185/4 (18.2)",
      "scoreB": null
    }
  ],
  "totalCount": 1
}
```

### 4b. Get Match Score

```
GET /api/v1/score/:matchId
```

**Response (score exists):** Full [`MatchScoreState`](#7-matchscorestate-response-shape)

**Response (no score yet):**
```json
{
  "message": "No live score data for this match",
  "score": null
}
```

### 4c. Get Dismissed Batsmen

```
GET /api/v1/score/:matchId/dismissed
```

**Response:**
```json
["player-uuid-1", "player-uuid-5", "player-uuid-8"]
```

> Use this to grey out / disable already-dismissed players in the batsman picker.

---

## 5. WebSocket — Real-time Updates

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080/score', {
    transports: ['websocket', 'polling']
});
```

> ❌ No auth required — the WebSocket namespace is guest-accessible.

### Subscribe to a Match

```javascript
socket.emit('subscribeToMatch', { matchId: 'match-uuid' });
```

### Unsubscribe

```javascript
socket.emit('unsubscribeFromMatch', { matchId: 'match-uuid' });
```

### Receive Updates

```javascript
socket.on('scoreUpdate', (payload) => {
    const { type, data } = payload;

    switch (type) {
        case 'BALL_UPDATE':
            // data = full MatchScoreState — update scoreboard, ball log, player stats
            break;
        case 'UNDO_BALL':
            // data = full MatchScoreState — re-render everything
            break;
        case 'PLAYERS_SET':
            // data = full MatchScoreState — show updated player names
            break;
        case 'BOWLER_CHANGED':
            // data = full MatchScoreState — update bowler card
            break;
        case 'BATSMEN_SWAPPED':
            // data = full MatchScoreState — swap striker/non-striker display
            break;
        case 'SCORE_RESET':
            // data = full MatchScoreState (zeroed) — reset entire display
            break;
        case 'INNINGS_COMPLETE':
            // data = { innings: 1, score: { runs, wickets }, target: 186 }
            // Show innings summary, target
            break;
        case 'MATCH_COMPLETE':
            // data = { winner, winnerTeamId, margin, status }
            // Show result banner
            break;
    }
});
```

### Event Types

| `type` | `data` shape | Triggered when |
|--------|-------------|----------------|
| `BALL_UPDATE` | `MatchScoreState` | Ball scored |
| `UNDO_BALL` | `MatchScoreState` | Last ball undone |
| `PLAYERS_SET` | `MatchScoreState` | Striker/bowler configured |
| `BOWLER_CHANGED` | `MatchScoreState` | Bowler changed |
| `BATSMEN_SWAPPED` | `MatchScoreState` | Manual strike swap |
| `SCORE_RESET` | `MatchScoreState` | Full reset |
| `INNINGS_COMPLETE` | `{ innings, score, target }` | Innings ended |
| `MATCH_COMPLETE` | `{ winner, winnerTeamId, margin, status }` | Match finished |

---

## 6. User Search

Fuzzy search users by name or phone number.

```
GET /api/v1/user/search?query=virat
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `query` | string | ✅ | Min 2 characters. Matches against `fullName` and `phone`. |

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "player-uuid-1",
      "fullName": "Virat Kohli",
      "email": "virat@example.com",
      "phone": "9876543210",
      "profilePicUrl": "https://...",
      "role": "player"
    }
  ],
  "totalCount": 1
}
```

> Maximum 20 results returned. Supports partial/fuzzy matching — `"vir"` matches `"Virat"`, `"987"` matches `"9876543210"`.

---

## 7. MatchScoreState Response Shape

Every score endpoint returns this object:

```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
  "battingTeamId": "team-a-uuid",
  "bowlingTeamId": "team-b-uuid",
  "currentInnings": 1,
  "innings1Complete": false,
  "innings2Complete": false,
  "matchComplete": false,
  "totalRuns": 42,
  "totalWickets": 2,
  "totalOvers": 0,
  "currentOver": 6,
  "currentBall": 3,
  "target": null,
  "maxOvers": 20,
  "striker": {
    "playerId": "player-uuid-1",
    "playerName": "Virat Kohli",
    "runs": 28,
    "balls": 19,
    "fours": 3,
    "sixes": 1
  },
  "nonStriker": {
    "playerId": "player-uuid-2",
    "playerName": "Rohit Sharma",
    "runs": 12,
    "balls": 15,
    "fours": 1,
    "sixes": 0
  },
  "currentBowler": {
    "playerId": "player-uuid-3",
    "playerName": "Mitchell Starc",
    "overs": 2,
    "runs": 18,
    "wickets": 1,
    "balls": 3
  },
  "lastBalls": [
    {
      "runs": 4,
      "deliveryType": "normal",
      "wicketType": null,
      "batsmanId": "player-uuid-1",
      "bowlerId": "player-uuid-3",
      "outBatsmanId": null,
      "commentary": "FOUR!",
      "timestamp": "2025-03-15T14:12:34.567Z",
      "isLegalDelivery": true,
      "strikerSwapped": false
    },
    {
      "runs": 0,
      "deliveryType": "wicket",
      "wicketType": "bowled",
      "batsmanId": "player-uuid-5",
      "bowlerId": "player-uuid-3",
      "outBatsmanId": "player-uuid-5",
      "commentary": "WICKET! bowled",
      "timestamp": "2025-03-15T14:13:01.234Z",
      "isLegalDelivery": true,
      "strikerSwapped": false
    }
  ],
  "innings1": null,
  "innings2": null,
  "result": null,
  "updatedAt": "2025-03-15T14:13:01.234Z"
}
```

### After 1st Innings Complete

```json
{
  "currentInnings": 2,
  "innings1Complete": true,
  "target": 186,
  "innings1": {
    "runs": 185,
    "wickets": 6,
    "overs": 20,
    "balls": 0,
    "teamId": "team-a-uuid"
  }
}
```

### Match Complete

```json
{
  "matchComplete": true,
  "innings2Complete": true,
  "result": {
    "winner": "Team B Name",
    "winnerTeamId": "team-b-uuid",
    "margin": "Won by 4 wicket(s)",
    "status": "completed"
  }
}
```

---

## 8. Error Responses

All errors return standard NestJS format:

```json
{
  "statusCode": 400,
  "message": "Only tournament organizer can update scores",
  "error": "Bad Request"
}
```

| Status | Message | When |
|--------|---------|------|
| 400 | `This batsman has already been dismissed and cannot bat again.` | Trying to set a dismissed player as striker/non-striker |
| 400 | `Match is already complete. Cannot update score.` | Scoring after match ended |
| 400 | `No balls to undo` | Undo when no balls recorded |
| 400 | `Only tournament organizer can update scores` | Non-organizer trying to score |
| 400 | `Striker and non-striker must be different players.` | Same player as both batsmen |
| 400 | `Search query must be at least 2 characters` | Search query too short |
| 404 | `Match not found` | Invalid matchId |
| 404 | `Tournament not found` | Invalid tournamentId |
| 401 | `Unauthorized` | Missing/invalid JWT token |

---

## 9. Enums Reference

### DeliveryType
| Value | Counts as legal delivery? | Auto-penalty run? |
|-------|--------------------------|-------------------|
| `normal` | ✅ Yes | No |
| `wide` | ❌ No | +1 run |
| `no_ball` | ❌ No | +1 run |
| `bye` | ✅ Yes | No (runs → extras) |
| `leg_bye` | ✅ Yes | No (runs → extras) |
| `wicket` | ✅ Yes | No |

### WicketType
| Value | Bowler gets credit? | Notes |
|-------|-------------------|-------|
| `bowled` | ✅ | Striker out |
| `caught` | ✅ | Striker out |
| `lbw` | ✅ | Striker out |
| `run_out` | ❌ | Can dismiss non-striker via `outBatsmanId` |
| `stumped` | ✅ | Striker out |
| `hit_wicket` | ✅ | Striker out |

### Match Status
`"scheduled"` → `"ongoing"` → `"completed"`
