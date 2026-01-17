# Implementation Plan

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize Next.js project with TypeScript and Tailwind CSS
    - Run `npx create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint
    - Configure `tsconfig.json` with strict mode and path aliases
    - Set up Tailwind config with custom theme colors for PayNaiDee branding
    - _Requirements: 9.1, 9.2_

  - [x] 1.2 Install and configure core dependencies
    - Install TanStack Query, Zustand, React Hook Form, Zod, Day.js, jwt-decode, qrcode
    - Create `lib/utils/cn.ts` with clsx and tailwind-merge utility
    - Configure environment variables in `.env.local` for API_URL and WS_URL
    - _Requirements: 8.1, 8.2_

  - [x] 1.3 Set up project directory structure
    - Create folder structure: `app/`, `components/`, `lib/`, `types/`
    - Create subdirectories: `lib/api/`, `lib/stores/`, `lib/hooks/`, `lib/utils/`, `lib/i18n/`, `lib/websocket/`
    - Create component subdirectories: `ui/`, `forms/`, `chat/`, `bills/`, `groups/`, `friends/`, `layout/`, `providers/`
    - _Requirements: 8.1_

- [x] 2. Core Utilities and Types




  - [x] 2.1 Create TypeScript type definitions


    - Create `types/models.ts` with User, Group, GroupMember, Message, Bill, BillParticipant, Friendship, QRCodeResponse interfaces
    - Create `types/api.ts` with APIResponse, PaginatedResponse, and request type interfaces
    - Create `types/websocket.ts` with WebSocket message type definitions
    - Update `types/index.ts` to export all types
    - _Requirements: 8.1_


  - [x] 2.2 Implement currency formatting utility

    - Create `lib/utils/currency.ts` with `formatThaiCurrency()` using Intl.NumberFormat for THB
    - Add `formatCompactCurrency()` for abbreviated amounts (K, M)
    - Write unit tests for currency formatting functions
    - _Requirements: 7.3_


  - [x] 2.3 Implement date/time formatting utility

    - Create `lib/utils/date.ts` with Day.js configured for Asia/Bangkok timezone
    - Add `formatDate()`, `formatDateTime()`, `formatRelativeTime()`, `formatChatTime()` functions
    - Configure Day.js plugins (utc, timezone, relativeTime) and Thai locale
    - Write unit tests for date formatting functions
    - _Requirements: 7.4_

  - [x] 2.4 Create Zod validation schemas


    - Create `lib/utils/validation.ts` with loginSchema, registerSchema, createGroupSchema, createBillSchema
    - Export TypeScript types inferred from Zod schemas
    - _Requirements: 5.8, 8.1_

- [x] 3. API Client and Error Handling





  - [x] 3.1 Implement API client class


    - Create `lib/api/client.ts` with APIClient class supporting GET, POST, PUT, DELETE
    - Implement automatic JWT token injection from auth store
    - Add automatic token refresh on 401 responses
    - Create APIError class with code, message, and status
    - _Requirements: 1.5, 1.6, 8.1_


  - [x] 3.2 Create API error handling utilities

    - Create `lib/api/errors.ts` with error code to i18n key mapping
    - Implement `getErrorMessage()` helper for localized error display
    - _Requirements: 7.5, 8.5_


  - [x] 3.3 Implement auth API endpoints

    - Create `lib/api/auth.ts` with login, register, refreshToken, logout functions
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 3.4 Implement users API endpoints


    - Create `lib/api/users.ts` with getProfile, updateProfile, searchUsers functions
    - _Requirements: 3.1, 3.7_


  - [x] 3.5 Implement groups API endpoints

    - Create `lib/api/groups.ts` with CRUD operations for groups and members
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9_


  - [x] 3.6 Implement bills API endpoints

    - Create `lib/api/bills.ts` with CRUD operations for bills and participants
    - _Requirements: 5.5, 5.6, 5.7_

  - [x] 3.7 Implement messages API endpoints


    - Create `lib/api/messages.ts` with getMessages (paginated) function
    - _Requirements: 2.5_


  - [x] 3.8 Implement friends API endpoints

    - Create `lib/api/friends.ts` with friend request and friendship management functions
    - _Requirements: 3.2, 3.4, 3.5, 3.6_

- [x] 4. State Management (Zustand Stores)




  - [x] 4.1 Implement auth store


    - Create `lib/stores/auth-store.ts` with user, tokens, and auth state
    - Add persist middleware for secure storage
    - Export helper functions: getAccessToken, getRefreshToken, clearTokens
    - _Requirements: 1.2, 8.2, 8.7_


  - [x] 4.2 Implement chat store

    - Create `lib/stores/chat-store.ts` with messages Map and typing users
    - Add actions: addMessage, setMessages, prependMessages, setTyping, clearChat
    - _Requirements: 2.4, 2.7, 8.2, 8.6_


  - [x] 4.3 Implement UI store

    - Create `lib/stores/ui-store.ts` for global UI state (modals, toasts, sidebar)
    - _Requirements: 8.2_

- [x] 5. Internationalization (i18n)


  - [x] 5.1 Create i18n configuration and hook


    - Create `lib/i18n/config.ts` with locale definitions
    - Create `lib/i18n/use-translation.ts` Zustand store with locale and t() function
    - Add persist middleware for language preference
    - _Requirements: 7.6, 7.7_


  - [x] 5.2 Create translation files

    - Create `lib/i18n/locales/en.json` with English translations
    - Create `lib/i18n/locales/th.json` with Thai translations
    - Include all UI text, error messages, and labels
    - _Requirements: 7.1, 7.2, 7.5_


  - [x] 5.3 Create i18n provider component


    - Create `components/providers/i18n-provider.tsx` for context setup
    - _Requirements: 7.6_

- [x] 6. WebSocket Client


  - [x] 6.1 Implement WebSocket client class


    - Create `lib/websocket/client.ts` with PayNaiDeeWebSocket class
    - Implement connect, disconnect, reconnect with exponential backoff
    - Add message handlers registration (on/off pattern)
    - _Requirements: 2.1, 2.2_



  - [x] 6.2 Create WebSocket type definitions
    - Create `lib/websocket/types.ts` with message type definitions
    - Define types for chat_message, typing, join_group, leave_group, payment_update, bill_settled
    - _Requirements: 2.3, 2.6, 2.9, 2.10, 6.4, 6.5_


  - [x] 6.3 Create WebSocket hooks

    - Create `lib/websocket/hooks.ts` with useWebSocket hook
    - Integrate with chat store for message updates
    - _Requirements: 2.4, 8.6_


  - [x] 6.4 Create WebSocket provider component

    - Create `components/providers/websocket-provider.tsx` for connection management
    - Handle auth token and auto-reconnect
    - _Requirements: 2.1, 2.2_

- [x] 7. TanStack Query Setup and Hooks





  - [x] 7.1 Create Query provider


    - Create `components/providers/query-provider.tsx` with QueryClient configuration
    - Configure default stale time, cache time, and retry settings
    - _Requirements: 8.1, 8.4_

  - [x] 7.2 Implement auth hooks


    - Create `lib/hooks/use-auth.ts` with useLogin, useRegister, useLogout mutations
    - _Requirements: 1.2, 1.4_

  - [x] 7.3 Implement groups hooks


    - Create `lib/hooks/use-groups.ts` with useGroups, useGroup, useCreateGroup, useGroupMembers hooks
    - Define query keys for cache management
    - _Requirements: 4.1, 4.3, 4.6, 4.9, 8.3_

  - [x] 7.4 Implement bills hooks


    - Create `lib/hooks/use-bills.ts` with useGroupBills, useBill, useCreateBill, useBillQR hooks
    - _Requirements: 5.5, 5.6, 5.7, 6.1, 6.2, 8.3_

  - [x] 7.5 Implement friends hooks


    - Create `lib/hooks/use-friends.ts` with useFriends, useFriendRequests, useSendFriendRequest hooks
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 8.3_

  - [x] 7.6 Implement chat hooks


    - Create `lib/hooks/use-chat.ts` with useMessages (paginated), useSendMessage hooks
    - _Requirements: 2.3, 2.5, 8.3_

- [x] 8. Base UI Components
  - [x] 8.1 Create Button component
    - Create `components/ui/button.tsx` with variants (primary, secondary, outline, ghost)
    - Support sizes (sm, md, lg), loading state, and disabled state
    - Ensure touch-friendly sizing for mobile
    - _Requirements: 9.3, 9.6_

  - [x] 8.2 Create Input component
    - Create `components/ui/input.tsx` with label, error message, and helper text support
    - Support different types (text, email, password, number)
    - Ensure touch-friendly sizing
    - _Requirements: 9.3, 9.6_

  - [x] 8.3 Create Card component
    - Create `components/ui/card.tsx` with header, body, footer sections
    - _Requirements: 9.1_

  - [x] 8.4 Create Modal component
    - Create `components/ui/modal.tsx` with overlay, close button, and accessibility
    - _Requirements: 9.6_

  - [x] 8.5 Create Avatar component
    - Create `components/ui/avatar.tsx` with image fallback to initials
    - Support different sizes
    - _Requirements: 9.1_

  - [x] 8.6 Create Badge component
    - Create `components/ui/badge.tsx` for status indicators and role badges
    - _Requirements: 4.6, 6.7_

  - [x] 8.7 Create Skeleton component
    - Create `components/ui/skeleton.tsx` for loading states
    - _Requirements: 8.4_

  - [x] 8.8 Create Toast component
    - Create `components/ui/toast.tsx` for notifications
    - Support success, error, warning, info variants
    - _Requirements: 8.5_

  - [x] 8.9 Create Spinner component
    - Create `components/ui/spinner.tsx` for loading indicators
    - _Requirements: 8.4_

- [x] 9. Auth Provider and Middleware
  - [x] 9.1 Create auth provider component
    - Create `components/providers/auth-provider.tsx` for auth state initialization
    - Handle token restoration on app load
    - _Requirements: 8.7_

  - [x] 9.2 Implement Next.js middleware
    - Create `middleware.ts` for route protection
    - Implement JWT validation and expiration check
    - Handle redirect to login with return URL
    - Implement role-based access control for admin routes
    - _Requirements: 1.7, 1.8, 1.9, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Layout Components
  - [x] 10.1 Create Header component
    - Create `components/layout/header.tsx` with logo, language switcher, user menu
    - _Requirements: 7.7, 9.1_

  - [x] 10.2 Create BottomNav component
    - Create `components/layout/bottom-nav.tsx` for mobile navigation
    - Include Dashboard, Groups, Friends, Profile tabs
    - _Requirements: 9.1, 9.4_

  - [x] 10.3 Create Sidebar component
    - Create `components/layout/sidebar.tsx` for tablet/desktop navigation
    - _Requirements: 9.2_

  - [x] 10.4 Create PageContainer component
    - Create `components/layout/page-container.tsx` for consistent page layout
    - _Requirements: 9.1_

- [x] 11. Auth Pages
  - [x] 11.1 Create auth layout
    - Create `app/(auth)/layout.tsx` for public auth pages
    - _Requirements: 10.2_

  - [x] 11.2 Create login page
    - Create `app/(auth)/login/page.tsx` with login form
    - Implement form validation with React Hook Form and Zod
    - Handle login API call and token storage
    - Display localized error messages
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 11.3 Create LoginForm component
    - Create `components/forms/login-form.tsx` with username/password fields
    - _Requirements: 1.1, 5.8, 5.9_

- [x] 12. Protected Layout and Dashboard
  - [x] 12.1 Create protected layout
    - Create `app/(protected)/layout.tsx` with Header, BottomNav, and providers
    - _Requirements: 10.1_

  - [x] 12.2 Create dashboard page
    - Create `app/(protected)/dashboard/page.tsx` with groups overview
    - Display recent activity and quick actions
    - _Requirements: 4.9_

  - [x] 12.3 Update root page
    - Update `app/page.tsx` to redirect to dashboard or login
    - _Requirements: 10.2_

- [x] 13. Groups Feature
  - [x] 13.1 Create groups list page
    - Create `app/(protected)/groups/page.tsx` with group cards
    - Implement create group button and modal
    - _Requirements: 4.1, 4.9_

  - [x] 13.2 Create GroupCard component
    - Create `components/groups/group-card.tsx` with group info and member count
    - _Requirements: 4.9_

  - [x] 13.3 Create GroupForm component
    - Create `components/forms/group-form.tsx` for create/edit group
    - _Requirements: 4.1, 4.8_

  - [x] 13.4 Create group detail page
    - Create `app/(protected)/groups/[id]/page.tsx` with group info and tabs
    - _Requirements: 4.6_

  - [x] 13.5 Create MemberList component
    - Create `components/groups/member-list.tsx` with role badges
    - Implement admin actions (add, remove, change role) conditionally
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 13.6 Create MemberRoleBadge component
    - Create `components/groups/member-role-badge.tsx` for admin/member display
    - _Requirements: 4.6_

  - [x] 13.7 Create group settings page
    - Create `app/(protected)/groups/[id]/settings/page.tsx` for group management
    - _Requirements: 4.8_

- [x] 14. Chat Feature
  - [x] 14.1 Create group chat page
    - Create `app/(protected)/groups/[id]/chat/page.tsx` with chat container
    - _Requirements: 2.1_

  - [x] 14.2 Create ChatContainer component
    - Create `components/chat/chat-container.tsx` managing WebSocket connection
    - Handle join_group on mount and leave_group on unmount
    - _Requirements: 2.1, 2.9, 2.10_

  - [x] 14.3 Create MessageList component
    - Create `components/chat/message-list.tsx` with infinite scroll for history
    - _Requirements: 2.4, 2.5, 9.5_

  - [x] 14.4 Create MessageItem component
    - Create `components/chat/message-item.tsx` with sender info and timestamp
    - Support text, bill, and system message types
    - Handle emoji and Thai text rendering
    - _Requirements: 2.4, 2.8_

  - [x] 14.5 Create MessageInput component
    - Create `components/chat/message-input.tsx` with send button
    - Implement typing indicator sending
    - _Requirements: 2.3, 2.6_

  - [x] 14.6 Create TypingIndicator component
    - Create `components/chat/typing-indicator.tsx` showing who is typing
    - _Requirements: 2.7_

- [x] 15. Bills Feature
  - [x] 15.1 Create group bills page
    - Create `app/(protected)/groups/[id]/bills/page.tsx` with bill list
    - Implement pagination
    - _Requirements: 5.7_

  - [x] 15.2 Create BillCard component
    - Create `components/bills/bill-card.tsx` with title, amount, status
    - _Requirements: 5.6_

  - [x] 15.3 Create new bill page
    - Create `app/(protected)/groups/[id]/bills/new/page.tsx` with bill form
    - _Requirements: 5.1_

  - [x] 15.4 Create BillForm component
    - Create `components/forms/bill-form.tsx` with React Hook Form
    - Implement split type selection (equal/custom)
    - Add participant selection from group members
    - Show client-side preview of calculated amounts
    - Validate with Zod schema
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9_

  - [x] 15.5 Create SplitCalculator component
    - Create `components/bills/split-calculator.tsx` for amount preview
    - Handle equal and custom split calculations
    - _Requirements: 5.2, 5.3_

  - [x] 15.6 Create bill detail page
    - Create `app/(protected)/groups/[id]/bills/[billId]/page.tsx`
    - _Requirements: 5.6_

  - [x] 15.7 Create BillDetail component
    - Create `components/bills/bill-detail.tsx` with full bill info
    - _Requirements: 5.6_

  - [x] 15.8 Create ParticipantList component
    - Create `components/bills/participant-list.tsx` with payment status
    - _Requirements: 5.6, 6.7_

  - [x] 15.9 Create QRCodeDisplay component
    - Create `components/bills/qr-code-display.tsx` using qrcode library
    - Render PromptPay-compatible QR codes
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 15.10 Implement payment status updates
    - Add payment status update functionality with WebSocket notifications
    - Handle bill_settled event to update UI
    - _Requirements: 6.4, 6.5, 6.6_

- [x] 16. Friends Feature
  - [x] 16.1 Create friends page
    - Create `app/(protected)/friends/page.tsx` with tabs (Friends, Requests, Search)
    - _Requirements: 3.6_

  - [x] 16.2 Create FriendCard component
    - Create `components/friends/friend-card.tsx` with user info
    - _Requirements: 3.6_

  - [x] 16.3 Create FriendSearch component
    - Create `components/friends/friend-search.tsx` with search input
    - Implement paginated search results
    - _Requirements: 3.1, 3.7_

  - [x] 16.4 Create FriendRequestCard component
    - Create `components/friends/friend-request-card.tsx` with accept/reject buttons
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 17. Profile Feature
  - [x] 17.1 Create profile page
    - Create `app/(protected)/profile/page.tsx` with user info and settings
    - Include language switcher
    - _Requirements: 7.7_

  - [x] 17.2 Create ProfileForm component
    - Create `components/forms/profile-form.tsx` for profile editing
    - _Requirements: 8.1_

- [ ] 18. Testing
  - [ ] 18.1 Set up testing infrastructure
    - Install Jest, React Testing Library, MSW
    - Configure test environment
    - _Requirements: 8.1_

  - [ ] 18.2 Write unit tests for utilities
    - Test currency.ts formatting functions
    - Test date.ts formatting functions
    - Test validation.ts Zod schemas
    - _Requirements: 7.3, 7.4_

  - [ ] 18.3 Write unit tests for stores
    - Test auth-store.ts actions
    - Test chat-store.ts actions
    - _Requirements: 8.2_

  - [ ] 18.4 Write integration tests for API client
    - Test API client with MSW mocks
    - Test token refresh flow
    - _Requirements: 1.5, 1.6_

  - [ ] 18.5 Write component tests
    - Test form components with React Testing Library
    - Test bill form validation
    - _Requirements: 5.8_
