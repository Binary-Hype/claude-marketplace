---
name: api-documentation
description: Automatically generates comprehensive API documentation including OpenAPI/Swagger specs, endpoint descriptions, request/response examples, and integration guides. Perfect for Laravel APIs with automatic route discovery.
---

# API Documentation Generator

An intelligent skill that creates professional, comprehensive API documentation by analyzing your Laravel routes, controllers, and API resources. Generates OpenAPI/Swagger specifications, request/response examples, and clear integration guides.

## When to Use This Skill

Use this skill when:
- You're building or maintaining a REST API
- You need to document API endpoints for frontend developers
- You want to generate OpenAPI/Swagger specifications
- You're creating public API documentation
- You need Postman collection exports
- You're onboarding developers to your API
- You want to keep documentation in sync with code
- You need request/response examples for testing
- You're preparing API versioning documentation

## What This Skill Does

This skill provides comprehensive API documentation by:

1. **Route Discovery**
   - Analyzes Laravel routes file (api.php)
   - Identifies all API endpoints automatically
   - Extracts HTTP methods, paths, and parameters
   - Detects route model binding and middleware
   - Groups routes by resource or controller

2. **Controller Analysis**
   - Reads controller methods for logic understanding
   - Identifies validation rules from Form Requests
   - Extracts authorization policies
   - Analyzes return types and responses
   - Detects API Resource transformations

3. **Request/Response Documentation**
   - Documents required and optional parameters
   - Provides request body examples with types
   - Generates response examples with status codes
   - Shows error responses and validation failures
   - Includes pagination structure

4. **OpenAPI/Swagger Generation**
   - Creates OpenAPI 3.0 compliant specifications
   - Defines schemas for request/response objects
   - Documents authentication methods
   - Includes parameter descriptions and constraints
   - Supports API versioning

5. **Integration Examples**
   - cURL command examples
   - JavaScript/Axios examples
   - PHP/Guzzle examples
   - Postman collection format
   - Authentication flow examples

## How to Use

Simply invoke the skill to generate API documentation:

```
/api-documentation
```

Or request specific documentation:

```
/api-documentation Generate docs for my User API endpoints
```

```
/api-documentation Create OpenAPI spec for routes/api.php
```

```
I need Postman examples for my authentication endpoints
```

## Documentation Generation Process

When this skill is invoked, it follows this systematic approach:

1. **Discover API Routes**
   - Read routes/api.php file
   - Parse route definitions
   - Extract middleware and prefixes
   - Identify route groups

2. **Analyze Controllers and Resources**
   - Read referenced controller files
   - Find Form Request validation rules
   - Locate API Resource transformations
   - Identify authorization policies

3. **Build Documentation Structure**
   - Group endpoints by resource
   - Document each endpoint's purpose
   - Create request/response examples
   - Generate authentication docs

4. **Generate Output Formats**
   - Markdown documentation
   - OpenAPI 3.0 YAML/JSON
   - Postman collection JSON
   - Integration code examples

5. **Validate with Test Generator**
   - Optionally use **test-generator** skill to create API tests
   - Ensures documentation matches actual behavior

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

## Example Documentation Outputs

### Example 1: Complete CRUD API Documentation

**User Request:**
```
/api-documentation Document the User API endpoints
```

**Output:**
```markdown
# User API Documentation

## Users Resource

Base endpoint: `/api/v1/users`

### List Users
**GET** `/users`

Retrieve a paginated list of all users.

**Authentication**: Required
**Authorization**: Requires 'viewAny' permission on User model

**Query Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| page | integer | No | Page number | 1 |
| per_page | integer | No | Items per page (max: 100) | 15 |
| search | string | No | Search by name or email | - |
| role | string | No | Filter by role (admin, user) | - |
| sort | string | No | Sort field (prefix with - for desc) | -created_at |

**Success Response (200)**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "email_verified_at": "2025-01-15T10:30:00Z",
      "created_at": "2025-01-10T08:20:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 47,
    "last_page": 4
  }
}
```

---

### Create User
**POST** `/users`

Create a new user account.

**Authentication**: Required
**Authorization**: Requires 'create' permission on User model

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "role": "user"
}
```

**Validation Rules**:
| Field | Rules | Description |
|-------|-------|-------------|
| name | required, string, max:255 | User's full name |
| email | required, email, unique:users | Valid unique email |
| password | required, min:8, confirmed | Minimum 8 characters |
| role | nullable, in:admin,user | User role (default: user) |

**Success Response (201)**:
```json
{
  "data": {
    "id": 48,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "email_verified_at": null,
    "created_at": "2025-01-16T14:22:00Z",
    "updated_at": "2025-01-16T14:22:00Z"
  }
}
```

**Validation Error Response (422)**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password confirmation does not match."]
  }
}
```

**cURL Example**:
```bash
curl -X POST https://api.example.com/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "password_confirmation": "SecurePass123",
    "role": "user"
  }'
```

**JavaScript Example**:
```javascript
const response = await axios.post('/users', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  password: 'SecurePass123',
  password_confirmation: 'SecurePass123',
  role: 'user'
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data.data); // Created user
```

---

### Show User
**GET** `/users/{user}`

Retrieve a specific user by ID.

**Authentication**: Required
**Authorization**: Requires 'view' permission on User model

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| user | integer | User ID |

**Success Response (200)**:
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "posts_count": 12,
    "email_verified_at": "2025-01-15T10:30:00Z",
    "created_at": "2025-01-10T08:20:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response (404)**:
```json
{
  "message": "User not found."
}
```

---

[Update and Delete endpoints follow similar pattern]

## Integration Guide

### Authentication Flow

1. **Login**:
```javascript
const { data } = await axios.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

const token = data.access_token;
localStorage.setItem('token', token);
```

2. **Set Default Header**:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

3. **Make Authenticated Requests**:
```javascript
const users = await axios.get('/users');
```

### Error Handling

```javascript
try {
  const response = await axios.post('/users', userData);
} catch (error) {
  if (error.response.status === 422) {
    // Validation errors
    console.log(error.response.data.errors);
  } else if (error.response.status === 401) {
    // Not authenticated
    redirectToLogin();
  } else if (error.response.status === 403) {
    // Forbidden
    showAccessDenied();
  }
}
```

## Testing Recommendations

Use **test-generator** skill to create API tests:
- Feature tests for each endpoint
- Validation rule tests
- Authorization tests
- Response structure tests
```

### Example 2: OpenAPI/Swagger Specification

**User Request:**
```
/api-documentation Generate OpenAPI spec for my API
```

**Output:**
```yaml
openapi: 3.0.0
info:
  title: Example API
  description: RESTful API for managing users, posts, and more
  version: 1.0.0
  contact:
    email: api@example.com

servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: http://localhost:8000/api/v1
    description: Development server

paths:
  /users:
    get:
      summary: List users
      description: Retrieve a paginated list of users
      tags:
        - Users
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
          description: Page number
        - name: per_page
          in: query
          schema:
            type: integer
            default: 15
            maximum: 100
          description: Items per page
        - name: search
          in: query
          schema:
            type: string
          description: Search by name or email
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserCollection'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: Create user
      description: Create a new user account
      tags:
        - Users
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResource'
        '422':
          $ref: '#/components/responses/ValidationError'

  /users/{user}:
    get:
      summary: Show user
      description: Retrieve a specific user by ID
      tags:
        - Users
      security:
        - bearerAuth: []
      parameters:
        - name: user
          in: path
          required: true
          schema:
            type: integer
          description: User ID
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResource'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john@example.com"
        role:
          type: string
          enum: [admin, user]
          example: "user"
        created_at:
          type: string
          format: date-time
          example: "2025-01-15T10:30:00Z"

    UserResource:
      type: object
      properties:
        data:
          $ref: '#/components/schemas/User'

    UserCollection:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        meta:
          $ref: '#/components/schemas/PaginationMeta'
        links:
          $ref: '#/components/schemas/PaginationLinks'

    CreateUserRequest:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
          maxLength: 255
          example: "Jane Smith"
        email:
          type: string
          format: email
          example: "jane@example.com"
        password:
          type: string
          minLength: 8
          example: "SecurePass123"
        password_confirmation:
          type: string
          example: "SecurePass123"
        role:
          type: string
          enum: [admin, user]
          default: user
          example: "user"

    PaginationMeta:
      type: object
      properties:
        current_page:
          type: integer
        per_page:
          type: integer
        total:
          type: integer
        last_page:
          type: integer

    PaginationLinks:
      type: object
      properties:
        first:
          type: string
          format: uri
        last:
          type: string
          format: uri
        prev:
          type: string
          format: uri
          nullable: true
        next:
          type: string
          format: uri
          nullable: true

  responses:
    Unauthorized:
      description: Unauthenticated
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: "Unauthenticated."

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: "Resource not found."

    ValidationError:
      description: Validation error
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: "The given data was invalid."
              errors:
                type: object
                additionalProperties:
                  type: array
                  items:
                    type: string
```

## Tips for Best API Documentation

1. **Keep Documentation in Sync**
   - Update docs whenever routes change
   - Document new endpoints immediately
   - Remove deprecated endpoint docs

2. **Provide Complete Examples**
   - Show realistic request data
   - Include all possible error responses
   - Demonstrate authentication flow
   - Add cURL and JavaScript examples

3. **Document Edge Cases**
   - Rate limiting behavior
   - Pagination structure
   - Filtering and sorting options
   - Error response formats

4. **Use Consistent Formatting**
   - Standard response structures
   - Consistent naming conventions
   - Clear parameter descriptions
   - Uniform date/time formats

5. **Include Integration Guides**
   - Authentication setup
   - Error handling patterns
   - Pagination handling
   - Best practices

6. **Validate with Tests**
   - Use **test-generator** skill to create API tests
   - Ensure documented responses match actual responses
   - Test all documented error cases

## Integration with Other Skills

This skill works well with:

- **test-generator**: Create API tests matching documented behavior
- **code-review**: Ensure API follows RESTful best practices
- **commit-message**: Document API changes in commits

## Common API Documentation Patterns

### RESTful Resource Documentation
- List: GET /resources
- Show: GET /resources/{id}
- Create: POST /resources
- Update: PUT/PATCH /resources/{id}
- Delete: DELETE /resources/{id}

### Nested Resources
- GET /users/{user}/posts
- POST /users/{user}/posts
- GET /posts/{post}/comments

### Batch Operations
- POST /users/batch (create multiple)
- DELETE /users/batch (delete multiple)

### Custom Actions
- POST /users/{user}/verify-email
- POST /posts/{post}/publish

## Limitations

- Documentation quality depends on code structure clarity
- Custom middleware may need manual documentation
- Complex authorization logic requires explanation
- Non-standard responses need manual examples
- GraphQL APIs require different documentation approach

## Success Criteria

Documentation is successful when:

- ✓ All API endpoints are documented
- ✓ Request/response examples are accurate
- ✓ Validation rules are clearly explained
- ✓ Authentication flow is demonstrated
- ✓ Error responses are comprehensive
- ✓ Integration examples work correctly
- ✓ OpenAPI spec validates successfully
- ✓ Frontend developers can integrate without questions

## Important Notes

1. **Accuracy**: Documentation must match actual API behavior
2. **Completeness**: Document all endpoints, parameters, and responses
3. **Examples**: Provide working examples for all endpoints
4. **Versioning**: Clearly indicate API version in documentation
5. **Testing**: Validate documentation with **test-generator** skill
6. **Updates**: Keep documentation current with code changes

Remember: Good API documentation accelerates frontend development and reduces integration issues. Use the **test-generator** skill to ensure your documented behavior matches actual implementation.
