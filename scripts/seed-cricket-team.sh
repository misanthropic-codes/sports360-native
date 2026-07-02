#!/usr/bin/env bash
# Seed 11 cricket players: 1 captain + 10 squad members on one T20 team.
set -euo pipefail

BASE_URL="${BASE_URL:-https://hrzjh3ht-8080.inc1.devtunnels.ms/api/v1}"
BATCH_ID="${BATCH_ID:-$(date +%s)}"
TEAM_CODE="MSXI${BATCH_ID: -6}"
TEAM_NAME="Mumbai Strikers ${BATCH_ID: -6}"

json_get() {
  python3 -c "import sys,json; d=json.load(sys.stdin); $1" <<<"$2"
}

register_player() {
  local idx="$1" name="$2" email="$3" phone="$4" password="$5" dob="$6"
  local resp
  resp=$(curl -s -X POST "$BASE_URL/auth/register/" \
    -H "Content-Type: application/json" \
    -d "{
      \"fullName\": \"$name\",
      \"email\": \"$email\",
      \"dateOfBirth\": \"$dob\",
      \"profilePicUrl\": \"https://example.com/profile.jpg\",
      \"phone\": \"$phone\",
      \"password\": \"$password\",
      \"role\": \"player\"
    }")
  local id
  id=$(json_get "print(d['data'][0]['id'])" "$resp")
  if [[ -z "$id" || "$id" == "None" ]]; then
    echo "Registration failed for $name: $resp" >&2
    exit 1
  fi
  echo "$id"
}

login_player() {
  local email="$1" password="$2"
  local resp token
  resp=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$email\",\"password\":\"$password\"}")
  token=$(json_get "print(d.get('data',{}).get('token',''))" "$resp")
  if [[ -z "$token" || "$token" == "None" ]]; then
    echo "Login failed for $email: $resp" >&2
    exit 1
  fi
  echo "$token"
}

complete_cricket_profile() {
  local token="$1" position="$2" batting="$3" bowling="$4" experience="$5" location="$6" bio="$7" captain_avail="$8"
  curl -s -X POST "$BASE_URL/user/cricket-profile" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "{
      \"playingPosition\": \"$position\",
      \"bowlingStyle\": \"$bowling\",
      \"battingStyle\": \"$batting\",
      \"experienceLevel\": \"$experience\",
      \"location\": \"$location\",
      \"bio\": \"$bio\",
      \"profilePicUrl\": \"https://example.com/profile.jpg\",
      \"availableForTeamSelection\": true,
      \"availableForCaptain\": $captain_avail,
      \"receiveTournamentNotifications\": true
    }" >/dev/null
}

echo "=== Seeding cricket team (batch $BATCH_ID) ==="

# Player roster: name | position | batting | bowling | experience | location | bio | is_captain
declare -a NAMES POSITIONS BATTING BOWLING EXPERIENCE LOCATIONS BIOS
NAMES=(
  "Arjun Mehta"
  "Rohan Sharma"
  "Vikram Singh"
  "Karan Patel"
  "Nikhil Desai"
  "Amit Verma"
  "Suresh Iyer"
  "Deepak Nair"
  "Manish Gupta"
  "Prateek Joshi"
  "Rahul Khanna"
)
POSITIONS=(wicket_keeper batsman batsman batsman allrounder allrounder bowler bowler bowler bowler bowler)
BATTING=(right_handed right_handed right_handed left_handed right_handed left_handed right_handed right_handed right_handed right_handed right_handed)
BOWLING=(right_arm_medium right_handed right_arm_spin left_arm_spin right_arm_medium left_arm_medium right_arm_fast right_arm_fast right_arm_medium right_arm_spin right_arm_fast)
EXPERIENCE=(professional intermediate intermediate intermediate intermediate intermediate intermediate beginner intermediate intermediate intermediate)
LOCATIONS=("Mumbai, India" "Mumbai, India" "Pune, India" "Mumbai, India" "Delhi, India" "Bangalore, India" "Chennai, India" "Hyderabad, India" "Kolkata, India" "Ahmedabad, India" "Jaipur, India")
BIOS=("Team captain and wicket keeper" "Opening batsman" "Middle order batsman" "Top order batsman" "Batting all-rounder" "Spin bowling all-rounder" "Fast bowler" "Opening bowler" "Death overs specialist" "Off spinner" "Backup fast bowler")

declare -a USER_IDS EMAILS PASSWORDS TOKENS

for i in "${!NAMES[@]}"; do
  idx=$((i + 1))
  padded=$(printf "%02d" "$idx")
  email="player${padded}.${BATCH_ID}@sports360.test"
  phone="+91${BATCH_ID: -8}${padded}"
  password="Sports360!P${padded}"

  echo "Registering ${NAMES[$i]}..."
  user_id=$(register_player "$idx" "${NAMES[$i]}" "$email" "$phone" "$password" "199$((5 + i % 5))-0$((1 + i % 8))-1$((0 + i % 9))")
  token=$(login_player "$email" "$password")
  captain_avail="false"
  [[ "$idx" -eq 1 ]] && captain_avail="true"
  complete_cricket_profile "$token" "${POSITIONS[$i]}" "${BATTING[$i]}" "${BOWLING[$i]}" "${EXPERIENCE[$i]}" "${LOCATIONS[$i]}" "${BIOS[$i]}" "$captain_avail"

  USER_IDS+=("$user_id")
  EMAILS+=("$email")
  PASSWORDS+=("$password")
  TOKENS+=("$token")
done

CAPTAIN_TOKEN="${TOKENS[0]}"
echo "Creating team..."
team_resp=$(curl -s -X POST "$BASE_URL/team/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CAPTAIN_TOKEN" \
  -d "{
    \"name\": \"$TEAM_NAME\",
    \"description\": \"Full playing XI seeded via API batch $BATCH_ID\",
    \"location\": \"Mumbai, India\",
    \"sport\": \"cricket\",
    \"teamType\": \"T20\",
    \"teamSize\": 11,
    \"code\": \"$TEAM_CODE\",
    \"logoUrl\": \"https://placehold.co/128x128/10B981/FFFFFF?text=MSXI\",
    \"isActive\": true
  }")

TEAM_ID=$(json_get "print(d['data']['team']['id'])" "$team_resp")
if [[ -z "$TEAM_ID" || "$TEAM_ID" == "None" ]]; then
  echo "Team creation failed: $team_resp" >&2
  exit 1
fi

echo "Adding squad members to team $TEAM_ID..."
for i in "${!USER_IDS[@]}"; do
  [[ "$i" -eq 0 ]] && continue
  curl -s -X POST "$BASE_URL/team/$TEAM_ID/member" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CAPTAIN_TOKEN" \
    -d "{\"userId\":\"${USER_IDS[$i]}\"}" >/dev/null
done

members_resp=$(curl -s "$BASE_URL/team/$TEAM_ID/members" -H "Authorization: Bearer $CAPTAIN_TOKEN")
member_count=$(json_get "print(len(d.get('data',[])))" "$members_resp")

echo ""
echo "=== SEED COMPLETE ==="
echo "Team ID:    $TEAM_ID"
echo "Team Name:  $TEAM_NAME"
echo "Team Code:  $TEAM_CODE"
echo "Members:    $member_count / 11"
echo ""
echo "=== PLAYER CREDENTIALS ==="
printf "%-4s %-22s %-40s %-36s %-18s %s\n" "#" "Name" "Email" "User ID" "Password" "Role"
for i in "${!NAMES[@]}"; do
  idx=$((i + 1))
  role="player"
  [[ "$idx" -eq 1 ]] && role="captain"
  printf "%-4s %-22s %-40s %-36s %-18s %s\n" "$idx" "${NAMES[$i]}" "${EMAILS[$i]}" "${USER_IDS[$i]}" "${PASSWORDS[$i]}" "$role"
done
