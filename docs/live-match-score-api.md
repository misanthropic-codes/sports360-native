# Live Match & Score Module — API Reference

API contract for the Sports360 live match viewer and scorer. Derived from `api/scoreApi.ts`, `api/tournamentApi.ts`, `api/guest/guestApi.ts`, and `utils/socketService.ts`.

---

## Base URL & Auth

| Item | Value |
|------|-------|
| **REST base** | `{EXPO_PUBLIC_BASE_URL}/api/v1` |
| **WebSocket namespace** | `{EXPO_PUBLIC_BASE_URL}/score` |
| **Auth header** | `Authorization: Bearer <JWT>` |
| **Content-Type** | `application/json` (all POST/PATCH bodies) |

Score **write** endpoints require a JWT and organizer permissions. Read endpoints and WebSocket are guest-accessible unless noted.

---

## Route Summary

| Method | Route | Auth | Used by |
|--------|-------|------|---------|
| `POST` | `/auth/login` | No | Get JWT before scoring |
| `GET` | `/matches/:matchId` | Yes | Match details, team IDs |
| `PATCH` | `/matches/:matchId/status` | Yes | Set `ongoing` / `completed` |
| `GET` | `/matches/live` | No | Public live matches list |
| `GET` | `/matches/my-live` | Yes | Authenticated user's live matches |
| `GET` | `/team/:teamId/members` | Yes | Build playing XI |
| `GET` | `/team/:teamId/matches/:matchId/players` | Yes | Match-specific squad (optional) |
| `POST` | `/score/set-players` | Yes | Set striker, non-striker, bowler |
| `POST` | `/score/ball` | Yes | Record a delivery |
| `POST` | `/score/change-bowler` | Yes | Change bowler after over |
| `POST` | `/score/swap-batsmen` | Yes | Manual strike swap |
| `POST` | `/score/reset-ball/:matchId` | Yes | Undo last ball |
| `POST` | `/score/reset/:matchId` | Yes | Reset entire match score |
| `GET` | `/score/:matchId` | Optional | Current score state |
| `GET` | `/score/:matchId/dismissed` | Optional | Dismissed batsman UUIDs |
| WS | `subscribeToMatch` / `unsubscribeFromMatch` | No | Real-time score updates |
| WS | `scoreUpdate` (event) | No | Push score changes |

---

## Scoring Flow

```
Login → GET /matches/:id → GET /team/:teamId/members (×2)
     → PATCH /matches/:id/status { "status": "ongoing" }
     → POST /score/set-players
     → loop: POST /score/ball
            → on wicket: POST /score/set-players (new batsman)
            → on over end: POST /score/change-bowler
            → on innings end: POST /score/set-players (chasing team)
     → PATCH /matches/:id/status { "status": "completed" }
```

### Frontend screens

| Screen | Path | APIs used |
|--------|------|-----------|
| Match router | `/match/[id]` | `GET /matches/:id`, `GET /score/:id` |
| Set players | `/match/[id]/set-players` | `GET /matches/:id`, `GET /team/.../members`, `POST /score/set-players`, `PATCH /matches/:id/status` |
| Scorer | `/match/[id]/scorer` | All score write endpoints |
| Live view | `/match/[id]/live` | `GET /score/:id`, WebSocket |

---

## 1. Prerequisite Routes

### 1.1 Login

```
POST /api/v1/auth/login
```

**Request**
```json
{
  "identifier": "organizer@example.com",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "fullName": "John Doe",
    "email": "organizer@example.com",
    "role": "organizer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "domains": ["cricket"],
    "isVerified": "true",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 1.2 Get Match Details

```
GET /api/v1/matches/:matchId
Authorization: Bearer <token>
```

**Response `200`**
```json
{
  "match": {
    "id": "match-uuid",
    "tournamentId": "tournament-uuid",
    "round": 1,
    "matchNumber": 3,
    "teamAId": "team-a-uuid",
    "teamBId": "team-b-uuid",
    "teamA": { "id": "team-a-uuid", "name": "Team A" },
    "teamB": { "id": "team-b-uuid", "name": "Team B" },
    "matchTime": "2025-03-15T14:00:00.000Z",
    "matchType": "group",
    "matchMode": "t20",
    "status": "scheduled",
    "scoreA": null,
    "scoreB": null,
    "result": null,
    "winnerTeamId": null,
    "isBye": false,
    "createdAt": "2025-03-01T00:00:00.000Z",
    "updatedAt": "2025-03-01T00:00:00.000Z"
  }
}
```

---

### 1.3 Update Match Status

```
PATCH /api/v1/matches/:matchId/status
Authorization: Bearer <token>
```

**Request**
```json
{
  "status": "ongoing"
}
```

Valid values: `"scheduled"` → `"ongoing"` → `"completed"`

**Response `200`**
```json
{
  "message": "Match status updated",
  "match": {
    "id": "match-uuid",
    "status": "ongoing"
  }
}
```

---

### 1.4 Get Team Members (Playing XI)

```
GET /api/v1/team/:teamId/members
Authorization: Bearer <token>
```

Call once per team. Filter out `isBenched: true` on the client.

**Response `200`**
```json
{
  "data": [
    {
      "teamId": "team-a-uuid",
      "userId": "player-uuid-1",
      "fullName": "Virat Kohli",
      "email": "virat@example.com",
      "role": "captain",
      "isActive": true,
      "isBenched": false,
      "playingPosition": "batsman",
      "battingStyle": "right_handed",
      "bowlingStyle": "right_arm_medium"
    }
  ]
}
```

Use `userId` as `strikerId`, `nonStrikerId`, `bowlerId`, `batsmanId` in score APIs.

---

### 1.5 Get Match-Specific Players (optional)

```
GET /api/v1/team/:teamId/matches/:matchId/players
Authorization: Bearer <token>
```

**Response `200`**
```json
{
  "data": [
    {
      "userId": "player-uuid-1",
      "fullName": "Virat Kohli",
      "role": "player"
    }
  ]
}
```

---

## 2. Live Match List Routes

### 2.1 Public Live Matches

```
GET /api/v1/matches/live
```

No auth required.

**Response `200`**
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

---

### 2.2 My Live Matches (authenticated)

```
GET /api/v1/matches/my-live
Authorization: Bearer <token>
```

**Response `200`**
```json
{
  "matches": [
    {
      "id": "match-uuid",
      "tournamentId": "tournament-uuid",
      "teamAId": "team-a-uuid",
      "teamBId": "team-b-uuid",
      "status": "ongoing",
      "scoreA": "42/2 (6.3)",
      "scoreB": null
    }
  ]
}
```

---

## 3. Score Routes (Organizer)

All write endpoints return a full **`MatchScoreState`** (see [§6](#6-matchscorestate-response)).

---

### 3.1 Set Players

Must be called before the first ball, after every wicket, and after an innings change.

```
POST /api/v1/score/set-players
Authorization: Bearer <token>
```

**Request**
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
| `matchId` | UUID | Yes | |
| `tournamentId` | UUID | Yes | |
| `strikerId` | UUID | Yes | |
| `strikerName` | string | Yes | |
| `nonStrikerId` | UUID | Yes | Must differ from `strikerId` |
| `nonStrikerName` | string | Yes | |
| `bowlerId` | UUID | Yes | |
| `bowlerName` | string | Yes | |
| `maxOvers` | int | No | 1–50, default `20` |

**Response `200`:** `MatchScoreState`

---

### 3.2 Record Ball

```
POST /api/v1/score/ball
Authorization: Bearer <token>
```

**Request — normal delivery (2 runs)**
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

**Request — wicket (bowled)**
```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
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

**Request — run out (non-striker dismissed)**
```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
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

**Request — wide (+2 runs off the wide)**
```json
{
  "runs": 2,
  "deliveryType": "wide",
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
  "batsmanId": "striker-uuid",
  "bowlerId": "bowler-uuid",
  "currentOver": 1,
  "currentBall": 3
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `matchId` | UUID | Yes | |
| `tournamentId` | UUID | Yes | |
| `runs` | int | Yes | 0–7 |
| `deliveryType` | enum | Yes | See [§7](#7-enums) |
| `wicketType` | enum | When `deliveryType = "wicket"` | |
| `batsmanId` | UUID | Yes | Current striker |
| `bowlerId` | UUID | Yes | Current bowler |
| `currentOver` | int | Yes | Completed overs |
| `currentBall` | int | Yes | 0–5 legal balls in current over |
| `isFour` | bool | No | |
| `isSix` | bool | No | |
| `outBatsmanId` | UUID | No | For run-out of non-striker |
| `commentary` | string | No | Auto-generated if omitted |

> Read `batsmanId`, `bowlerId`, `currentOver`, `currentBall` from the latest `MatchScoreState` (`striker.playerId`, `currentBowler.playerId`, etc.).

**Response `200`:** `MatchScoreState`

---

### 3.3 Change Bowler

Required after each over ends.

```
POST /api/v1/score/change-bowler
Authorization: Bearer <token>
```

**Request**
```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid",
  "bowlerId": "new-bowler-uuid",
  "bowlerName": "Jasprit Bumrah"
}
```

**Response `200`:** `MatchScoreState`

---

### 3.4 Swap Batsmen

```
POST /api/v1/score/swap-batsmen
Authorization: Bearer <token>
```

**Request**
```json
{
  "matchId": "match-uuid",
  "tournamentId": "tournament-uuid"
}
```

**Response `200`:** `MatchScoreState`

---

### 3.5 Undo Last Ball

```
POST /api/v1/score/reset-ball/:matchId
Authorization: Bearer <token>
```

**Request**
```json
{
  "tournamentId": "tournament-uuid"
}
```

**Response `200`:** `MatchScoreState`

---

### 3.6 Reset Entire Match

```
POST /api/v1/score/reset/:matchId
Authorization: Bearer <token>
```

**Request**
```json
{
  "tournamentId": "tournament-uuid"
}
```

**Response `200`:** `MatchScoreState` (zeroed)

---

## 4. Score Read Routes

### 4.1 Get Match Score

```
GET /api/v1/score/:matchId
Authorization: Bearer <token>   (optional)
```

**Response `200` — score exists**

Returns `MatchScoreState` directly.

**Response `200` — no score yet**
```json
{
  "message": "No live score data for this match",
  "score": null
}
```

---

### 4.2 Get Dismissed Batsmen

```
GET /api/v1/score/:matchId/dismissed
Authorization: Bearer <token>   (optional)
```

**Response `200`**
```json
["player-uuid-1", "player-uuid-5", "player-uuid-8"]
```

Use to disable dismissed players in the batsman picker.

---

## 5. WebSocket — Real-time Updates

### Connection

```javascript
import { io } from "socket.io-client";

const socket = io(`${BASE_URL}/score`, {
  transports: ["websocket", "polling"],
});
```

No auth required.

### Subscribe / Unsubscribe

```javascript
socket.emit("subscribeToMatch", { matchId: "match-uuid" });
socket.emit("unsubscribeFromMatch", { matchId: "match-uuid" });
```

### Receive updates

```javascript
socket.on("scoreUpdate", ({ type, data }) => {
  switch (type) {
    case "BALL_UPDATE":
    case "UNDO_BALL":
    case "PLAYERS_SET":
    case "BOWLER_CHANGED":
    case "BATSMEN_SWAPPED":
    case "SCORE_RESET":
      // data = MatchScoreState
      break;
    case "INNINGS_COMPLETE":
      // data = { innings, score: { runs, wickets }, target }
      break;
    case "MATCH_COMPLETE":
      // data = { winner, winnerTeamId, margin, status }
      break;
  }
});
```

### Event types

| `type` | `data` shape | When |
|--------|-------------|------|
| `BALL_UPDATE` | `MatchScoreState` | Ball scored |
| `UNDO_BALL` | `MatchScoreState` | Last ball undone |
| `PLAYERS_SET` | `MatchScoreState` | Players configured |
| `BOWLER_CHANGED` | `MatchScoreState` | Bowler changed |
| `BATSMEN_SWAPPED` | `MatchScoreState` | Strike swapped |
| `SCORE_RESET` | `MatchScoreState` | Full reset |
| `INNINGS_COMPLETE` | `{ innings, score, target }` | Innings ended |
| `MATCH_COMPLETE` | `{ winner, winnerTeamId, margin, status }` | Match finished |

---

## 6. MatchScoreState Response

Returned by all score write endpoints and `GET /score/:matchId` (when score exists).

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
  "totalOvers": 6.3,
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
    }
  ],
  "innings1": null,
  "innings2": null,
  "result": null,
  "updatedAt": "2025-03-15T14:13:01.234Z"
}
```

### After 1st innings

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

### Match complete

```json
{
  "matchComplete": true,
  "innings2Complete": true,
  "result": {
    "winner": "Team B",
    "winnerTeamId": "team-b-uuid",
    "margin": "Won by 4 wicket(s)",
    "status": "completed"
  }
}
```

---

## 7. Enums

### `DeliveryType`

| Value | Legal delivery? | Auto penalty |
|-------|----------------|--------------|
| `normal` | Yes | — |
| `wide` | No | +1 run |
| `no_ball` | No | +1 run |
| `bye` | Yes | Runs → extras |
| `leg_bye` | Yes | Runs → extras |
| `wicket` | Yes | — |

### `WicketType`

| Value | Bowler credit | Notes |
|-------|--------------|-------|
| `bowled` | Yes | Striker out |
| `caught` | Yes | Striker out |
| `lbw` | Yes | Striker out |
| `run_out` | No | Use `outBatsmanId` for non-striker |
| `stumped` | Yes | Striker out |
| `hit_wicket` | Yes | Striker out |

---

## 8. Error Responses

Standard NestJS error format:

```json
{
  "statusCode": 400,
  "message": "Only tournament organizer can update scores",
  "error": "Bad Request"
}
```

| Status | Message | When |
|--------|---------|------|
| `400` | `Striker and non-striker must be different players.` | Invalid player selection |
| `400` | `This batsman has already been dismissed and cannot bat again.` | Dismissed player selected |
| `400` | `Match is already complete. Cannot update score.` | Scoring after match end |
| `400` | `No balls to undo` | Undo with no balls recorded |
| `400` | `Only tournament organizer can update scores` | Non-organizer scoring |
| `401` | `Unauthorized` | Missing or invalid JWT |
| `404` | `Match not found` | Invalid `matchId` |
| `404` | `Tournament not found` | Invalid `tournamentId` |

---

## 9. Client-Side State Checks

After each score API call, inspect `MatchScoreState`:

```javascript
if (state.matchComplete) {
  // Show result — state.result.margin
}
if (state.innings1Complete && state.currentInnings === 2) {
  // Show target — state.target
}
if (state.currentBall === 0 && state.currentOver > 0) {
  // Over ended — prompt bowler change
}
if (state.totalWickets > previousWickets) {
  // Wicket — prompt new batsman via set-players
}
```

| Scenario | Action |
|----------|--------|
| After wicket | `POST /score/set-players` with new batsman |
| After over ends | `POST /score/change-bowler` |
| After 1st innings | `POST /score/set-players` with chasing team's openers |
| Undo mistake | `POST /score/reset-ball/:matchId` |
| Manual strike swap | `POST /score/swap-batsmen` |
