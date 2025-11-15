---
description: Generate comprehensive API documentation with OpenAPI/Swagger specs, endpoint examples, and integration guides
---

# API Documentation Generator

Invoke the api-documentation skill to create professional API documentation for your Laravel application.

You are being asked to generate API documentation. Follow the api-documentation skill workflow:

1. **Discover API Routes**
   - Read `routes/api.php` file
   - Parse route definitions
   - Extract middleware and prefixes
   - Identify route groups and versioning

2. **Analyze Controllers and Resources**
   - Read referenced controller files
   - Find Form Request validation rules
   - Locate API Resource transformations
   - Identify authorization policies
   - Understand business logic

3. **Build Documentation Structure**
   - Group endpoints by resource
   - Document each endpoint's purpose
   - Create request/response examples
   - Generate authentication docs
   - Show validation rules
   - Include error responses

4. **Generate Output Formats**
   - **Markdown documentation** with examples
   - **OpenAPI 3.0 YAML/JSON** specification
   - **Postman collection** JSON (optional)
   - **Integration code examples** (cURL, JavaScript, PHP)

**Documentation Includes**:
- Base URL and authentication methods
- All endpoints with HTTP methods
- Path and query parameters
- Request body schemas with validation rules
- Success response structures (200, 201)
- Error responses (400, 401, 403, 404, 422, 500)
- cURL examples
- JavaScript/Axios examples
- Rate limiting information
- Pagination structure
- Filtering and sorting options

**Laravel-Specific Features**:
- Form Request validation documentation
- API Resource transformation structure
- Route model binding documentation
- Middleware documentation (auth, verified, etc.)
- Policy authorization requirements

**Output Format**:
- Complete endpoint documentation
- OpenAPI/Swagger specification
- Integration examples
- Error code reference
- Authentication flow guide

After generating documentation, optionally:
- Use **test-generator** to create API tests matching documented behavior
- Validate documentation accuracy against actual code
