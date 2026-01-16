# Requirements Document

## Introduction

PayNaiDee (เปย์ไหนดี) is a backend API service built with Go that supports a mobile-first expense sharing application. The backend provides REST APIs and WebSocket connections for real-time chat, user authentication with role-based permissions, group management, bill splitting calculations, QR code generation, and payment status tracking. The service is designed to handle concurrent users and real-time messaging while maintaining data consistency for financial transactions.

## Requirements

### Requirement 1

**User Story:** As a client application, I want to authenticate users with role-based permissions via API, so that users can access appropriate features based on their user level.

#### Acceptance Criteria

1. WHEN a client sends login credentials THEN the API SHALL validate credentials against the database
2. WHEN credentials are valid THEN the API SHALL return a JWT token with role information
3. WHEN a JWT token is provided THEN the API SHALL validate and extract user permissions
4. IF authentication fails THEN the API SHALL return appropriate HTTP error codes and messages
5. WHEN token expires THEN the API SHALL provide refresh token functionality

### Requirement 2

**User Story:** As a client application, I want to enable real-time group and private chat via WebSocket connections, so that users can communicate while managing expenses.

#### Acceptance Criteria

1. WHEN a client connects via WebSocket THEN the API SHALL authenticate and establish a persistent connection
2. WHEN a message is sent THEN the API SHALL broadcast it to all relevant group members in real-time
3. WHEN retrieving chat history THEN the API SHALL return paginated message history for groups and private chats
4. WHEN a user joins/leaves a group THEN the API SHALL notify other members via WebSocket
5. WHEN managing chat rooms THEN the API SHALL provide endpoints to list user's groups and private conversations
6. WHEN a connection drops THEN the API SHALL handle reconnection and message queuing

### Requirement 3

**User Story:** As a client application, I want to manage friends and groups with roles via API endpoints, so that users can organize their social circles for expense sharing.

#### Acceptance Criteria

1. WHEN searching for friends THEN the API SHALL provide endpoints to search users by contact info or user ID
2. WHEN creating a group THEN the API SHALL accept group name, avatar, and member list with roles
3. WHEN assigning roles THEN the API SHALL validate permissions and store role assignments (admin, member)
4. WHEN a group is created THEN the API SHALL automatically create associated chat room and return group ID
5. WHEN accessing group features THEN the API SHALL enforce role-based permissions for all operations
6. WHEN managing friendships THEN the API SHALL provide endpoints for friend requests, acceptance, and removal

### Requirement 4

**User Story:** As a client application, I want to process bill splitting calculations via API, so that users can fairly distribute expenses using different methods.

#### Acceptance Criteria

1. WHEN creating a bill THEN the API SHALL accept bill details including total amount, participants, and split type
2. WHEN calculating equal split THEN the API SHALL divide the total amount equally among all participants
3. WHEN calculating custom split THEN the API SHALL accept individual amounts and validate they sum to the total
4. WHEN service charge is specified THEN the API SHALL apply the percentage to individual amounts and recalculate totals
5. WHEN bill is finalized THEN the API SHALL store the bill record and return bill ID for QR generation
6. WHEN retrieving bill details THEN the API SHALL return complete bill information including participant amounts

### Requirement 5

**User Story:** As a client application, I want to generate QR codes and process payment data via API, so that users can facilitate easy payment processing.

#### Acceptance Criteria

1. WHEN generating QR code THEN the API SHALL create QR code data with bill details, payer info, and customizable header
2. WHEN QR code is requested THEN the API SHALL return QR code image or data string for client rendering
3. WHEN processing bill images THEN the API SHALL provide endpoints for image upload and OCR processing (placeholder)
4. WHEN validating payment data THEN the API SHALL ensure QR codes contain accurate PromptPay-compatible information
5. WHEN retrieving QR details THEN the API SHALL return all associated bill and payment information

### Requirement 6

**User Story:** As a client application, I want to track and update payment status via API, so that users can monitor payment completion for each participant.

#### Acceptance Criteria

1. WHEN retrieving payment status THEN the API SHALL return each participant's status as "pending" or "paid"
2. WHEN updating payment status THEN the API SHALL provide endpoints for manual payment confirmation
3. WHEN PromptPay integration is available THEN the API SHALL automatically detect and confirm payments
4. WHEN payment status changes THEN the API SHALL broadcast updates via WebSocket to relevant users
5. WHEN all payments are complete THEN the API SHALL mark the bill as fully settled and notify participants
6. WHEN querying bill status THEN the API SHALL return summary of paid/unpaid participants

### Requirement 7

**User Story:** As a client application, I want efficient API responses optimized for mobile usage, so that the mobile app can provide smooth user experience.

#### Acceptance Criteria

1. WHEN making API requests THEN the API SHALL return responses optimized for mobile bandwidth constraints
2. WHEN retrieving data lists THEN the API SHALL support pagination to reduce payload size
3. WHEN handling concurrent requests THEN the API SHALL maintain performance under mobile network conditions
4. WHEN caching is applicable THEN the API SHALL provide appropriate cache headers for mobile optimization
5. WHEN errors occur THEN the API SHALL return structured error responses suitable for mobile error handling

### Requirement 8

**User Story:** As a client application, I want to receive properly formatted data that supports Thai language and cultural preferences, so that the mobile app can display content appropriately.

#### Acceptance Criteria

1. WHEN returning text data THEN the API SHALL properly handle Thai Unicode characters and encoding
2. WHEN processing user input THEN the API SHALL validate and store Thai text correctly
3. WHEN formatting currency THEN the API SHALL return amounts in Thai Baht format
4. WHEN handling timestamps THEN the API SHALL support Thai timezone (UTC+7) and locale formatting
5. WHEN providing error messages THEN the API SHALL support both Thai and English error responses
6. WHEN processing emoji in chat THEN the API SHALL handle Unicode emoji characters correctly