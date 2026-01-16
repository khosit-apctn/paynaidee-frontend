# Requirements Document

## Introduction

PayNaiDee (เปย์ไหนดี) is a production-ready, mobile-first frontend application for expense sharing built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The application integrates with an existing Go backend API providing REST endpoints and WebSocket connections for real-time communication. The frontend focuses on delivering a seamless Thai/English bilingual experience with proper Thai Baht currency formatting, Asia/Bangkok timezone support, and PromptPay QR code rendering for payments.

## Requirements

### Requirement 1: Authentication System

**User Story:** As a user, I want to securely log in and out of the application, so that I can access my expense sharing features with proper authorization.

#### Acceptance Criteria

1. WHEN a user navigates to the login page THEN the system SHALL display a login form with username and password fields
2. WHEN a user submits valid credentials THEN the system SHALL store JWT tokens securely and redirect to the dashboard
3. WHEN a user submits invalid credentials THEN the system SHALL display appropriate error messages in the selected language
4. WHEN a user clicks logout THEN the system SHALL clear all tokens and redirect to the login page
5. WHEN an access token expires THEN the system SHALL automatically refresh using the refresh token
6. IF token refresh fails THEN the system SHALL redirect the user to the login page
7. WHEN a user accesses a protected route without authentication THEN the middleware SHALL redirect to the login page
8. WHEN a user with role "admin" accesses admin features THEN the system SHALL allow access
9. WHEN a user with role "member" accesses admin features THEN the system SHALL deny access and show appropriate message

### Requirement 2: Real-time Chat System

**User Story:** As a user, I want to chat with my friends and group members in real-time, so that I can communicate while managing shared expenses.

#### Acceptance Criteria

1. WHEN a user opens a chat THEN the system SHALL establish a WebSocket connection with JWT authentication
2. WHEN a WebSocket connection drops THEN the system SHALL automatically attempt reconnection with exponential backoff
3. WHEN a user sends a message THEN the system SHALL transmit via WebSocket and display optimistically
4. WHEN a message is received via WebSocket THEN the system SHALL display it in real-time without page refresh
5. WHEN a user scrolls up in chat history THEN the system SHALL load older messages via paginated REST API
6. WHEN a user types a message THEN the system SHALL send typing indicators to other group members
7. WHEN another user is typing THEN the system SHALL display a typing indicator
8. WHEN a user sends emoji or Thai text THEN the system SHALL render Unicode characters correctly
9. WHEN a user joins a group chat THEN the system SHALL send join_group WebSocket message
10. WHEN a user leaves a group chat THEN the system SHALL send leave_group WebSocket message

### Requirement 3: Friends Management

**User Story:** As a user, I want to search for and manage my friends, so that I can easily add them to expense sharing groups.

#### Acceptance Criteria

1. WHEN a user searches for friends THEN the system SHALL query the API with the search term and display results
2. WHEN a user sends a friend request THEN the system SHALL call the API and show pending status
3. WHEN a user receives a friend request THEN the system SHALL display it with accept/reject options
4. WHEN a user accepts a friend request THEN the system SHALL update the friendship status via API
5. WHEN a user rejects a friend request THEN the system SHALL update the status and remove from pending list
6. WHEN a user views their friends list THEN the system SHALL display all accepted friendships
7. WHEN searching users THEN the system SHALL support pagination with limit and offset parameters

### Requirement 4: Group Management

**User Story:** As a user, I want to create and manage groups with different member roles, so that I can organize expense sharing with appropriate permissions.

#### Acceptance Criteria

1. WHEN a user creates a group THEN the system SHALL call the API with name and optional avatar
2. WHEN a group is created THEN the creator SHALL automatically become an admin
3. WHEN an admin adds a member THEN the system SHALL call the API with user_id and role (admin/member)
4. WHEN an admin updates a member's role THEN the system SHALL call the role update API endpoint
5. WHEN an admin removes a member THEN the system SHALL call the member removal API endpoint
6. WHEN a user views group details THEN the system SHALL display members with their roles
7. WHEN a member (non-admin) tries to manage members THEN the UI SHALL hide or disable admin-only actions
8. WHEN an admin updates group info THEN the system SHALL call the update API endpoint
9. WHEN a user views their groups THEN the system SHALL fetch and display all groups they belong to

### Requirement 5: Bill Splitting

**User Story:** As a user, I want to create bills and split expenses among group members, so that everyone knows their share of the cost.

#### Acceptance Criteria

1. WHEN a user creates a bill THEN the system SHALL accept title, total amount, split type, and participants
2. WHEN equal split is selected THEN the system SHALL preview the calculated amount per person client-side
3. WHEN custom split is selected THEN the system SHALL allow individual amount entry and validate total
4. WHEN service charge is specified THEN the system SHALL calculate and preview the adjusted amounts
5. WHEN a bill is submitted THEN the system SHALL send to API (backend is source of truth for calculations)
6. WHEN viewing a bill THEN the system SHALL display all participants with their amounts and payment status
7. WHEN a user views group bills THEN the system SHALL fetch paginated bill list from API
8. WHEN bill form has validation errors THEN the system SHALL display Zod validation messages
9. WHEN creating a bill THEN the form SHALL use React Hook Form for form state management

### Requirement 6: Payment & QR Code

**User Story:** As a user, I want to generate and view PromptPay QR codes for payments, so that I can easily pay or receive money.

#### Acceptance Criteria

1. WHEN a user requests a QR code for a bill THEN the system SHALL fetch QR data from the API
2. WHEN QR data is received THEN the system SHALL render a PromptPay-compatible QR code image
3. WHEN viewing a participant's payment THEN the system SHALL allow generating individual QR codes
4. WHEN a payment status changes THEN the system SHALL receive WebSocket notification and update UI
5. WHEN all participants have paid THEN the system SHALL receive bill_settled WebSocket event and update status
6. WHEN a user updates payment status THEN the system SHALL call the payment status API endpoint
7. WHEN viewing payment status THEN the system SHALL display "pending" or "paid" for each participant

### Requirement 7: Localization (i18n)

**User Story:** As a user, I want to use the application in Thai or English, so that I can interact in my preferred language.

#### Acceptance Criteria

1. WHEN a user selects Thai language THEN the system SHALL display all UI text in Thai
2. WHEN a user selects English language THEN the system SHALL display all UI text in English
3. WHEN displaying currency THEN the system SHALL format amounts in Thai Baht (฿) with proper formatting
4. WHEN displaying dates/times THEN the system SHALL use Asia/Bangkok timezone via Day.js
5. WHEN displaying error messages THEN the system SHALL show localized error text
6. WHEN the app loads THEN the system SHALL detect and apply user's language preference
7. WHEN a user changes language THEN the system SHALL persist the preference and update all text

### Requirement 8: State Management & Data Fetching

**User Story:** As a developer, I want consistent state management and data fetching patterns, so that the application is maintainable and performant.

#### Acceptance Criteria

1. WHEN fetching server data THEN the system SHALL use TanStack Query with proper cache configuration
2. WHEN managing global client state THEN the system SHALL use Zustand stores
3. WHEN a mutation succeeds THEN the system SHALL invalidate relevant TanStack Query caches
4. WHEN data is loading THEN the system SHALL display appropriate loading states
5. WHEN an API error occurs THEN the system SHALL display user-friendly error messages
6. WHEN WebSocket events arrive THEN the system SHALL update relevant Zustand stores and query caches
7. WHEN the app initializes THEN the system SHALL restore auth state from secure storage

### Requirement 9: Mobile-First Responsive Design

**User Story:** As a user, I want to use the application on my mobile device with a great experience, so that I can manage expenses on the go.

#### Acceptance Criteria

1. WHEN viewing on mobile THEN the system SHALL display a mobile-optimized layout
2. WHEN viewing on tablet/desktop THEN the system SHALL adapt layout appropriately
3. WHEN interacting with forms THEN the system SHALL provide touch-friendly input sizes
4. WHEN navigating THEN the system SHALL provide mobile-friendly navigation patterns
5. WHEN displaying lists THEN the system SHALL support pull-to-refresh and infinite scroll patterns
6. WHEN using the app THEN all interactive elements SHALL meet accessibility standards

### Requirement 10: Route Protection & Middleware

**User Story:** As a user, I want my data protected by proper route guards, so that unauthorized users cannot access my information.

#### Acceptance Criteria

1. WHEN accessing protected routes THEN Next.js middleware SHALL verify authentication
2. WHEN accessing public routes (login, register) while authenticated THEN the system SHALL redirect to dashboard
3. WHEN accessing role-restricted routes THEN the middleware SHALL verify user role from JWT
4. WHEN JWT is invalid or expired THEN the middleware SHALL redirect to login
5. WHEN middleware redirects THEN the system SHALL preserve the intended destination for post-login redirect
