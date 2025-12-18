# Sports360 - Multi-Sport Tournament & Ground Booking Platform

## Overview

Sports360 is a comprehensive React Native mobile application designed for managing sports tournaments, team coordination, ground bookings, and player analytics. The platform supports multiple sports (Cricket, Marathon) and serves three distinct user roles: **Players**, **Organizers**, and **Ground Owners**.

**Version:** 1.0.0  
**Package:** com.misanthropic96.sports360  
**Framework:** Expo SDK 54 with React Native 0.81.4

---

## 📱 Project Structure

```
sports360-native/
├── api/                      # API client services
│   ├── api.ts               # Base Axios instance with auth interceptor
│   ├── bookingApi.ts        # Ground booking & browsing APIs
│   ├── reviewApi.ts         # Review & rating APIs
│   ├── teamApi.ts           # Team management APIs
│   ├── tournamentApi.ts     # Tournament & match APIs
│   └── userApi.ts           # User profiles & analytics APIs
│
├── app/                      # Expo Router screens
│   ├── (root)/              # Authentication screens
│   │   ├── index.tsx        # Landing page
│   │   ├── login.tsx        # Login screen
│   │   └── signup.tsx       # Signup screen
│   ├── booking/             # Ground booking module
│   ├── dashboard/           # Role-specific dashboards
│   ├── feed/                # Sports feeds (Cricket, Marathon)
│   ├── ground_owner/        # Ground owner features
│   ├── onboarding/          # Role & sport selection
│   ├── reviews/             # Review management
│   ├── team/                # Team management
│   ├── tournament/          # Tournament management
│   └── profile.tsx          # User profile screen
│
├── components/              # Reusable UI components (61 files)
│   ├── Tournament/          # Tournament-specific components
│   ├── Ground-owner/        # Ground owner components
│   └── Ui/                  # Generic UI components
│
├── store/                   # Zustand state management
│   ├── bookingStore.ts      # Booking state
│   ├── groundStore.ts       # Grounds state
│   ├── teamStore.ts         # Teams state
│   ├── tournamentStore.ts   # Tournaments state
│   └── userStore.ts         # User profile state
│
├── constants/              # App constants
│   └── colors.ts           # Centralized color scheme (role-based)
│
├── hooks/                   # Custom React hooks
│   └── useThemeColors.ts   # Theme colors hook
│
├── context/                 # React Context (Auth)
├── utils/                   # Helper utilities
└── assets/                  # Static assets (fonts, images)
```

**Total Structure:**  
- 53 directories  
- 182 files  
- 132+ TSX components  
- 9 Zustand stores  
- 6 API service modules

---

## 🔧 Dependencies

### Core Dependencies (46 total)

#### **Framework**
- `expo`: ^54.0.11 - Expo SDK for React Native development
- `react`: 19.1.0 - Core React library
- `react-native`: 0.81.4 - React Native framework
- `expo-router`: ~6.0.9 - File-based routing system

#### **Navigation**
- `@react-navigation/native`: ^7.1.6 - Navigation container
- `@react-navigation/bottom-tabs`: ^7.3.10 - Bottom tab navigation
- `@react-navigation/stack`: ^7.4.2 - Stack navigation
- `react-native-screens`: ~4.16.0 - Native screen optimization
- `react-native-safe-area-context`: ~5.6.0 - Safe area handling

#### **UI & Styling**
- `nativewind`: ^4.1.23 - TailwindCSS for React Native
- `tailwindcss`: ^3.4.17 - Utility-first CSS framework
- `lucide-react-native`: ^0.536.0 - Icon library
- `phosphor-react-native`: ^3.0.0 - Alternative icon set
- `react-native-vector-icons`: ^10.3.0 - Vector icons
- `react-native-svg`: ^15.14.0 - SVG rendering
- `expo-blur`: ~15.0.7 - Blur effects
- `expo-image`: ~3.0.8 - Optimized image component

#### **State Management & Storage**
- `zustand`: ^5.0.8 - Lightweight state management
- `@react-native-async-storage/async-storage`: 2.2.0 - Persistent storage

#### **HTTP & API**
- `axios`: ^1.11.0 - HTTP client for API requests

#### **Forms & Inputs**
- `@react-native-community/datetimepicker`: 8.4.4 - Date/time picker
- `@react-native-picker/picker`: 2.11.1 - Native picker component
- `expo-image-picker`: ~17.0.8 - Image selection

#### **Charts & Analytics**
- `victory`: ^37.3.6 - Data visualization
- `victory-native`: ^35.5.5 - Native charts

#### **Animations & Gestures**
- `react-native-reanimated`: ~4.1.1 - Animation library
- `react-native-gesture-handler`: ~2.28.0 - Gesture handling
- `react-native-modal`: ^14.0.0-rc.1 - Modal component
- `expo-haptics`: ~15.0.7 - Haptic feedback

#### **Utilities**
- `expo-constants`: ~18.0.9 - App constants
- `expo-linking`: ~8.0.8 - Deep linking
- `expo-font`: ~14.0.8 - Custom fonts
- `expo-splash-screen`: ~31.0.10 - Splash screen
- `expo-status-bar`: ~3.0.8 - Status bar control
- `expo-system-ui`: ~6.0.7 - System UI configuration

### Dev Dependencies
- `typescript`: ~5.9.2 - TypeScript support
- `@types/react`: ^19.1.16 - React type definitions
- `eslint`: ^9.25.0 - Code linting
- `@babel/core`: ^7.25.2 - JavaScript compiler

---

## 🎨 Design System

### Centralized Color Scheme

All colors are centralized in `constants/colors.ts` for consistent theming across the app.

**Role-Based Colors:**
- **Player:** Blue theme (#2563EB)
- **Organizer:** Purple theme (#7C3AED)
- **Ground Owner:** Green theme (#15803d)

**Usage:**
```typescript
import { useThemeColors } from '@/hooks/useThemeColors';

const MyComponent = () => {
  const colors = useThemeColors(); // Auto-detects user role
  return <View style={{ backgroundColor: colors.primary }} />;
};
```

**Common Colors:**
- Gray scale (50-900)
- Semantic colors (error, success, warning, info)
- All with light/dark variants

---

## 📡 API Documentation

### Base Configuration
- **Base URL:** `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1`
- **Authentication:** Bearer Token (JWT)
- **Headers:** `Content-Type: application/json`

### Authentication

**Public Endpoints (No Auth Required):**
- `POST /auth/login` - User login
- `POST /auth/register/` - User registration

**All Other Endpoints:** Require authentication via Bearer token in Authorization header. Token is automatically added by axios interceptor.

**Error Handling:**
- **401:** Session expired → Auto-logout modal
- **500+:** Server error → Error modal
- **Network errors:** Connection error modal

### API Endpoints (74+ total)

#### 1️⃣ **User Profile APIs** (`userApi.ts`)

| Endpoint | Method | Description | Used In |
|----------|--------|-------------|---------|
| `/user/profile` | GET | Get user profile | `profile.tsx`, `edit-cricket.tsx`, `edit-organizer.tsx` |
| `/user/cricket-profile` | POST | Create/Update cricket profile | `edit-cricket.tsx`, `onboarding/player/cricket-form.tsx` |
| `/user/marathon-profile` | POST | Create/Update marathon profile | `onboarding/player/marathon-form.tsx` |
| `/user/profile` | PUT | Update organizer profile | `edit-organizer.tsx` |
| `/user/tournaments` | GET | Get user's tournaments (with filters) | Player dashboard screens |
| `/user/tournaments/:tournamentId/matches` | GET | Get matches for a tournament | Player dashboard, tournament views |
| `/user/matches/:matchId/team` | GET | Get team members for a match | Match details screens |
| `/user/analytics` | GET | Get player analytics & statistics | `dashboard/player/cricket.tsx`, `dashboard/player/marathon.tsx` |

**Screens:** `profile.tsx`, `edit-cricket.tsx`, `edit-organizer.tsx`, `dashboard/player/*`

---

#### 2️⃣ **Tournament APIs** (`tournamentApi.ts`)

| Endpoint | Method | Description | Used In |
|----------|--------|-------------|---------|
| `/tournament/all` | GET | Get all tournaments | `feed/cricket.tsx`, `feed/marathon-feed.tsx` |
| `/tournament/get/:id` | GET | Get tournament by ID | `tournament/ViewTournament.tsx`, `tournament/ManageTournament.tsx` |
| `/tournament/get/:id/teams` | GET | Get teams in tournament | `tournament/ViewTournament.tsx`, Tournament components |
| `/tournament/update/:id` | PUT | Update tournament | `tournament/editTournament.tsx` |
| `/tournament/delete/:id` | DELETE | Delete tournament | `tournament/ManageTournament.tsx` |
| `/tournament/:id/join` | POST | Join tournament with team | `tournament/JoinTournament.tsx` |
| `/team/my-teams` | GET | Get user's teams | Multiple team selection screens |
| `/ground-owner/my-grounds` | GET | Get ground owner's grounds | `ground_owner/myGrounds.tsx` |

**Screens:** `feed/cricket.tsx`, `tournament/ViewTournament.tsx`, `tournament/JoinTournament.tsx`, `tournament/editTournament.tsx`

---

#### 3️⃣ **Match APIs** (`tournamentApi.ts`)

| Endpoint | Method | Description | Used In |
|----------|--------|-------------|---------|
| `/matches/generate-fixtures` | POST | Generate tournament fixtures | `tournament/GenerateFixtures.tsx`, `fixtures/GenerateFixture.tsx` |
| `/matches/:id` | GET | Get match details by ID | Match detail screens |
| `/organizer-profile/tournament/:tournamentId/match/:matchId` | DELETE | Delete a match | Tournament management |
| `/matches/:matchId/status` | PATCH | Update match status | Match management screens |

**Screens:** `tournament/GenerateFixtures.tsx`, `fixtures/GenerateFixture.tsx`, Match components

---

#### 4️⃣ **Team Management APIs** (`teamApi.ts`)

| Endpoint | Method | Description | Used In |
|----------|--------|-------------|---------|
| `/team/create` | POST | Create a new team | `team/CreateTeam.tsx` |
| `/team/my-teams` | GET | Get user's teams (with sport filter) | `team/Myteam.tsx` |
| `/team/:id` | GET | Get team by ID | `team/ViewTeam.tsx` |
| `/team/:id/details` | GET | Get team details (players, matches, tournaments) | `team/ViewTeam.tsx`, `team/ManageTeam/ManageTeam.tsx` |
| `/team/:id` | DELETE | Delete team (captain only) | `team/ManageTeam/ManageTeam.tsx` |
| `/team/all` | GET | Browse all teams (with filters) | Team browsing screens |
| `/team/:id/member` | POST | Add team member (captain only) | `team/ManageTeam/TeamMembers.tsx` |
| `/team/:id/member/:memberId` | DELETE | Remove team member | `team/ManageTeam/TeamMembers.tsx` |
| `/team/:id/members` | GET | List all team members | `team/ManageTeam/TeamMembers.tsx`, `team/ViewTeam.tsx` |
| `/team/:id/member/:memberId/bench` | PUT | Bench a member | `team/ManageTeam/TeamMembers.tsx` |
| `/team/:id/member/:memberId/unbench` | PUT | Unbench a member | `team/ManageTeam/TeamMembers.tsx` |
| `/team/:id/request` | POST | Request to join a team | Team join screens |
| `/team/:id/join-requests` | GET | View join requests (captain only) | `team/ManageTeam/JoinRequest.tsx` |
| `/team/:id/join-requests/:memberId/approve` | POST | Approve join request | `team/ManageTeam/JoinRequest.tsx` |
| `/team/:id/join-requests/:memberId/reject` | POST | Reject join request | `team/ManageTeam/JoinRequest.tsx` |
| `/team/:id/tournaments` | GET | Get team's tournaments | `team/ManageTeam/Tournament.tsx` |
| `/team/:id/matches` | GET | Get team's matches | `team/ManageTeam/Matches.tsx` |
| `/team/:teamId/matches/:matchId/players` | GET | Get players for a match | Match selection screens |
| `/team/:teamId/tournament-invitations` | GET | View tournament invitations | `team/ManageTeam/TournamentInvitations.tsx` |
| `/team/:teamId/tournament-invitations/:tournamentId/respond` | PUT | Accept/Reject tournament invitation | `team/ManageTeam/TournamentInvitations.tsx` |

**Screens:** `team/CreateTeam.tsx`, `team/ViewTeam.tsx`, `team/Myteam.tsx`, `team/ManageTeam/*`

---

#### 5️⃣ **Booking APIs** (`bookingApi.ts`)

| Endpoint | Method | Description | Used In |
|----------|--------|-------------|---------|
| `/booking/grounds/all` | GET | Browse all available grounds | `booking/BrowseGrounds.tsx` |
| `/booking/grounds/available` | GET | Search grounds by time availability | `booking/BrowseGrounds.tsx`, `booking/CreateBooking.tsx` |
| `/booking/request` | POST | Create a booking request | `booking/CreateBooking.tsx` |
| `/booking/my-bookings` | GET | Get user's bookings (with status filter) | `booking/MyBookings.tsx` |
| `/booking/:id` | DELETE | Cancel a booking | `booking/MyBookings.tsx` |
| `/booking/status` | GET | Get booking status (role-aware) | Ground owner & organizer screens |

**Screens:** `booking/BrowseGrounds.tsx`, `booking/CreateBooking.tsx`, `booking/MyBookings.tsx`, `booking/GroundDetails.tsx`

---

#### 6️⃣ **Review APIs** (`reviewApi.ts`)

| Endpoint | Method | Description | Used In |
|----------|--------|-------------|---------|
| `/review/create` | POST | Create a review for a ground | `reviews/CreateReview.tsx` |
| `/review/:reviewId` | PUT | Update an existing review | `reviews/MyReviews.tsx` |
| `/review/:reviewId` | DELETE | Delete a review | `reviews/MyReviews.tsx` |
| `/review/my-reviews` | GET | Get user's reviews (paginated) | `reviews/MyReviews.tsx` |
| `/review/ground/:groundId` | GET | Get reviews for a ground (public) | `booking/GroundDetails.tsx` |
| `/review/ground/:groundId/stats` | GET | Get ground rating statistics | `booking/GroundDetails.tsx` |

**Screens:** `reviews/CreateReview.tsx`, `reviews/MyReviews.tsx`, `booking/GroundDetails.tsx`

---

## 🗺️ API-to-Screen Mapping

### Authentication & Onboarding
- **`(root)/login.tsx`** - Login authentication
- **`(root)/signup.tsx`** - User registration
- **`onboarding/choose-domain.tsx`** - Role selection (Player/Organizer/Ground Owner)
- **`onboarding/player/cricket-form.tsx`** → `/user/cricket-profile` (POST)
- **`onboarding/player/marathon-form.tsx`** → `/user/marathon-profile` (POST)

### Player Dashboard
- **`dashboard/player/cricket.tsx`** → `/user/analytics`, `/user/tournaments`
- **`dashboard/player/marathon.tsx`** → `/user/analytics`, `/user/tournaments`
- **`profile.tsx`** → `/user/profile` (GET)
- **`edit-cricket.tsx`** → `/user/cricket-profile` (POST), `/user/profile` (GET)
- **`edit-organizer.tsx`** → `/user/profile` (PUT, GET)

### Tournament Management
- **`feed/cricket.tsx`** → `/tournament/all` (GET)
- **`feed/marathon-feed.tsx`** → `/tournament/all` (GET)
- **`tournament/ViewTournament.tsx`** → `/tournament/get/:id`, `/tournament/get/:id/teams`
- **`tournament/JoinTournament.tsx`** → `/tournament/:id/join` (POST), `/team/my-teams`
- **`tournament/createTournament.tsx`** → `/tournament/create` (POST)
- **`tournament/editTournament.tsx`** → `/tournament/update/:id` (PUT)
- **`tournament/GenerateFixtures.tsx`** → `/matches/generate-fixtures` (POST)
- **`tournament/InviteTeam.tsx`** → Team invitation APIs

### Team Management
- **`team/CreateTeam.tsx`** → `/team/create` (POST)
- **`team/Myteam.tsx`** → `/team/my-teams` (GET)
- **`team/ViewTeam.tsx`** → `/team/:id`, `/team/:id/members`
- **`team/ManageTeam/TeamMembers.tsx`** → `/team/:id/members`, `/team/:id/member` (POST/DELETE), bench/unbench
- **`team/ManageTeam/JoinRequest.tsx`** → `/team/:id/join-requests`, approve/reject
- **`team/ManageTeam/Tournament.tsx`** → `/team/:id/tournaments`
- **`team/ManageTeam/Matches.tsx`** → `/team/:id/matches`
- **`team/ManageTeam/TournamentInvitations.tsx`** → `/team/:teamId/tournament-invitations`, respond

### Ground Booking
- **`booking/BrowseGrounds.tsx`** → `/booking/grounds/all`, `/booking/grounds/available`
- **`booking/GroundDetails.tsx`** → `/review/ground/:groundId`, `/review/ground/:groundId/stats`
- **`booking/CreateBooking.tsx`** → `/booking/request` (POST)
- **`booking/MyBookings.tsx`** → `/booking/my-bookings`, `/booking/:id` (DELETE)

### Reviews
- **`reviews/CreateReview.tsx`** → `/review/create` (POST)
- **`reviews/MyReviews.tsx`** → `/review/my-reviews`, `/review/:reviewId` (PUT/DELETE)

### Ground Owner
- **`ground_owner/myGrounds.tsx`** → `/ground-owner/my-grounds`
- **`ground_owner/PostGround.tsx`** → Ground creation APIs
- **`ground_owner/Analytics.tsx`** → Analytics APIs
- **`ground_owner/Booking.tsx`** → `/booking/status`

---

## 🎯 Technical Requirements

### Development Environment
- **Node.js:** >= 16.17.3 (as per eas.json)
- **Package Manager:** npm
- **Expo CLI:** Compatible with Expo SDK 54
- **TypeScript:** ~5.9.2

### Runtime Requirements
- **iOS:** iOS 13.4+ (supports iPad)
- **Android:** API Level 21+ (Android 5.0+)
- **React Native:** New Architecture enabled (`newArchEnabled: true`)

### Environment Variables
Create a `.env` file with:
```
EXPO_PUBLIC_BASE_URL=<your_backend_api_url>
```

### Build Configuration (EAS)
- **Development:** Internal distribution with development client
- **Preview:** Internal APK builds for testing
- **Production:** Auto-increment versioning

---

## 📦 Expected Bundle Size

### Estimated APK/IPA Size

Based on the dependencies and assets:

| Build Type | Estimated Size | Notes |
|------------|---------------|-------|
| **Development** | ~80-100 MB | Includes dev tools, debugging symbols |
| **Preview (APK)** | ~40-60 MB | Optimized but not fully compressed |
| **Production (APK)** | ~35-50 MB | ProGuard/R8 enabled, optimized assets |
| **Production (IPA)** | ~40-55 MB | Bitcode disabled, app thinning enabled |

**Size Contributors:**
- React Native core: ~15 MB
- Expo SDK modules: ~10-15 MB
- Victory charts: ~5-8 MB
- Icons (Lucide, Phosphor, Vector): ~3-5 MB
- Reanimated & Gesture Handler: ~5-7 MB
- Custom fonts (Rubik): ~2 MB
- Images & assets: ~2-3 MB

**Optimization Recommendations:**
1. Enable Hermes JavaScript engine (already in Expo 54)
2. Use `expo-optimize` for image compression
3. Implement code splitting for large screens
4. Use `react-native-bundle-visualizer` to analyze bundle

---

## 🚀 Getting Started

### Installation
```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Build Commands
```bash
# Development build
eas build --profile development --platform android

# Preview APK
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all
```

---

## 🏗️ State Management Architecture

### Zustand Stores

1. **`userStore.ts`** - User profile, authentication state
2. **`teamStore.ts`** - User's teams, team cache
3. **`teamDetailsStore.ts`** - Detailed team data, members, matches
4. **`tournamentStore.ts`** - Tournament listings, cache
5. **`groundStore.ts`** - Ground owner's grounds
6. **`bookingStore.ts`** - User bookings, booking requests
7. **`playerAnalyticsStore.ts`** - Player statistics
8. **`organizerAnalyticsStore.ts`** - Organizer analytics

**Store Pattern:**
- Persistent state for user data
- API response caching to minimize network calls
- Smart refetching (only on POST or explicit refresh)
- Loading & error state management

---

## 🎨 UI/UX Features

### Design System
- **Styling:** NativeWind (TailwindCSS)
- **Color Scheme:** Centralized role-based theming (`constants/colors.ts`)
- **Typography:** Rubik font family (14 variants)
- **Icons:** Lucide React Native, Phosphor Icons
- **Animations:** React Native Reanimated 4.1
- **Gestures:** React Native Gesture Handler

### Recent UI Improvements

**Onboarding Forms:**
- Card-based layouts with visual sections
- Section headers with icons (Person, Trophy, Info, Settings)
- Location auto-detection with "Use Current" button
- Fixed checkbox spacing and padding
- Removed unnecessary buttons for cleaner UI

**Data Formatting:**
- Auto-capitalization for names and statuses
- Proper date/time formatting
- Status badges with color coding

**Consistency:**
- Standardized bottom navbar placement (100px padding)
- Consistent spacing (24px top, 40px bottom, mb-6 between sections)
- Fixed tournament card spacing (16px)
- Unified color usage across all screens

### Key UI Components
- **Navigation:** Bottom tabs for role-specific dashboards
- **Forms:** Multi-step onboarding with validation
- **Cards:** Tournament cards, team cards, booking cards
- **Charts:** Victory Native for analytics visualization
- **Modals:** React Native Modal for overlays
- **Pickers:** Native date/time/dropdown pickers

---

## 🔐 Authentication Flow

1. **Signup** → Create account with email/password
2. **Login** → JWT token stored in AsyncStorage
3. **Choose Domain** → Select role (Player/Organizer/Ground Owner)
4. **Onboarding** → Complete sport-specific profile
5. **Dashboard** → Role-specific dashboard with features

**Auth Context:** `context/AuthContext.tsx`  
**Token Storage:** AsyncStorage (`@react-native-async-storage/async-storage`)  
**API Interceptor:** Automatically attaches Bearer token to all requests

---

## 📊 Analytics & Reporting

### Player Analytics
- Total matches played
- Tournaments participated
- Win rate percentage
- Goals/runs scored
- Assists

### Organizer Analytics
- Tournaments created
- Total participants
- Revenue tracking
- Booking statistics

### Ground Owner Analytics
- Total bookings
- Revenue metrics
- Ground utilization
- Review ratings

---

## 🧪 Testing & Linting

```bash
# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 📄 License & Contact

**Package:** `com.misanthropic96.sports360`  
**Version:** 1.0.0  
**Private:** Yes (proprietary)

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Review pagination needs optimization
- Some analytics screens need real-time updates
- Image upload size optimization needed

### Planned Features
- Push notifications for tournament updates
- Real-time match scoring
- Social sharing features
- Payment gateway integration
- Multi-language support

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [NativeWind Documentation](https://www.nativewind.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

---

**Last Updated:** December 2025  
**Maintained By:** Sports360 Development Team
