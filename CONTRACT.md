# Toolshed API Contract

## Auth

### POST /auth/register
**Request body:**
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "neighborhood": "string"
}

**Response 201:**
{
  "token": "string",
  "user": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "neighborhood": "string"
  }
}

**Errors:**
- 400 { "error": "Email already registered" }