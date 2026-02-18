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

The skill generates structured API documentation covering the following sections:

- **Overview**: Base URL, authentication method, and content type
- **Endpoint documentation**: Each endpoint with request body, validation rules, success/error responses, and code examples (cURL, JavaScript)
- **Error codes**: Standard HTTP status codes table (200, 201, 204, 400, 401, 403, 404, 422, 429, 500)
- **Rate limiting**: Rate limit details and response headers
- **Pagination**: Query parameters and standard response structure with data/meta/links
- **Filtering and sorting**: Query parameter patterns for filtering and sort direction
- **Versioning**: URL path-based versioning scheme
- **OpenAPI specification**: Link to downloadable OpenAPI YAML

See [reference.md](reference.md) for the complete output format template with full examples.

## Laravel-Specific Documentation Features

This skill includes specialized support for Laravel APIs, automatically documenting:

- **Form Request validation rules** - Reads FormRequest classes and generates parameter documentation with types, constraints, and descriptions
- **API Resource transformations** - Analyzes JsonResource classes to document response field structures including conditional fields
- **Route model binding** - Documents implicit/explicit model binding with path parameters and 404 error responses
- **Middleware documentation** - Detects auth:sanctum, verified, and other middleware to document authentication/authorization requirements
- **Policy authorization** - Reads controller authorize() calls to document permission requirements and 403 responses

See [reference.md](reference.md) for detailed examples of each Laravel-specific feature.

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

## Additional resources

- For the complete output format template and Laravel-specific features, see [reference.md](reference.md)
- For full example documentation outputs, see [examples.md](examples.md)

## Important Notes

1. **Accuracy**: Documentation must match actual API behavior
2. **Completeness**: Document all endpoints, parameters, and responses
3. **Examples**: Provide working examples for all endpoints
4. **Versioning**: Clearly indicate API version in documentation
5. **Testing**: Validate documentation with **test-generator** skill
6. **Updates**: Keep documentation current with code changes

Remember: Good API documentation accelerates frontend development and reduces integration issues. Use the **test-generator** skill to ensure your documented behavior matches actual implementation.
