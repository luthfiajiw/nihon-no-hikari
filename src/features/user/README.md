# User

Owns administrative user listing and role changes through `/api/v1/admin/users`. Domain use cases reject role changes from non-admin actors; the backend retains the authoritative authorization rules. Domain contracts, HTTP sources, repository implementation and presentation loaders/actions remain within this feature. See [frontend conventions](../../../docs/frontend-module-conventions.md).
