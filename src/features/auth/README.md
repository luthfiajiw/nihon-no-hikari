# Auth

Owns sign-in, token refresh, sign-out and the administrative access check through `/api/v1/admin/me`. `loadAuthAdminAccess` guards the admin layout while the backend remains responsible for authorization on every operation. See [frontend conventions](../../../docs/frontend-module-conventions.md).
