# Friend Activity Planner

## Overview

A collaborative activity and trip planning application that helps friends coordinate their schedules, track availability, and plan activities together. Built with Next.js 14, TypeScript, and Supabase, the app features a calendar-based interface for managing friend activities, trips, and group events. Users can view friend availability, submit activity requests, track public holidays, and participate in feature requests through a backlog voting system.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Modern, fun, minimal, and gamified - NOT professional.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with App Router and React Server Components
- **Rationale**: Provides modern React features, server-side rendering, and excellent developer experience with built-in routing
- **UI Library**: Radix UI primitives with custom shadcn/ui components for accessible, customizable UI elements
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting light/dark modes via oklch color space
  - **Design System (October 2025)**: Modern, fun, minimal, gamified aesthetic
    - **Light Mode**: Soft lavender-white background (#f8f9fe), vibrant indigo primary (#6366f1), purple secondary (#8b5cf6), warm amber accent (#f59e0b)
    - **Dark Mode**: Deep space blue-black background (#0f0f1a), lighter indigo (#818cf8), golden accent (#fbbf24)
    - **Glass-morphism**: Cards use backdrop-blur and subtle shadows for frosted glass effect
    - **Gamified Elements**: Badge system (gold/silver/bronze), gradient text headers, glowing effects, rainbow borders, subtle bounce animations
    - **Utility Classes**: `.glass-card`, `.gradient-text`, `.glow-primary`, `.hover-lift`, `.badge-gold`, `.rainbow-border`, `.animate-bounce-subtle`
- **State Management**: React hooks (useState, useEffect, useMemo) for local state; no global state library needed for current scope

**Key Design Patterns**:
- Client-side rendering for interactive components (marked with "use client")
- Component composition with separate UI components in `/components/ui`
- Feature-based component organization (admin/, calendar views, modals)
- Custom hooks for shared logic (e.g., useToast)

### Backend Architecture

**Data Layer**: Supabase (PostgreSQL) for persistent storage
- **Rationale**: Provides real-time database, authentication capabilities, and client/server SDK separation
- **Alternative Considered**: Direct PostgreSQL with Drizzle ORM - chose Supabase for built-in features and ease of deployment
- **Client Creation**: Separate browser and server clients using @supabase/ssr for proper cookie handling

**Data Models**:
- **Friends**: User profiles with avatars, groups, quotes, Instagram handles
- **Groups**: Friend categorization with custom colors
- **Activities**: Trip/activity records supporting single or multiple participants, recurring events, budgets, and itineraries
- **Requests**: Friend requests, join requests, feature requests with approval workflows
- **Activity Logs**: Audit trail for all activity changes
- **Comments/Reactions**: Social features for activity engagement

**Storage Strategy**:
- Session storage for admin authentication (browser-only)
- Local storage for UI preferences (last viewed timestamps)
- Supabase for all persistent application data
- Vercel Blob for image uploads (friend avatars)

### Authentication & Authorization

**Admin System**: PIN-based authentication (2468)
- **Rationale**: Simple protection for admin features without complex user management
- **Session Management**: Session storage keeps admin authenticated during browser session
- **Admin Routes**: Separate `/admin` page for managing friends, groups, activities, and requests

**Security Considerations**:
- Admin PIN is hardcoded (development approach; should use environment variables in production)
- No user authentication system currently implemented
- Public pages accessible without authentication

### External Dependencies

**Database & Backend Services**:
- **Supabase**: PostgreSQL database, real-time subscriptions, authentication infrastructure
  - Connection via browser client (@supabase/ssr) and server client
  - Tables: friends, groups, activities, friend_requests, join_requests, feature_requests, backlog_items, activity_logs, activity_participants, activity_comments, activity_reactions

**File Storage**:
- **Vercel Blob**: Image upload and storage for friend avatars
  - API route `/api/upload` handles file uploads
  - 5MB size limit, image files only
  - Public access URLs returned

**Analytics & Monitoring**:
- **Vercel Analytics**: Built-in analytics for deployment tracking

**Third-Party Libraries**:
- **Radix UI**: Accessible component primitives (dialog, popover, select, etc.)
- **date-fns**: Date manipulation and formatting
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant styling
- **embla-carousel-react**: Carousel functionality
- **react-day-picker**: Calendar date picking

**Deployment & Infrastructure**:
- **Vercel**: Hosting and deployment platform
- **Next.js**: SSR and API routes infrastructure
- Development server runs on port 5000

### Data Flow Architecture

**Request Flow**:
1. Friend submits activity via public form → stored as pending request
2. Admin approves/rejects via dashboard → creates activity or deletes request
3. Activity logs created for audit trail
4. Real-time updates through component re-fetching

**Join Request Flow**:
1. User requests to join existing activity
2. System checks for scheduling conflicts
3. Admin approves → adds participant to activity
4. Activity logs track approval/rejection

**Feature Request & Backlog**:
1. Users submit feature ideas
2. Admin converts to backlog items or manages directly
3. Voting system for prioritization
4. AI-suggested features included in backlog

### Key Architectural Decisions

**Multi-Participant Activities**: 
- Supports both legacy single friend (`friendId`) and multiple friends (`friendIds`)
- Organizer tracking via `organizerId` field
- Allows complex group trip planning

**Recurring Activities**:
- Pattern-based recurrence (daily, weekly, monthly)
- Cancelled occurrence tracking for exceptions
- Flexible scheduling system

**Budget Management**:
- Breakdown by category (flight, accommodation, food, etc.)
- Per-activity budget tracking
- Itinerary support for detailed planning

**Calendar System**:
- Multi-month view (default 3 months ahead)
- Public holiday integration (Malaysia-specific)
- Availability overview and conflict detection
- Extended leave calculation for long weekends

**Social Features**:
- Activity comments with @mentions
- Reaction system (heart, thumbs up, laugh, frown, sparkles)
- Tagged comment notifications
- Activity feed with auto-scrolling