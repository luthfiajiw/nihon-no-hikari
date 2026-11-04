# Auth

Owns sign-in, Google sign-in, token refresh, sign-out and the administrative access check through `/api/v1/admin/me`. `loadAuthAdminAccess` guards the admin layout while the backend remains responsible for authorization on every operation. See [frontend conventions](../../../docs/frontend-module-conventions.md).

Google sign-in uses the Google Identity Services button (`presentation/components/google-sign-in-button.svelte`, enabled by `PUBLIC_GOOGLE_CLIENT_ID`). The ID token is posted to `/api/auth/google`, which forwards it to `/api/v1/auth/google` and stores the returned session like password sign-in.
