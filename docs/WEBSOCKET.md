# WebSocket API Documentation

PayNaiDee uses WebSocket for real-time communication including chat messaging, typing indicators, and payment status updates.

## Table of Contents

- [Connection Protocol](#connection-protocol)
- [Message Format](#message-format)
- [Message Types](#message-types)
  - [Client to Server](#client-to-server-messages)
  - [Server to Client](#server-to-client-messages)
- [Error Handling](#error-handling)
- [Connection Management](#connection-management)
- [Best Practices](#best-practices)
- [Code Examples](#code-examples)

---

## Connection Protocol

### Endpoint

```
ws://localhost:8080/ws?token=<access_token>
```

For production environments:
```
wss://your-domain.com/ws?token=<access_token>
```

### Authentication

WebSocket connections require JWT authentication. Pass your access token as a query parameter when establishing the connection.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Valid JWT access token obtained from `/api/v1/auth/login` |

### Connection Flow

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Server    │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. HTTP GET /ws?token=<jwt>               │
       │ ─────────────────────────────────────────► │
       │                                            │
       │  2. Validate JWT token                     │
       │                                            │
       │  3. HTTP 101 Switching Protocols           │
       │ ◄───────────────────────────────────────── │
       │                                            │
       │  4. WebSocket connection established       │
       │ ◄─────────────────────────────────────────►│
       │                                            │
       │  5. Client registered in Hub               │
       │                                            │
       │  6. Ready for bidirectional messaging      │
       │ ◄─────────────────────────────────────────►│
       │                                            │
```

### Connection Parameters

| Setting | Value | Description |
|---------|-------|-------------|
| Read Buffer Size | 1024 bytes | Maximum size for incoming messages |
| Write Buffer Size | 1024 bytes | Maximum size for outgoing messages |
| Max Message Size | 512 KB | Maximum allowed message payload |
| Ping Interval | 54 seconds | Server sends ping to keep connection alive |
| Pong Timeout | 60 seconds | Connection closed if no pong received |
| Write Timeout | 10 seconds | Maximum time to write a message |

### Connection States

| State | Description |
|-------|-------------|
| `CONNECTING` | Initial state, attempting to establish connection |
| `OPEN` | Connection established, ready for messaging |
| `CLOSING` | Connection is being closed |
| `CLOSED` | Connection has been closed |

---

## Message Format

All WebSocket messages use JSON format with a consistent structure:

### Base Message Structure

```json
{
  "type": "<message_type>",
  "payload": {
    // type-specific data
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Message type identifier |
| `payload` | object | Yes | Type-specific message data |

### Supported Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `chat_message` | Bidirectional | Chat messages in group conversations |
| `typing` | Bidirectional | Typing indicator notifications |
| `join_group` | Client → Server | Join a group chat room |
| `leave_group` | Client → Server | Leave a group chat room |
| `payment_status_update` | Server → Client | Payment status change notification |
| `bill_settled` | Server → Client | Bill fully settled notification |
| `error` | Server → Client | Error notification |

---

## Message Types

### Client to Server Messages

#### 1. Chat Message (`chat_message`)

Send a message to a group chat. The message will be persisted and broadcast to all group members.

**Request:**
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

**Payload Fields:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `group_id` | integer | Yes | > 0 | Target group ID |
| `content` | string | Yes | 1-10000 chars | Message content |
| `metadata` | string | No | Valid JSON | Additional data (e.g., bill reference) |

**Validation Rules:**
- `group_id` must be a positive integer
- `content` cannot be empty
- `content` maximum length is 10,000 characters
- User must be a member of the target group

**Success Response:** Server broadcasts the persisted message to all group members (see [Server Chat Message](#1-chat-message-chat_message-1))

**Error Responses:**
- `VALIDATION_ERROR` - Invalid payload format
- `PERSIST_ERROR` - Failed to save message
- `FORBIDDEN` - User is not a member of the group

---

#### 2. Typing Indicator (`typing`)

Notify group members that you're typing. This is a transient notification and is not persisted.

**Request:**
```json
{
  "type": "typing",
  "payload": {
    "group_id": 1,
    "is_typing": true
  }
}
```

**Payload Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `group_id` | integer | Yes | Target group ID |
| `is_typing` | boolean | Yes | `true` when typing starts, `false` when stopped |

**Validation Rules:**
- `group_id` must be a positive integer
- User must be a member of the target group

**Note:** Typing indicator errors fail silently to avoid disrupting the user experience.

---

#### 3. Join Group (`join_group`)

Join a group chat room to receive messages. This validates group membership.

**Request:**
```json
{
  "type": "join_group",
  "payload": {
    "group_id": 1
  }
}
```

**Payload Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `group_id` | integer | Yes | Group ID to join |

**Validation Rules:**
- `group_id` must be a positive integer
- User must be a member of the group

**Error Responses:**
- `VALIDATION_ERROR` - Invalid payload format
- `FORBIDDEN` - User is not a member of the group
- `SERVER_ERROR` - Failed to verify group membership

---

#### 4. Leave Group (`leave_group`)

Leave a group chat room to stop receiving messages.

**Request:**
```json
{
  "type": "leave_group",
  "payload": {
    "group_id": 1
  }
}
```

**Payload Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `group_id` | integer | Yes | Group ID to leave |

**Validation Rules:**
- `group_id` must be a positive integer

---

### Server to Client Messages

#### 1. Chat Message (`chat_message`)

Receive a chat message from a group. This is broadcast to all connected group members.

**Response:**
```json
{
  "type": "chat_message",
  "payload": {
    "id": 123,
    "group_id": 1,
    "sender_id": 2,
    "content": "Hello everyone!",
    "type": "text",
    "metadata": "",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Payload Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique message ID |
| `group_id` | integer | Group where message was sent |
| `sender_id` | integer | User ID of the sender |
| `content` | string | Message content |
| `type` | string | Message type: `text`, `bill`, or `system` |
| `metadata` | string | Additional JSON data (optional) |
| `created_at` | string | ISO 8601 timestamp |

**Message Types:**

| Type | Description |
|------|-------------|
| `text` | Regular text message |
| `bill` | Bill-related message (metadata contains bill info) |
| `system` | System notification (e.g., member joined) |

---

#### 2. Typing Indicator (`typing`)

Receive typing indicator from another user in a group.

**Response:**
```json
{
  "type": "typing",
  "payload": {
    "group_id": 1,
    "user_id": 2,
    "is_typing": true
  }
}
```

**Payload Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `group_id` | integer | Group where user is typing |
| `user_id` | integer | User ID of the person typing |
| `is_typing` | boolean | Whether user is currently typing |

---

#### 3. Payment Status Update (`payment_status_update`)

Receive notification when a payment status changes for a bill participant.

**Response:**
```json
{
  "type": "payment_status_update",
  "payload": {
    "bill_id": 1,
    "group_id": 1,
    "user_id": 2,
    "payment_status": "paid",
    "updated_by": 3
  }
}
```

**Payload Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `bill_id` | integer | Bill ID |
| `group_id` | integer | Group ID associated with the bill |
| `user_id` | integer | User whose payment status changed |
| `payment_status` | string | New status: `pending` or `paid` |
| `updated_by` | integer | User ID who made the update |

---

#### 4. Bill Settled (`bill_settled`)

Receive notification when all participants have paid and the bill is fully settled.

**Response:**
```json
{
  "type": "bill_settled",
  "payload": {
    "bill_id": 1,
    "group_id": 1,
    "title": "Dinner at Restaurant"
  }
}
```

**Payload Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `bill_id` | integer | Bill ID that was settled |
| `group_id` | integer | Group ID associated with the bill |
| `title` | string | Bill title/description |

---

#### 5. Error (`error`)

Receive error notification when a client message fails processing.

**Response:**
```json
{
  "type": "error",
  "payload": {
    "code": "NOT_A_MEMBER",
    "message": "You are not a member of this group"
  }
}
```

**Payload Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Error code for programmatic handling |
| `message` | string | Human-readable error description |

---

## Error Handling

### Error Codes

| Code | HTTP Equivalent | Description |
|------|-----------------|-------------|
| `PARSE_ERROR` | 400 | Message format is invalid JSON |
| `INVALID_PAYLOAD` | 400 | Payload structure is incorrect |
| `VALIDATION_ERROR` | 400 | Payload data failed validation |
| `UNKNOWN_TYPE` | 400 | Unrecognized message type |
| `UNAUTHORIZED` | 401 | Authentication failed or token expired |
| `FORBIDDEN` | 403 | User lacks permission for the action |
| `NOT_A_MEMBER` | 403 | User is not a member of the group |
| `GROUP_NOT_FOUND` | 404 | Group does not exist |
| `PERSIST_ERROR` | 500 | Failed to save data to database |
| `SERVER_ERROR` | 500 | Internal server error |

### Error Handling Strategy

1. **Parse Errors**: Returned when JSON parsing fails
2. **Validation Errors**: Returned when payload validation fails
3. **Permission Errors**: Returned when user lacks access
4. **Server Errors**: Returned for internal failures

**Note:** Typing indicator errors fail silently to avoid disrupting user experience.

---

## Connection Management

### Ping/Pong Heartbeat

The server sends periodic ping messages to keep the connection alive and detect stale connections.

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Server    │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │              (every 54 seconds)            │
       │ ◄──────────── PING ─────────────────────── │
       │                                            │
       │ ─────────────── PONG ────────────────────► │
       │                                            │
       │     (connection stays alive)               │
       │                                            │
```

- **Ping Interval**: 54 seconds
- **Pong Timeout**: 60 seconds
- Most WebSocket libraries handle pong responses automatically

### Multiple Device Connections

When a user connects from a new device:
1. The existing connection is closed
2. The new connection replaces the old one
3. Only one active connection per user is maintained

```
Device A connected ──► User has 1 connection
Device B connects  ──► Device A disconnected, User has 1 connection (Device B)
```

### Reconnection Strategy

Implement exponential backoff for reconnection:

```javascript
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_DELAY_MS = 1000;

let reconnectAttempts = 0;

function connect() {
  const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
  
  ws.onopen = () => {
    console.log('Connected');
    reconnectAttempts = 0; // Reset on successful connection
  };
  
  ws.onclose = (event) => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.pow(2, reconnectAttempts) * BASE_DELAY_MS;
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(connect, delay);
      reconnectAttempts++;
    } else {
      console.error('Max reconnection attempts reached');
    }
  };
}
```

**Reconnection Delays:**

| Attempt | Delay |
|---------|-------|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 4 seconds |
| 4 | 8 seconds |
| 5 | 16 seconds |

### Graceful Disconnection

To gracefully close a connection:

```javascript
// Client-initiated close
ws.close(1000, 'Normal closure');
```

**Close Codes:**

| Code | Description |
|------|-------------|
| 1000 | Normal closure |
| 1001 | Going away (e.g., page navigation) |
| 1006 | Abnormal closure (no close frame received) |
| 1008 | Policy violation |
| 1011 | Server error |

---

## Best Practices

### 1. Join Groups on Connect

After establishing a connection, join all relevant groups to receive messages:

```javascript
ws.onopen = () => {
  // Join all user's groups
  userGroups.forEach(groupId => {
    ws.send(JSON.stringify({
      type: 'join_group',
      payload: { group_id: groupId }
    }));
  });
};
```

### 2. Debounce Typing Indicators

Don't send typing indicators on every keystroke:

```javascript
let typingTimeout;
const TYPING_DEBOUNCE_MS = 500;

function handleTyping(groupId) {
  if (!typingTimeout) {
    sendTyping(groupId, true);
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTyping(groupId, false);
    typingTimeout = null;
  }, TYPING_DEBOUNCE_MS);
}
```

### 3. Validate Messages Client-Side

Validate message content before sending to reduce server errors:

```javascript
function sendMessage(groupId, content) {
  if (!groupId || groupId <= 0) {
    console.error('Invalid group ID');
    return;
  }
  
  if (!content || content.trim().length === 0) {
    console.error('Message content is required');
    return;
  }
  
  if (content.length > 10000) {
    console.error('Message exceeds maximum length');
    return;
  }
  
  ws.send(JSON.stringify({
    type: 'chat_message',
    payload: { group_id: groupId, content: content.trim() }
  }));
}
```

### 4. Handle Errors Gracefully

Display user-friendly error messages based on error codes:

```javascript
const ERROR_MESSAGES = {
  'FORBIDDEN': 'You don\'t have permission to perform this action',
  'NOT_A_MEMBER': 'You are not a member of this group',
  'VALIDATION_ERROR': 'Invalid message format',
  'SERVER_ERROR': 'Something went wrong. Please try again.'
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'error') {
    const userMessage = ERROR_MESSAGES[message.payload.code] || message.payload.message;
    showErrorToast(userMessage);
  }
};
```

### 5. Implement Message Queuing

Queue messages when disconnected and send when reconnected:

```javascript
const messageQueue = [];

function sendMessage(message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    messageQueue.push(message);
  }
}

ws.onopen = () => {
  // Send queued messages
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    ws.send(JSON.stringify(message));
  }
};
```

---

## Code Examples

### JavaScript/TypeScript Client

```javascript
class PayNaiDeeWebSocket {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.handlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://localhost:8080/ws?token=${this.token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const handler = this.handlers.get(message.type);
          if (handler) {
            handler(message.payload);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.attemptReconnect();
      };
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
      this.reconnectAttempts++;
    }
  }

  on(type, handler) {
    this.handlers.set(type, handler);
    return this; // Allow chaining
  }

  send(type, payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  sendMessage(groupId, content, metadata = '') {
    this.send('chat_message', { group_id: groupId, content, metadata });
  }

  sendTyping(groupId, isTyping) {
    this.send('typing', { group_id: groupId, is_typing: isTyping });
  }

  joinGroup(groupId) {
    this.send('join_group', { group_id: groupId });
  }

  leaveGroup(groupId) {
    this.send('leave_group', { group_id: groupId });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
  }
}

// Usage Example
const ws = new PayNaiDeeWebSocket('your-jwt-token');

ws.on('chat_message', (payload) => {
  console.log(`Message from user ${payload.sender_id}: ${payload.content}`);
})
.on('typing', (payload) => {
  console.log(`User ${payload.user_id} is ${payload.is_typing ? 'typing' : 'not typing'}`);
})
.on('payment_status_update', (payload) => {
  console.log(`Payment status updated for bill ${payload.bill_id}`);
})
.on('bill_settled', (payload) => {
  console.log(`Bill "${payload.title}" has been settled!`);
})
.on('error', (payload) => {
  console.error(`Error: ${payload.code} - ${payload.message}`);
});

await ws.connect();
ws.joinGroup(1);
ws.sendMessage(1, 'Hello everyone!');
```

### React Native Example

```javascript
import { useEffect, useRef, useState, useCallback } from 'react';

export function usePayNaiDeeWebSocket(token) {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const connect = useCallback(() => {
    ws.current = new WebSocket(`ws://your-server.com/ws?token=${token}`);
    
    ws.current.onopen = () => {
      setIsConnected(true);
    };
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'chat_message') {
        setMessages(prev => [...prev, message.payload]);
      }
    };
    
    ws.current.onclose = () => {
      setIsConnected(false);
      // Implement reconnection logic
    };
  }, [token]);

  const sendMessage = useCallback((groupId, content) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'chat_message',
        payload: { group_id: groupId, content }
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);

  return { isConnected, messages, sendMessage };
}
```

### Flutter/Dart Example

```dart
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class PayNaiDeeWebSocket {
  WebSocketChannel? _channel;
  final String token;
  final Map<String, Function(Map<String, dynamic>)> _handlers = {};

  PayNaiDeeWebSocket(this.token);

  void connect() {
    _channel = WebSocketChannel.connect(
      Uri.parse('ws://localhost:8080/ws?token=$token'),
    );

    _channel!.stream.listen(
      (data) {
        final message = jsonDecode(data);
        final handler = _handlers[message['type']];
        if (handler != null) {
          handler(message['payload']);
        }
      },
      onError: (error) => print('WebSocket error: $error'),
      onDone: () => print('WebSocket closed'),
    );
  }

  void on(String type, Function(Map<String, dynamic>) handler) {
    _handlers[type] = handler;
  }

  void sendMessage(int groupId, String content) {
    _send('chat_message', {
      'group_id': groupId,
      'content': content,
    });
  }

  void _send(String type, Map<String, dynamic> payload) {
    _channel?.sink.add(jsonEncode({
      'type': type,
      'payload': payload,
    }));
  }

  void disconnect() {
    _channel?.sink.close();
  }
}

// Usage
final ws = PayNaiDeeWebSocket('your-jwt-token');
ws.on('chat_message', (payload) {
  print('New message: ${payload['content']}');
});
ws.connect();
ws.sendMessage(1, 'Hello from Flutter!');
```

---

## Security Considerations

1. **Always use WSS (WebSocket Secure) in production** - Never use unencrypted WebSocket connections in production environments.

2. **Token expiration** - JWT tokens have expiration times. Handle token refresh before the connection is established or implement reconnection with a fresh token.

3. **Input validation** - Always validate message content on both client and server sides.

4. **Rate limiting** - The server may implement rate limiting. Handle `429 Too Many Requests` errors gracefully.

5. **Origin checking** - In production, the server should validate the `Origin` header to prevent cross-site WebSocket hijacking.
