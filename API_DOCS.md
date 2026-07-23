# API Documentation

This document describes the internal API endpoints used by the Kamreang High School Website. Most data is fetched directly via Server Actions, but these REST endpoints handle authentication and specialized tasks.

## Authentication Endpoints

### POST `/api/auth/session`
Creates a session cookie for an authenticated admin user.

- **Request Body**:
  ```json
  {
    "idToken": "Firebase ID Token"
  }
  ```
- **Response**: `200 OK` on success, `401 Unauthorized` for invalid tokens, `403 Forbidden` for non-admin/inactive users.
- **Side Effects**: Sets a secure `httpOnly` cookie named `__session`.

### DELETE `/api/auth/session`
Clears the session cookie (Sign out).

- **Response**: `200 OK`.
- **Side Effects**: Deletes the `__session` cookie.

### POST `/api/auth/user`
Retrieves admin user details from the database.

- **Security**: Requires a valid admin session cookie.
- **Request Body**:
  ```json
  {
    "firebase_uid": "string"
  }
  ```
- **Response**: `200 OK` with user data, `401 Unauthorized` if not logged in.

## Data Endpoints

### GET `/api/documents`
Returns all active documents from the downloads system.

- **Security**: Requires a valid admin session cookie.
- **Rate Limit**: 30 requests per minute per IP.
- **Response**: `200 OK` with an array of documents.
- **Caching**: 60s CDN cache, 30s stale-while-revalidate.

## Utility Endpoints

### GET `/api/proxy-image`
Proxies images from allowed Google domains to bypass CORS and Referer restrictions.

- **Query Parameters**: `url` (encoded URL of the image).
- **Security**: Only allows specific Google domains (`drive.google.com`, `googleusercontent.com`).
- **Response**: The image binary with appropriate `Content-Type`.
- **Caching**: 24-hour public cache.

---

## Error Handling
The API uses standard HTTP status codes:
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions/inactive account)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error
