# PayNaiDee Authentication Guide

This document provides comprehensive documentation for JWT-based authentication in the PayNaiDee API, including token structure, usage examples, and best practices.

## Table of Contents

- [Overview](#overview)
- [JWT Token Structure](#jwt-token-structure)
- [Authentication Flow](#authentication-flow)
- [Token Usage Examples](#token-usage-examples)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)
- [Configuration](#configuration)

---

## Overview

PayNaiDee uses JSON Web Tokens (JWT) for authentication. The system implements a dual-token approach:

- **Access Token**: Short-lived token (default: 24 hours) used for API authentication
- **Refresh Token**: Long-lived token (7 days) used to obtain new access tokens

All protected endpoints require a valid access token in the `Authorization` header.

---

## JWT Token Structure

### Access Token Claims

The access token contains the following claims:

```json
{
  "user_id": 1,
  "username": "johndoe",
  "role": "user",
  "exp": 1704067200,
  "iat": 1703980800,
  "nbf": 1703980800
}
```

| Claim | Type | Description |
|-------|------|-------------|
| `user_id` | uint | Unique identifier of the authenticated user |
| `username` | string | Username of the authenticated user |
| `role` | string | User role (`user` or `admin`) |
| `exp` | int64 | Token expiration time (Unix timestamp) |
| `iat` | int64 | Token issued at time (Unix timestamp) |
| `nbf` | int64 | Token not valid before time (Unix timestamp) |

### Refresh Token Claims

The refresh token contains minimal claims for security:

```json
{
  "user_id": 1,
  "exp": 1704672000,
  "iat": 1704067200,
  "nbf": 1704067200
}
```

| Claim | Type | Description |
|-------|------|-------------|
| `user_id` | uint | Unique identifier of the authenticated user |
| `exp` | int64 | Token expiration time (Unix timestamp) |
| `iat` | int64 | Token issued at time (Unix timestamp) |
| `nbf` | int64 | Token not valid before time (Unix timestamp) |

### Token Signing

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Configured via `JWT_SECRET` environment variable

---

## Authentication Flow

### 1. User Registration

Register a new user account and receive authentication tokens.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123",
    "phone_number": "0812345678",
    "display_name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "SUCCESS_REGISTER",
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJyb2xlIjoidXNlciIsImV4cCI6MTcwNDA2NzIwMCwiaWF0IjoxNzAzOTgwODAwLCJuYmYiOjE3MDM5ODA4MDB9.abc123...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MDQ2NzIwMDAsImlhdCI6MTcwNDA2NzIwMCwibmJmIjoxNzA0MDY3MjAwfQ.xyz789...",
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

### 2. User Login

Authenticate with credentials and receive tokens.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "SUCCESS_LOGIN",
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "johndoe",
      ...
    }
  }
}
```

### 3. Using Access Token

Include the access token in the `Authorization` header for protected endpoints.

**Request:**
```bash
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "code": "SUCCESS_PROFILE_RETRIEVED",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    ...
  }
}
```

### 4. Refreshing Tokens

When the access token expires, use the refresh token to obtain new tokens.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "SUCCESS_LOGIN",
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 5. Logout

Logout is handled client-side by discarding the tokens.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout
```

**Response:**
```json
{
  "success": true,
  "code": "SUCCESS_LOGOUT",
  "message": "Logout successful"
}
```

---

## Token Usage Examples

### JavaScript/TypeScript (Fetch API)

```javascript
// Store tokens after login
const login = async (username, password) => {
  const response = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
  }
  
  return data;
};

// Make authenticated request
const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8080/api/v1/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// Refresh tokens when expired
const refreshTokens = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
  }
  
  return data;
};
```

### Python (requests library)

```python
import requests

BASE_URL = "http://localhost:8080/api/v1"

class PayNaiDeeClient:
    def __init__(self):
        self.access_token = None
        self.refresh_token = None
    
    def login(self, username: str, password: str) -> dict:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": username, "password": password}
        )
        data = response.json()
        
        if data.get("success"):
            self.access_token = data["data"]["access_token"]
            self.refresh_token = data["data"]["refresh_token"]
        
        return data
    
    def get_headers(self) -> dict:
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def get_profile(self) -> dict:
        response = requests.get(
            f"{BASE_URL}/users/me",
            headers=self.get_headers()
        )
        return response.json()
    
    def refresh_tokens(self) -> dict:
        response = requests.post(
            f"{BASE_URL}/auth/refresh",
            json={"refresh_token": self.refresh_token}
        )
        data = response.json()
        
        if data.get("success"):
            self.access_token = data["data"]["access_token"]
            self.refresh_token = data["data"]["refresh_token"]
        
        return data

# Usage
client = PayNaiDeeClient()
client.login("johndoe", "securePassword123")
profile = client.get_profile()
print(profile)
```

### Go (net/http)

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

const baseURL = "http://localhost:8080/api/v1"

type AuthResponse struct {
    Success bool `json:"success"`
    Data    struct {
        AccessToken  string `json:"access_token"`
        RefreshToken string `json:"refresh_token"`
    } `json:"data"`
}

func login(username, password string) (*AuthResponse, error) {
    payload := map[string]string{
        "username": username,
        "password": password,
    }
    body, _ := json.Marshal(payload)
    
    resp, err := http.Post(
        baseURL+"/auth/login",
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var authResp AuthResponse
    json.NewDecoder(resp.Body).Decode(&authResp)
    return &authResp, nil
}

func getProfile(accessToken string) (map[string]interface{}, error) {
    req, _ := http.NewRequest("GET", baseURL+"/users/me", nil)
    req.Header.Set("Authorization", "Bearer "+accessToken)
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    return result, nil
}

func main() {
    auth, _ := login("johndoe", "securePassword123")
    profile, _ := getProfile(auth.Data.AccessToken)
    fmt.Printf("Profile: %+v\n", profile)
}
```

### cURL Examples

```bash
# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"securePassword123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"securePassword123"}'

# Get profile (replace TOKEN with actual access token)
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer TOKEN"

# Create a group
curl -X POST http://localhost:8080/api/v1/groups \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Team Lunch"}'

# Refresh tokens
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"REFRESH_TOKEN"}'
```

---

## Error Handling

### Authentication Errors

| HTTP Status | Error Code | Description | Action |
|-------------|------------|-------------|--------|
| 401 | `UNAUTHORIZED` | Authorization header missing | Include `Authorization: Bearer <token>` header |
| 401 | `INVALID_TOKEN_FORMAT` | Header doesn't start with "Bearer " | Use format `Bearer <token>` |
| 401 | `MISSING_TOKEN` | Token is empty | Provide a valid token |
| 401 | `INVALID_TOKEN` | Token is malformed or signature invalid | Re-authenticate to get new tokens |
| 401 | `EXPIRED_TOKEN` | Token has expired | Use refresh token to get new access token |
| 401 | `INVALID_CREDENTIALS` | Wrong username or password | Check credentials |
| 403 | `FORBIDDEN` | Insufficient permissions | User lacks required role |
| 403 | `ADMIN_ONLY` | Admin privileges required | Only admin users can access |

### Error Response Examples

**Missing Authorization Header:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Authorization header is required"
}
```

**Invalid Token Format:**
```json
{
  "code": "INVALID_TOKEN_FORMAT",
  "message": "Authorization header must start with 'Bearer '"
}
```

**Expired Token:**
```json
{
  "code": "EXPIRED_TOKEN",
  "message": "Token has expired"
}
```

**Invalid Credentials:**
```json
{
  "success": false,
  "code": "ERR_INVALID_CREDENTIALS",
  "message": "Invalid username or password"
}
```

### Handling Token Expiration

Implement automatic token refresh in your client:

```javascript
// Axios interceptor example
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'EXPIRED_TOKEN' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken
        });
        
        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Security Best Practices

### Token Storage

| Platform | Recommended Storage | Notes |
|----------|---------------------|-------|
| Web Browser | HttpOnly Cookies or Memory | Avoid localStorage for sensitive apps |
| Mobile App | Secure Storage (Keychain/Keystore) | Use platform-specific secure storage |
| Server-side | Environment variables or secrets manager | Never hardcode tokens |

### Client-Side Security

1. **Never expose tokens in URLs** - Always use headers
2. **Use HTTPS** - Encrypt all API communication
3. **Implement token refresh** - Handle expiration gracefully
4. **Clear tokens on logout** - Remove from all storage locations
5. **Validate token expiration** - Check `exp` claim before requests

### Token Lifecycle Management

```javascript
// Check if token is expired before making request
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Proactive token refresh (refresh before expiration)
const shouldRefreshToken = (token, bufferSeconds = 300) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + (bufferSeconds * 1000);
  } catch {
    return true;
  }
};
```

### WebSocket Authentication

For WebSocket connections, pass the token as a query parameter:

```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing tokens | (required) |
| `JWT_EXPIRATION_HOURS` | Access token expiration in hours | 24 |

### Example .env Configuration

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRATION_HOURS=24
```

### Security Recommendations for JWT_SECRET

1. **Minimum length**: 32 characters
2. **Use random generation**: `openssl rand -base64 32`
3. **Never commit to version control**: Use environment variables
4. **Rotate periodically**: Update secret and invalidate old tokens
5. **Different secrets per environment**: Use unique secrets for dev/staging/prod

---

## Role-Based Access Control

### User Roles

| Role | Level | Description |
|------|-------|-------------|
| `user` | 1 | Standard user with basic permissions |
| `admin` | 2 | Administrator with elevated permissions |

### Role Hierarchy

Roles follow a hierarchical model where higher-level roles inherit permissions from lower levels:

```
admin (level 2) > user (level 1)
```

### Protected Endpoints by Role

| Endpoint | Required Role | Description |
|----------|---------------|-------------|
| Most endpoints | `user` | Standard authenticated access |
| Admin-only endpoints | `admin` | Administrative functions |

### Checking Roles in Responses

The user's role is included in authentication responses:

```json
{
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "role": "user"
    }
  }
}
```

---

## Troubleshooting

### Common Issues

**Issue: "Authorization header is required"**
- Ensure you're including the `Authorization` header
- Check that the header name is spelled correctly (case-sensitive)

**Issue: "Token has expired"**
- Use the refresh token to get new tokens
- Check if your system clock is synchronized

**Issue: "Invalid or expired token"**
- Verify the token hasn't been modified
- Ensure you're using the correct JWT_SECRET
- Check that the token was generated by the same server

**Issue: "Insufficient permissions"**
- Verify the user has the required role
- Check if the endpoint requires admin access

### Debugging Tips

1. **Decode JWT tokens** at [jwt.io](https://jwt.io) to inspect claims
2. **Check token expiration** - compare `exp` claim with current time
3. **Verify signature** - ensure JWT_SECRET matches between generation and validation
4. **Log request headers** - confirm Authorization header is being sent correctly
