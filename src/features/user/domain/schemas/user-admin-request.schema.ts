import { z } from 'zod';
export const userAdminRoleSchema = z.enum(['User', 'Admin'], { error: 'Role tidak valid.' });
export const userAdminChangeRoleRequestSchema = z.object({ role: userAdminRoleSchema });
