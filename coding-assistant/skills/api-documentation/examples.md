# API Documentation Examples

This file contains complete example outputs for the api-documentation skill.

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
