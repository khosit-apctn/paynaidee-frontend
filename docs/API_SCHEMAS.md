# PayNaiDee API Request/Response Schemas

This document provides comprehensive documentation for all API request and response schemas used in the PayNaiDee backend API.

> **Note**: For detailed JWT authentication documentation including token structure, usage examples in multiple languages, and security best practices, see [AUTHENTICATION.md](./AUTHENTICATION.md).

## Table of Contents

- [Standard Response Structure](#standard-response-structure)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Friendship](#friendship)
- [Group Management](#group-management)
- [Chat Messages](#chat-messages)
- [Bill Management](#bill-management)
- [QR Code Generation](#qr-code-generation)
- [WebSocket Messages](#websocket-messages)
- [Error Codes](#error-codes)
- [Success Codes](#success-codes)

---

## Standard Response Structure

All API responses follow a consistent structure:

```json
{
  "success": true,
  "code": "SUCCESS_CODE",
  "message": "Human-readable message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "code": "ERR_CODE",
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```

### Paginated Response

```json
{
  "success": true,
  "code": "SUCCESS_CODE",
  "message": "Data retrieved",
  "data": {
    "items": [...],
    "limit": 10,
    "offset": 0,
    "page": 1
  }
}
```

---

## Authentication

### POST /api/v1/auth/register

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "phone_number": "0812345678",
  "display_name": "John Doe"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| username | string | Yes | 3-50 characters, unique |
| email | string | Yes | Valid email, unique |
| password | string | Yes | Minimum 6 characters |
| phone_number | string | No | Thai phone format |
| display_name | string | No | - |

**Response (201):**
```json
{
  "success": true,
  "code": "SUCCESS_REGISTER",
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "0812345678",
      "display_name": "John Doe",
      "avatar": "",
      "role": "user",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### POST /api/v1/auth/login

**Request:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

| Field | Type | Required |
|-------|------|----------|
| username | string | Yes |
| password | string | Yes |

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_LOGIN",
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### POST /api/v1/auth/refresh

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_LOGIN",
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### POST /api/v1/auth/logout

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_LOGOUT",
  "message": "Logout successful"
}
```

---

## User Management

### GET /api/v1/users/me

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_PROFILE_RETRIEVED",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "0812345678",
    "display_name": "John Doe",
    "avatar": "avatar.jpg",
    "role": "user",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/v1/users/me

**Request:**
```json
{
  "display_name": "John D.",
  "avatar": "new-avatar.jpg"
}
```

| Field | Type | Required |
|-------|------|----------|
| display_name | string | No |
| avatar | string | No |

**Response (200):** Same as GET /api/v1/users/me

### GET /api/v1/users/search

**Query Parameters:**
| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| q | string | Yes | - | - |
| limit | int | No | 10 | 100 |
| offset | int | No | 0 | - |

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_SEARCH_COMPLETE",
  "message": "Search completed",
  "data": {
    "users": [
      {
        "id": 2,
        "username": "janedoe",
        "email": "jane@example.com",
        ...
      }
    ],
    "limit": 10,
    "offset": 0,
    "page": 1
  }
}
```

---

## Friendship

### POST /api/v1/users/friends/request

**Request:**
```json
{
  "addressee_id": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "code": "SUCCESS_FRIEND_REQUEST_SENT",
  "message": "Friend request sent",
  "data": {
    "id": 1,
    "requester_id": 1,
    "addressee_id": 2,
    "status": "pending",
    "requester": { ... },
    "addressee": { ... },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/v1/users/friends/{id}/accept

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_FRIEND_REQUEST_ACCEPTED",
  "message": "Friend request accepted",
  "data": {
    "id": 1,
    "status": "accepted",
    ...
  }
}
```

### PUT /api/v1/users/friends/{id}/reject

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_FRIEND_REQUEST_REJECTED",
  "message": "Friend request rejected",
  "data": {
    "id": 1,
    "status": "rejected",
    ...
  }
}
```

### GET /api/v1/users/friends

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_FRIENDS_RETRIEVED",
  "message": "Friends list retrieved",
  "data": {
    "friends": [
      {
        "id": 2,
        "username": "janedoe",
        ...
      }
    ]
  }
}
```

---

## Group Management

### POST /api/v1/groups

**Request:**
```json
{
  "name": "Team Lunch",
  "avatar": "group-avatar.png"
}
```

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| avatar | string | No |

**Response (201):**
```json
{
  "success": true,
  "code": "SUCCESS_GROUP_CREATED",
  "message": "Group created",
  "data": {
    "id": 1,
    "name": "Team Lunch",
    "avatar": "group-avatar.png",
    "created_by": 1,
    "creator": { ... },
    "members": [
      {
        "id": 1,
        "group_id": 1,
        "user_id": 1,
        "role": "admin",
        "user": { ... },
        "joined_at": "2024-01-15T10:30:00Z"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/v1/groups

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_GROUPS_RETRIEVED",
  "message": "Groups retrieved",
  "data": {
    "groups": [ ... ]
  }
}
```

### GET /api/v1/groups/{id}

**Response (200):** Same structure as POST /api/v1/groups response

### PUT /api/v1/groups/{id}

**Request:**
```json
{
  "name": "Updated Name",
  "avatar": "new-avatar.png"
}
```

**Response (200):** Same structure as POST /api/v1/groups response

### POST /api/v1/groups/{id}/members

**Request:**
```json
{
  "user_id": 3,
  "role": "member"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| user_id | int | Yes | - |
| role | string | Yes | admin, member |

**Response (201):**
```json
{
  "success": true,
  "code": "SUCCESS_MEMBER_ADDED",
  "message": "Member added"
}
```

### PUT /api/v1/groups/{id}/members/{userId}/role

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_MEMBER_ROLE_UPDATED",
  "message": "Member role updated"
}
```

### DELETE /api/v1/groups/{id}/members/{userId}

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_MEMBER_REMOVED",
  "message": "Member removed"
}
```

---

## Chat Messages

### GET /api/v1/groups/{id}/messages

**Query Parameters:**
| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| limit | int | No | 50 | 100 |
| offset | int | No | 0 | - |

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_MESSAGES_RETRIEVED",
  "message": "Messages retrieved",
  "data": {
    "messages": [
      {
        "id": 1,
        "group_id": 1,
        "sender_id": 1,
        "content": "Hello everyone!",
        "type": "text",
        "metadata": "{}",
        "sender": { ... },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "limit": 50,
    "offset": 0,
    "page": 1
  }
}
```

### POST /api/v1/groups/{id}/messages

**Request:**
```json
{
  "content": "Hello everyone!",
  "type": "text",
  "metadata": "{}"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| content | string | Yes | Max 10000 chars |
| type | string | No | text, bill, system (default: text) |
| metadata | string | No | JSON string |

**Response (201):**
```json
{
  "success": true,
  "code": "SUCCESS_MESSAGE_SENT",
  "message": "Message sent",
  "data": {
    "id": 1,
    "group_id": 1,
    "sender_id": 1,
    "content": "Hello everyone!",
    "type": "text",
    "metadata": "{}",
    "sender": { ... },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Bill Management

### POST /api/v1/groups/{id}/bills

**Request:**
```json
{
  "title": "Team Dinner",
  "description": "Friday team dinner at restaurant",
  "total_amount": 1500.00,
  "service_charge": 10.0,
  "split_type": "equal",
  "qr_header": "Team Dinner Payment",
  "participants": [
    { "user_id": 1 },
    { "user_id": 2 },
    { "user_id": 3 }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Bill title |
| description | string | No | Bill description |
| total_amount | float | Yes | Total amount in Thai Baht (> 0) |
| service_charge | float | No | Service charge percentage (0-100) |
| split_type | string | Yes | "equal" or "custom" |
| qr_header | string | No | Custom QR code header |
| participants | array | Yes | Min 1 participant |
| participants[].user_id | int | Yes | Participant user ID |
| participants[].amount | float | No* | Required for custom split |

**Response (201):**
```json
{
  "success": true,
  "code": "SUCCESS_BILL_CREATED",
  "message": "Bill created",
  "data": {
    "id": 1,
    "group_id": 1,
    "created_by": 1,
    "title": "Team Dinner",
    "description": "Friday team dinner at restaurant",
    "total_amount": 1500.00,
    "service_charge": 10.0,
    "split_type": "equal",
    "status": "pending",
    "qr_header": "Team Dinner Payment",
    "creator": { ... },
    "group": { ... },
    "participants": [
      {
        "id": 1,
        "bill_id": 1,
        "user_id": 1,
        "amount": 550.00,
        "payment_status": "pending",
        "user": { ... },
        "paid_at": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/v1/groups/{id}/bills

**Query Parameters:**
| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| limit | int | No | 20 | 100 |
| offset | int | No | 0 | - |

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_BILLS_RETRIEVED",
  "message": "Bills retrieved",
  "data": {
    "bills": [ ... ],
    "limit": 20,
    "offset": 0,
    "page": 1
  }
}
```

### GET /api/v1/bills/{id}

**Response (200):** Same structure as POST /api/v1/groups/{id}/bills response

### PUT /api/v1/bills/{id}/participants/{userId}/payment

**Request:**
```json
{
  "status": "paid"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| status | string | Yes | paid, pending |

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_PAYMENT_STATUS_UPDATED",
  "message": "Payment status updated"
}
```

---

## QR Code Generation

### GET /api/v1/bills/{id}/qr

Generate a PromptPay QR code for the full bill amount.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| header | string | No | Custom header text for QR code |

**Response (200):**
```json
{
  "success": true,
  "code": "SUCCESS_QR_GENERATED",
  "message": "QR code generated",
  "data": {
    "qr_data": "00020101021229370016A000000677010111011300668123456785303764540530058025863041234",
    "amount": 1500.00,
    "identifier": "0812345678",
    "header": "Team Dinner Payment",
    "bill_id": 1,
    "payee_user_id": 1
  }
}
```

### GET /api/v1/bills/{id}/participants/{userId}/qr

Generate a PromptPay QR code for a specific participant's amount.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| header | string | No | Custom header text for QR code |

**Response (200):** Same structure as GET /api/v1/bills/{id}/qr

---

## WebSocket Messages

Connect to WebSocket at: `ws://localhost:8080/ws?token=<access_token>`

### Message Format

All WebSocket messages follow this structure:

```json
{
  "type": "message_type",
  "payload": { ... }
}
```

### Client to Server Messages

#### chat_message
Send a chat message to a group.

```json
{
  "type": "chat_message",
  "payload": {
    "group_id": 1,
    "content": "Hello everyone!",
    "metadata": ""
  }
}
```

#### typing
Send typing indicator.

```json
{
  "type": "typing",
  "payload": {
    "group_id": 1,
    "is_typing": true
  }
}
```

#### join_group
Join a group chat room.

```json
{
  "type": "join_group",
  "payload": {
    "group_id": 1
  }
}
```

#### leave_group
Leave a group chat room.

```json
{
  "type": "leave_group",
  "payload": {
    "group_id": 1
  }
}
```

### Server to Client Messages

#### chat_message
Receive a chat message.

```json
{
  "type": "chat_message",
  "payload": {
    "id": 1,
    "group_id": 1,
    "sender_id": 1,
    "content": "Hello everyone!",
    "type": "text",
    "metadata": "",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### typing
Receive typing indicator.

```json
{
  "type": "typing",
  "payload": {
    "group_id": 1,
    "user_id": 1,
    "is_typing": true
  }
}
```

#### payment_status_update
Payment status changed notification.

```json
{
  "type": "payment_status_update",
  "payload": {
    "bill_id": 1,
    "group_id": 1,
    "user_id": 1,
    "payment_status": "paid",
    "updated_by": 2
  }
}
```

#### bill_settled
Bill fully settled notification.

```json
{
  "type": "bill_settled",
  "payload": {
    "bill_id": 1,
    "group_id": 1,
    "title": "Team Dinner"
  }
}
```

#### error
Error message.

```json
{
  "type": "error",
  "payload": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid message format"
  }
}
```

---

## Error Codes

### Authentication Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_INVALID_CREDENTIALS | 401 | Invalid username or password |
| ERR_UNAUTHORIZED | 401 | Missing or invalid authentication token |
| ERR_TOKEN_EXPIRED | 401 | JWT token has expired |
| ERR_INVALID_TOKEN | 401 | Malformed or invalid JWT token |

### Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_INVALID_INPUT | 400 | Request body validation failed |
| ERR_INVALID_GROUP | 400 | Invalid group ID format |
| ERR_INVALID_BILL_ID | 400 | Invalid bill ID format |

### Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_USER_NOT_FOUND | 404 | User does not exist |
| ERR_GROUP_NOT_FOUND | 404 | Group does not exist |
| ERR_BILL_NOT_FOUND | 404 | Bill does not exist |
| ERR_FRIENDSHIP_NOT_FOUND | 404 | Friendship record not found |

### Permission Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_FORBIDDEN | 403 | User lacks permission for this action |
| ERR_NOT_GROUP_MEMBER | 403 | User is not a member of the group |
| ERR_NOT_GROUP_ADMIN | 403 | User is not an admin of the group |
| ERR_NOT_PARTICIPANT | 403 | User is not a participant in the bill |

### Conflict Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_USER_EXISTS | 409 | Username or email already registered |
| ERR_FRIENDSHIP_EXISTS | 409 | Friendship already exists |
| ERR_ALREADY_MEMBER | 409 | User is already a group member |

### Server Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ERR_INTERNAL_ERROR | 500 | Internal server error |
| ERR_DATABASE_ERROR | 500 | Database operation failed |

---

## Success Codes

### Authentication

| Code | Description |
|------|-------------|
| SUCCESS_REGISTER | User registered successfully |
| SUCCESS_LOGIN | Login successful |
| SUCCESS_LOGOUT | Logout successful |
| SUCCESS_TOKEN_REFRESHED | Token refreshed successfully |

### User Management

| Code | Description |
|------|-------------|
| SUCCESS_PROFILE_RETRIEVED | Profile retrieved successfully |
| SUCCESS_PROFILE_UPDATED | Profile updated successfully |
| SUCCESS_SEARCH_COMPLETE | User search completed |
| SUCCESS_FRIENDS_RETRIEVED | Friends list retrieved |
| SUCCESS_FRIEND_REQUEST_SENT | Friend request sent |
| SUCCESS_FRIEND_REQUEST_ACCEPTED | Friend request accepted |
| SUCCESS_FRIEND_REQUEST_REJECTED | Friend request rejected |

### Group Management

| Code | Description |
|------|-------------|
| SUCCESS_GROUP_CREATED | Group created successfully |
| SUCCESS_GROUP_RETRIEVED | Group retrieved successfully |
| SUCCESS_GROUP_UPDATED | Group updated successfully |
| SUCCESS_GROUPS_RETRIEVED | Groups list retrieved |
| SUCCESS_MEMBER_ADDED | Member added to group |
| SUCCESS_MEMBER_REMOVED | Member removed from group |
| SUCCESS_MEMBER_ROLE_UPDATED | Member role updated |

### Chat

| Code | Description |
|------|-------------|
| SUCCESS_MESSAGE_SENT | Message sent successfully |
| SUCCESS_MESSAGES_RETRIEVED | Messages retrieved successfully |

### Bills

| Code | Description |
|------|-------------|
| SUCCESS_BILL_CREATED | Bill created successfully |
| SUCCESS_BILL_RETRIEVED | Bill retrieved successfully |
| SUCCESS_BILLS_RETRIEVED | Bills list retrieved |
| SUCCESS_PAYMENT_STATUS_UPDATED | Payment status updated |

### QR Code

| Code | Description |
|------|-------------|
| SUCCESS_QR_GENERATED | QR code generated successfully |

### Health

| Code | Description |
|------|-------------|
| SUCCESS_HEALTH_CHECK | Service is healthy |

---

## Data Types Reference

### User Object

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "phone_number": "0812345678",
  "display_name": "John Doe",
  "avatar": "avatar.jpg",
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Group Object

```json
{
  "id": 1,
  "name": "Team Lunch",
  "avatar": "group-avatar.png",
  "created_by": 1,
  "creator": { /* User object */ },
  "members": [ /* GroupMember objects */ ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### GroupMember Object

```json
{
  "id": 1,
  "group_id": 1,
  "user_id": 1,
  "role": "admin",
  "user": { /* User object */ },
  "joined_at": "2024-01-15T10:30:00Z"
}
```

### Message Object

```json
{
  "id": 1,
  "group_id": 1,
  "sender_id": 1,
  "content": "Hello!",
  "type": "text",
  "metadata": "{}",
  "sender": { /* User object */ },
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Bill Object

```json
{
  "id": 1,
  "group_id": 1,
  "created_by": 1,
  "title": "Team Dinner",
  "description": "Friday dinner",
  "total_amount": 1500.00,
  "service_charge": 10.0,
  "split_type": "equal",
  "status": "pending",
  "qr_header": "Payment",
  "creator": { /* User object */ },
  "group": { /* Group object */ },
  "participants": [ /* BillParticipant objects */ ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### BillParticipant Object

```json
{
  "id": 1,
  "bill_id": 1,
  "user_id": 1,
  "amount": 550.00,
  "payment_status": "pending",
  "user": { /* User object */ },
  "paid_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Friendship Object

```json
{
  "id": 1,
  "requester_id": 1,
  "addressee_id": 2,
  "status": "pending",
  "requester": { /* User object */ },
  "addressee": { /* User object */ },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```
