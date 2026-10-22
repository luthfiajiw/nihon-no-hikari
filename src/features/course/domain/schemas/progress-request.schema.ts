import { z } from 'zod';

// Request payloads are validated by the SvelteKit API endpoint.

export const updateModuleProgressSchema = z.object({
	status: z.enum(['in_progress', 'completed'], { error: 'Status progres modul tidak valid.' })
});

export const updateLessonProgressSchema = z.object({
	status: z.enum(['unlocked', 'in_progress', 'completed'], {
		error: 'Status progres lesson tidak valid.'
	})
});
