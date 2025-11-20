# 📄 Housify - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Folder Structure](#folder-structure)
4. [Technology Stack](#technology-stack)
5. [Development Requirements](#development-requirements)
6. [Getting Started](#getting-started)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [Data Flow](#data-flow)
10. [Mock Data System](#mock-data-system)
11. [Styling Approach](#styling-approach)
12. [Key Features Implementation](#key-features-implementation)

---

## Overview

**Housify** is a cross-platform mobile application built with React Native and Expo that facilitates property management between landlords and tenants. The application uses a file-based routing system (Expo Router) and implements a context-based state management pattern with mock data to simulate backend functionality.

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface Layer               │
│    (React Native Components + Expo Router)      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│           State Management Layer                │
│  (Context API + React Query + AsyncStorage)     │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│              Mock Data Layer                    │
│        (Simulates Backend Responses)            │
└─────────────────────────────────────────────────┘
```

### Design Principles

1. **File-Based Routing**: Routes are automatically generated from folder structure
2. **Context-Based State**: Global state managed through React Context with hooks
3. **Mock-First Development**: Complete mock data ecosystem simulates real backend
4. **Type Safety**: Strict TypeScript configuration for type correctness
5. **Cross-Platform Compatibility**: Web and mobile support with platform-specific handling

---

## Folder Structure

```
housify-rental-app/
│
├── app/                          # Application screens and routing
│   ├── (tabs)/                   # Tab-based navigation group
│   │   ├── _layout.tsx          # Tab navigator configuration
│   │   ├── index.tsx            # Home tab (properties for landlord/tenant)
│   │   ├── claims.tsx           # Claims/issues management tab
│   │   └── profile.tsx          # User profile tab
│   │
│   ├── property/                 # Property-related screens
│   │   └── [id].tsx             # Dynamic property details page
│   │
│   ├── _layout.tsx              # Root navigation layout
│   ├── onboarding.tsx           # First-time user onboarding
│   ├── signin.tsx               # Authentication - Sign in
│   ├── signup.tsx               # Authentication - Sign up
│   ├── add-property.tsx         # Modal for adding properties
│   ├── submit-claim.tsx         # Modal for submitting issues
│   ├── rental-history.tsx       # Tenant's rental history
│   ├── pay-rent.tsx            # Rent payment simulation
│   ├── send-note.tsx           # Landlord sends notes to tenants
│   └── +not-found.tsx          # 404 error page
│
├── contexts/                     # Global state management
│   ├── AuthContext.tsx          # Authentication & user session
│   ├── PropertyContext.tsx      # Properties, tenants, claims state
│   ├── ThemeContext.tsx         # Light/dark mode management
│   └── ToastContext.tsx         # Toast notifications for feedback
│
├── types/                        # TypeScript type definitions
│   └── index.ts                 # Centralized type exports
│
├── mocks/                        # Mock data for simulation
│   └── data.ts                  # All mock entities (properties, tenants, etc.)
│
├── constants/                    # App-wide constants
│   └── colors.ts                # Color palette definitions
│
├── assets/                       # Static assets
│   └── images/                  # App icons, splash screens
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project overview

```

---

## Detailed Folder Explanation

### `/app` - Application Layer
**Purpose**: Contains all screen components and defines the application routing structure.

**Why this structure?**
- **Expo Router** uses file-based routing similar to Next.js
- Each file automatically becomes a route
- Folders in parentheses like `(tabs)` are route groups that don't affect the URL
- Dynamic routes use `[param]` syntax (e.g., `property/[id].tsx`)

**File Types**:
- `_layout.tsx` - Defines navigation structure and wraps child routes
- Screen files (`.tsx`) - Individual pages/screens
- Modal screens - Marked with `presentation: "modal"` in layout

**Authentication Flow**:
```
User Opens App
    ↓
Has seen onboarding? → No → /onboarding
    ↓ Yes
Is authenticated? → No → /signin or /signup
    ↓ Yes
→ /(tabs) [Main App]
```

---

### `/app/(tabs)` - Tab Navigation Group
**Purpose**: Implements bottom tab navigation for authenticated users.

**Why grouped?**
- The `(tabs)` folder creates a route group
- Content inside is accessible without `/tabs` in the URL
- Allows role-based content (landlords see different content than tenants)

**Tabs Structure**:
- `index.tsx` - Dashboard (properties list)
- `claims.tsx` - Issue tracking
- `profile.tsx` - User profile & settings

---

### `/contexts` - State Management
**Purpose**: Centralized global state management using React Context API.

**Why Context API?**
- Lightweight compared to Redux
- Built into React (no additional dependencies)
- Easy to understand and maintain
- Perfect for mock data simulation

**Context Files**:

| Context | Purpose | Persisted? |
|---------|---------|------------|
| `AuthContext` | User authentication, session management | Yes (AsyncStorage) |
| `PropertyContext` | Properties, tenants, claims, payments, notes | Yes (AsyncStorage) |
| `ThemeContext` | Light/dark mode preference | Yes (AsyncStorage) |
| `ToastContext` | Success/error feedback messages | No |

**Why `@nkzw/create-context-hook`?**
- Simplifies context creation and typing
- Reduces boilerplate code
- Automatic TypeScript inference
- Cleaner API than raw `createContext`

---

### `/types` - TypeScript Definitions
**Purpose**: Centralized type definitions for type safety across the app.

**Key Types**:
```typescript
User, UserRole
Property, Tenant, Claim
Payment, PaymentMethod
Note, Subscription, RentalHistory
```

**Why centralized types?**
- Single source of truth
- Easier refactoring
- Better IDE autocomplete
- Consistent data structures

---

### `/mocks` - Mock Data Layer
**Purpose**: Simulates backend responses for development and testing.

**Mock Entities**:
- `mockProperties` - Property listings
- `mockTenants` - Tenant profiles
- `mockClaims` - Maintenance issues
- `mockPayments` - Rent payment records
- `mockNotes` - Landlord-tenant communications
- `mockSubscriptions` - Landlord subscription plans
- `mockPaymentMethods` - Payment cards/methods
- `mockRentalHistory` - Past tenancy records

**Why extensive mock data?**
- Allows full app testing without backend
- Demonstrates complete user flows
- Makes development faster
- Helps identify UX issues early

---

### `/constants` - Application Constants
**Purpose**: Shared constants used throughout the application.

**Current Constants**:
- `colors.ts` - Color palette for theming

**Why separate constants?**
- Easy to update global values
- Consistent styling
- Theme customization support
- Reduces magic strings

---

### `/assets` - Static Resources
**Purpose**: Images, icons, fonts, and other static files.

**Structure**:
```
assets/
  └── images/
      ├── icon.png           # App icon
      ├── adaptive-icon.png  # Android adaptive icon
      ├── splash-icon.png    # Splash screen
      └── favicon.png        # Web favicon
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Mobile UI framework |
| **Expo** | ~54.0.25 | Development platform |
| **Expo Router** | ~6.0.15 | File-based navigation |
| **TypeScript** | ~5.9.2 | Type safety |
| **React** | 19.1.0 | UI library |

### Key Dependencies

#### State Management
- `@tanstack/react-query` (5.83.0) - Server state management
- `@nkzw/create-context-hook` (1.1.0) - Context creation helper
- `@react-native-async-storage/async-storage` (2.2.0) - Persistent storage

#### UI & Styling
- `lucide-react-native` (0.475.0) - Icon library
- `expo-linear-gradient` (15.0.7) - Gradient backgrounds
- `expo-blur` (15.0.7) - Blur effects
- `react-native-safe-area-context` (5.6.0) - Safe area handling

#### Navigation
- `react-native-gesture-handler` (2.28.0) - Touch gestures
- `react-native-screens` (4.16.0) - Native navigation

#### Other Features
- `expo-image-picker` (17.0.8) - Photo selection
- `expo-haptics` (15.0.7) - Haptic feedback
- `expo-location` (19.0.7) - Geolocation

---

## Development Requirements

### System Requirements

#### Prerequisites
1. **Node.js** - Version 18+ or higher
2. **Bun** - JavaScript runtime and package manager
3. **Git** - For version control
4. **Expo CLI** - Automatically installed with dependencies

#### Operating System Support
- **macOS** - Full support (iOS + Android development)
- **Windows** - Android development only
- **Linux** - Android development only

### Hardware Requirements

**For Web Preview**:
- Any modern computer with 4GB+ RAM
- Modern web browser (Chrome, Firefox, Safari)

**For Mobile Testing**:
- **iOS Device** - iPhone running iOS 13.4+
- **Android Device** - Android phone running 6.0+
- OR use the Expo Go app for testing

### Software Installation

#### 1. Install Bun
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
irm bun.sh/install.ps1 | iex
```

#### 2. Verify Installation
```bash
bun --version
```

---

## Getting Started

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd housify-rental-app
```

#### 2. Install Dependencies
```bash
bun install
```

This installs all required packages from `package.json`.

#### 3. Start Development Server

**For Mobile Preview (Recommended)**:
```bash
bun start
```
- Generates a QR code
- Scan with **Expo Go** app (iOS/Android)
- Provides tunnel URL for remote testing

**For Web Preview**:
```bash
bun run start-web
```
- Opens in browser at `http://localhost:8081`
- Useful for quick testing
- Some native features may not work

**For Debugging (Web)**:
```bash
bun run start-web-dev
```
- Enables debug logging
- Shows detailed Expo internals

---

## State Management

### Context Architecture

```
QueryClientProvider (React Query)
  └── GestureHandlerRootView
      └── ThemeContext
          └── ToastContext
              └── AuthContext
                  └── PropertyContext
                      └── App Navigation
```

### Context Hierarchy Explained

**Why this order?**

1. **QueryClientProvider** (Top) - Must wrap all components using React Query
2. **GestureHandlerRootView** - Required for gesture handling on mobile
3. **ThemeContext** - Theme needs to be available everywhere
4. **ToastContext** - Toasts should work throughout the app
5. **AuthContext** - Authentication state needed for routing
6. **PropertyContext** - Depends on auth for user-specific data

---

### AuthContext

**Responsibilities**:
- User authentication (sign in/sign up/sign out)
- Session persistence with AsyncStorage
- Onboarding flow management
- User role determination (landlord/tenant)

**State**:
```typescript
{
  user: User | null
  isLoading: boolean
  hasSeenOnboarding: boolean
  isAuthenticated: boolean
}
```

**Methods**:
- `signIn(email, password)` - Authenticate user
- `signUp(email, password, name, role)` - Create new account
- `signOut()` - Clear session
- `completeOnboarding()` - Mark onboarding as seen

**Mock Authentication**:
- Email containing "landlord" → Landlord role
- Other emails → Tenant role
- No actual password validation (mock)

---

### PropertyContext

**Responsibilities**:
- Manage properties (CRUD operations)
- Handle tenant assignments
- Track claims/issues
- Process payments
- Manage landlord-tenant notes
- Subscription management

**State**:
```typescript
{
  properties: Property[]
  tenants: Tenant[]
  claims: Claim[]
  payments: Payment[]
  notes: Note[]
  subscriptions: Subscription[]
  paymentMethods: PaymentMethod[]
  rentalHistory: RentalHistory[]
}
```

**Why single context for all entities?**
- Related data should be managed together
- Easier to maintain relationships (property → tenants → claims)
- Simpler data flow
- Matches typical backend API structure

---

### ThemeContext

**Responsibilities**:
- Light/dark mode toggle
- Theme persistence
- Color scheme application

**State**:
```typescript
{
  theme: 'light' | 'dark'
  colors: ColorScheme
  toggleTheme: () => void
}
```

---

### ToastContext

**Responsibilities**:
- Show success/error messages
- User feedback for actions
- Auto-dismiss notifications

**State**:
```typescript
{
  showToast: (message, type) => void
}
```

**Usage Example**:
```typescript
const { showToast } = useToast();
showToast('Property added successfully!', 'success');
```

---

## Routing & Navigation

### File-Based Routing

Expo Router automatically creates routes from the file structure:

| File Path | URL Route | Description |
|-----------|-----------|-------------|
| `app/index.tsx` | `/` | Would be root, but redirects |
| `app/(tabs)/index.tsx` | `/` | Actual home (properties) |
| `app/(tabs)/claims.tsx` | `/claims` | Claims tab |
| `app/(tabs)/profile.tsx` | `/profile` | Profile tab |
| `app/property/[id].tsx` | `/property/123` | Dynamic property page |
| `app/add-property.tsx` | `/add-property` | Add property modal |
| `app/signin.tsx` | `/signin` | Sign in screen |

### Navigation Guards

**Implemented in** `app/_layout.tsx`:

```typescript
// Redirect logic
if (!hasSeenOnboarding) → /onboarding
if (!user && inAuthGroup) → /signin
if (user && !inAuthGroup) → /(tabs)
```

**Flow**:
1. Check if onboarding completed
2. Check authentication status
3. Redirect to appropriate screen
4. Prevent access to protected routes

---

## Data Flow

### User Actions → State Updates

```
User Action
    ↓
Screen Component
    ↓
Context Method Call
    ↓
Update Context State
    ↓
Persist to AsyncStorage (if needed)
    ↓
UI Re-renders
    ↓
Show Toast Feedback
```

### Example: Adding a Property

```typescript
// 1. User submits form in add-property.tsx
const { addProperty } = useProperty();

// 2. Call context method
await addProperty(propertyData);

// 3. PropertyContext updates state
const newProperty = { ...propertyData, id: generateId() };
setProperties([...properties, newProperty]);

// 4. Persist to AsyncStorage
await AsyncStorage.setItem('properties', JSON.stringify(updatedProperties));

// 5. Navigate back + show success toast
router.back();
showToast('Property added successfully!', 'success');
```

---

## Mock Data System

### Purpose of Mock Data

1. **Development without backend** - Full app functionality
2. **Realistic testing** - Complete user journeys
3. **Demo-ready** - Show all features immediately
4. **Backend contract definition** - Defines expected data structure

### Mock Data Entities

#### Properties (7 total)
- Mix of available and occupied
- Various price points ($950 - $4,500)
- Different property types (studio, loft, house)
- Real images from Unsplash

#### Tenants (5 total)
- Assigned to specific properties
- Various rent statuses (paid, pending, overdue)
- Complete contact information

#### Claims (8 total)
- Different statuses (pending, in-progress, resolved)
- Realistic maintenance issues
- Linked to properties and tenants

#### Payments (13 total)
- Historical payment records
- Multiple payment methods
- Mix of paid, pending, overdue

#### Notes (9 total)
- Landlord-to-tenant communications
- Various priorities (low, medium, high)
- Read/unread status

#### Subscriptions & Payment Methods
- Premium subscription for landlords
- Multiple payment cards
- Billing cycle tracking

#### Rental History
- Past tenancy records
- Total amounts paid
- Move-in/move-out dates

---

## Styling Approach

### StyleSheet API

React Native's `StyleSheet.create()` for all styles:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
```

**Why StyleSheet?**
- Performance optimization
- Style validation
- Type safety with TypeScript

### Theme System

```typescript
// colors.ts defines base colors
// ThemeContext provides dynamic colors based on mode

const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }} />
```

### Responsive Design

- Use `flex` for layouts
- Percentage-based sizing
- Platform-specific adjustments with `Platform.select()`

---

## Key Features Implementation

### 1. Landlord Dashboard
- Shows all properties
- Tenant management per property
- Quick access to add properties
- Subscription status in profile

### 2. Tenant Dashboard
- Shows assigned property only
- Claims submission
- Rent payment interface
- Rental history access

### 3. Claims System
- Submit with photos
- Status tracking (pending/in-progress/resolved)
- Landlord can update status

### 4. Payment Simulation
- Mock payment processing
- Payment history
- Status updates (paid/pending/overdue)
- Multiple payment methods

### 5. Notes/Communications
- Landlord sends notes to tenants
- Priority levels
- Read/unread status
- Targeted to specific tenants

### 6. Subscription Management
- Premium plan for landlords
- Payment method management
- Renewal simulation
- Subscription details

---

## Environment Variables

**Not required for this project** - All configuration is in `app.json`.

If backend is added later:
```bash
# .env.local
EXPO_PUBLIC_API_URL=https://api.example.com
```

---

## Testing on Devices

### iOS (iPhone/iPad)

1. Install **Expo Go** from App Store
2. Run `bun start`
3. Scan QR code with Camera app
4. Opens in Expo Go

### Android

1. Install **Expo Go** from Play Store
2. Run `bun start`
3. Scan QR code from Expo Go app
4. Opens in Expo Go

### Web Browser

1. Run `bun run start-web`
2. Opens automatically in browser
3. Access at `http://localhost:8081`

---

## Common Development Commands

```bash
# Install dependencies
bun install

# Start development server (mobile)
bun start

# Start web development
bun run start-web

# Start with debugging (web)
bun run start-web-dev

# Run linter
bun run lint

# Clear cache (if issues occur)
bun start --clear
```

---

## Project Conventions

### Code Style

1. **TypeScript First** - All files use `.tsx` or `.ts`
2. **Strict Mode** - TypeScript strict mode enabled
3. **Functional Components** - No class components
4. **Hooks** - Use React hooks for state and effects
5. **Named Exports** - Prefer named exports over default (except screens)

### File Naming

- **Screens**: PascalCase (e.g., `SignIn.tsx` → becomes `signin.tsx` for Expo Router)
- **Contexts**: PascalCase with "Context" suffix (e.g., `AuthContext.tsx`)
- **Types**: camelCase for file, PascalCase for types
- **Constants**: lowercase with hyphens (e.g., `colors.ts`)

### Import Order

```typescript
// 1. React & Native
import { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';

// 3. Local contexts
import { useAuth } from '@/contexts/AuthContext';

// 4. Types
import type { Property } from '@/types';
```

---

## Troubleshooting

### Common Issues

**"Metro bundler not starting"**
```bash
bun start --clear
```

**"AsyncStorage not persisting"**
- Check app permissions
- Clear app data and restart

**"Context not updating"**
- Verify context provider wraps the component
- Check AsyncStorage keys match

**"TypeScript errors"**
```bash
bun run lint
```

---

## Future Backend Integration

### When Backend is Added

**Steps**:
1. Replace mock data with API calls
2. Use React Query for server state
3. Keep context for client state only
4. Add environment variables
5. Implement authentication tokens
6. Add loading states
7. Error handling

**Example Migration**:
```typescript
// Before (mock)
const { properties } = useProperty();

// After (with backend)
const { data: properties } = useQuery({
  queryKey: ['properties'],
  queryFn: () => api.getProperties()
});
```

---

## Performance Considerations

### Optimizations Implemented

1. **Memoization** - Use `useMemo` for expensive calculations
2. **Callbacks** - Use `useCallback` for stable function references
3. **Image Optimization** - Use `expo-image` for better caching
4. **List Rendering** - Use `FlatList` for long lists
5. **Context Splitting** - Separate contexts to minimize re-renders

### Best Practices

- Avoid inline styles
- Use StyleSheet.create()
- Minimize AsyncStorage calls
- Lazy load images
- Debounce user inputs

---

## Security Notes

**Current State (Mock Data)**:
- No real authentication
- No password encryption
- No API security

**When Deploying**:
- Implement JWT authentication
- Use HTTPS for all API calls
- Encrypt sensitive data
- Implement rate limiting
- Add input validation
- Use secure storage for tokens

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Summary

**Housify** is a well-structured, type-safe mobile application built for property management. The architecture leverages Expo's file-based routing, React Context for state management, and comprehensive mock data to simulate a fully functional application without requiring a backend during development.

**Key Strengths**:
- ✅ Clear folder structure
- ✅ Type-safe development
- ✅ Cross-platform support
- ✅ Comprehensive mock data
- ✅ Role-based features
- ✅ Professional UI/UX
- ✅ Easy to extend and maintain

**Development Ready**: Any developer can clone, install, and start developing immediately with `bun install && bun start`.

---

*Document Version: 1.0*  
*Last Updated: 2025*  
*Maintainer: Housify Development Team*
