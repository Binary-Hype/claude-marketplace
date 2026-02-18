# API Documentation Reference

This file contains the complete output format template and Laravel-specific documentation features for the api-documentation skill.

## Output Format

The skill provides structured API documentation:

```markdown
# API Documentation

## Overview

**Base URL**: `https://api.example.com/v1`
**Authentication**: Bearer token (JWT)
**Content Type**: `application/json`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Authentication

### POST /auth/login

Authenticate a user and receive an access token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Validation Rules**:
- `email`: required, email format
- `password`: required, min: 8 characters

**Success Response (200)**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Response (422)**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

**cURL Example**:
```bash
curl -X POST https://api.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

**JavaScript Example**:
```javascript
const response = await axios.post('/auth/login', {
  email: 'user@example.com',
  password: 'secret123'
});

const token = response.data.access_token;
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Users

### GET /users

Retrieve a paginated list of users.

**Authentication**: Required

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 15, max: 100)
- `search` (string, optional): Search by name or email
- `role` (string, optional): Filter by role (admin, user)

**Success Response (200)**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 47,
    "last_page": 4
  },
  "links": {
    "first": "https://api.example.com/v1/users?page=1",
    "last": "https://api.example.com/v1/users?page=4",
    "prev": null,
    "next": "https://api.example.com/v1/users?page=2"
  }
}
```

**Error Response (401)**:
```json
{
  "message": "Unauthenticated."
}
```

**cURL Example**:
```bash
curl -X GET "https://api.example.com/v1/users?page=1&per_page=15" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Additional endpoints...]

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Resource created |
| 204 | No content (successful deletion) |
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden (authorized but insufficient permissions) |
| 404 | Resource not found |
| 422 | Validation error |
| 429 | Too many requests (rate limited) |
| 500 | Server error |

## Rate Limiting

API requests are rate limited to **60 requests per minute** per user.

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1642252800
```

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

**Response Structure**:
```json
{
  "data": [...],
  "meta": { "current_page", "per_page", "total", "last_page" },
  "links": { "first", "last", "prev", "next" }
}
```

## Filtering and Sorting

**Filtering**:
```
GET /users?role=admin&status=active
```

**Sorting**:
```
GET /users?sort=-created_at  (descending)
GET /users?sort=name         (ascending)
```

## Versioning

API versions are specified in the URL path:
- v1: `https://api.example.com/v1/`
- v2: `https://api.example.com/v2/`

## OpenAPI Specification

Download: [openapi.yaml](./openapi.yaml)

```

## Laravel-Specific Documentation Features

### 1. Form Request Validation Documentation

Automatically documents validation rules:

```php
// Reads Form Request
class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'role' => 'nullable|in:admin,user',
        ];
    }
}

// Generates documentation
**Request Body**:
- `name` (string, required): User's full name (max 255 characters)
- `email` (string, required): Valid email address (must be unique)
- `password` (string, required): Minimum 8 characters (requires confirmation)
- `role` (string, optional): User role - either "admin" or "user" (default: "user")
```

### 2. API Resource Transformation

Documents response structure from API Resources:

```php
// Reads API Resource
class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'posts_count' => $this->whenLoaded('posts', fn() => $this->posts->count()),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

// Generates documentation
**Response Fields**:
- `id` (integer): Unique user identifier
- `name` (string): User's full name
- `email` (string): User's email address
- `role` (string): User role (admin, user)
- `posts_count` (integer, conditional): Number of posts (when posts are loaded)
- `created_at` (string): ISO 8601 formatted creation timestamp
```

### 3. Route Model Binding

Documents implicit and explicit model binding:

```php
// Route with model binding
Route::get('/users/{user}', [UserController::class, 'show']);

// Generates documentation
**Path Parameters**:
- `user` (integer): User ID (automatically resolved to User model)

**Error Responses**:
- 404: User not found
```

### 4. Middleware Documentation

Documents authentication and authorization:

```php
// Route with middleware
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
});

// Generates documentation
**Authentication**: Required (Laravel Sanctum)
**Email Verification**: Required
```

### 5. Policy Authorization

Documents authorization requirements:

```php
// Controller with policy
public function update(UpdateUserRequest $request, User $user)
{
    $this->authorize('update', $user);
    // ...
}

// Generates documentation
**Authorization**:
- User must have permission to update this user resource
- Returns 403 Forbidden if unauthorized
```
