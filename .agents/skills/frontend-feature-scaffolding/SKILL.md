---
name: frontend-feature-scaffolding
description: Use when creating a new feature module, layer, UI view, loader/action, or refactoring frontend code in nihon-no-hikari according to frontend module conventions.
---

# Frontend Feature Scaffolding

Standard operating procedure for scaffolding and implementing feature modules in the `nihon-no-hikari` SvelteKit frontend according to Clean Architecture and the official codebase conventions.

---

## 1. Core Architectural Principles

1. **Strict Domain Ownership (No Central Admin Feature)**:
   - **THERE IS NO** `src/features/admin` feature.
   - Administrative capabilities belong to the exact same feature as their student/public counterparts.
   - Example: administrative topic/vocabulary editing resides in `src/features/kotoba`, course management lives in `src/features/course`.

2. **Domain Boundaries & Cross-Domain Communication**:
   - Never create cross-domain write dispatchers.
   - When Domain A requires read data from Domain B, consume a read-only port/reader via _dependency composition_ (e.g., `QuestionCourseCatalogReader`). Domain `question` must never directly import domain `course`.

3. **SSR Session Safety with `#request-fetch`**:
   - Server repositories and data sources **MUST** use `#request-fetch`.
   - Server instances resolve the active request when invoked and **MUST NEVER** retain a user's session or request fetch on a module/singleton scope.

4. **Svelte 5 Runes & Modern UI**:
   - Use Svelte 5 Runes (`$props()`, `$state()`, `$derived()`, etc.).
   - Utilize shadcn-svelte components (`$lib/components/ui/...`) and Tailwind CSS.
   - **Type-safe Routing with `resolve()` (`svelte/no-navigation-without-resolve`)**: Always wrap internal route paths in `resolve()` from `$app/paths` for every `<a href={...}>` navigation link and programmatic `goto(...)` call (e.g. `href={resolve('/register')}`, `href={resolve('/pricing/[code]', { code })}`, or `href={`${resolve('/')}#section`}`). Never hardcode bare string paths like `href="/register"`.
   - **Mandatory Keyed `{#each}` Blocks (`svelte/require-each-key`)**: Every `{#each}` block **MUST** specify a unique key identifier to ensure reliable reactivity and DOM reconciliation (e.g. `{#each items as item (item.id)}` or `{#each points as point (point)}`). Never write unkeyed each blocks (`{#each items as item}`).

---

## 2. Standard Feature Folder Structure

Each feature lives under `src/features/<feature>/` adhering to a 3-layer Clean Architecture layout:

```text
src/features/<feature>/
├── domain/
│   ├── entities/          # Entity models & domain error definitions (<feature>.entity.ts)
│   ├── repositories/      # Repository interface contracts (<feature>.repository.ts)
│   ├── schemas/           # Zod validation schemas (<feature>-request.schema.ts)
│   └── usecases/          # Business logic use cases (get-<feature>.usecase.ts)
├── data/
│   ├── sources/           # (Optional) Remote API data sources
│   └── repositories/      # Repository implementations (<feature>.repository.impl.ts)
└── presentation/
    ├── components/        # Internal UI components (<feature>-card.svelte)
    ├── views/             # Full page views (<feature>-view.svelte)
    ├── models/            # UI view-models or form state models (<feature>-form.model.ts)
    ├── server/            # SvelteKit loaders & actions (<feature>-loaders.ts)
    └── contexts/          # Svelte reactive context (<feature>-context.svelte.ts)
```

---

## 3. Mandatory Naming Conventions

All new files within a feature **MUST** start with their owning domain in `kebab-case`:

| Category                 | File Naming Pattern                     | Examples                                                                   |
| :----------------------- | :-------------------------------------- | :------------------------------------------------------------------------- |
| **Domain Entity**        | `<feature>[-admin].entity.ts`           | `kotoba-api.entity.ts`<br>`course-admin.entity.ts`                         |
| **Repository Interface** | `<feature>[-admin].repository.ts`       | `kotoba.repository.ts`<br>`course-admin.repository.ts`                     |
| **Repository Impl**      | `<feature>[-admin].repository.impl.ts`  | `kotoba.repository.impl.ts`<br>`course.repository.impl.ts`                 |
| **Use Cases**            | `[action]-<feature>[-admin].usecase.ts` | `get-course-detail.usecase.ts`<br>`manage-course-admin-content.usecase.ts` |
| **Server Loaders**       | `<feature>[-admin]-loaders.ts`          | `kotoba-admin-loaders.ts`<br>`course-admin-loaders.ts`                     |
| **Server Actions**       | `<feature>[-admin]-actions.ts`          | `course-admin-actions.ts`                                                  |
| **Presentation Views**   | `<feature>[-admin]-view.svelte`         | `kotoba-admin-view.svelte`<br>`course-detail-view.svelte`                  |
| **Unit & View Tests**    | `*.test.ts` / `*.svelte.test.ts`        | `kotoba.repository.test.ts`<br>`lesson-reader.svelte.test.ts`              |

**Casing Guidelines:**

- **PascalCase** for Classes and Types (`CourseAdminEditorData`, `GetCourseDetailUseCase`).
- **camelCase** for functions and object instances (`loadCourseAdminEditor`, `courseRepository`).

---

## 4. Step-by-Step Feature Scaffolding

### Step 1: Entity & Domain Error (`domain/entities/<feature>.entity.ts`)

```typescript
export interface BookmarkRecord {
	id: string;
	user_id: string;
	target_id: string;
	created_at: string;
}

export interface BookmarkInput {
	target_id: string;
}

export class BookmarkError extends Error {
	constructor(
		public readonly status: number,
		message: string,
		public readonly fieldErrors: Record<string, string> = {}
	) {
		super(message);
		this.name = 'BookmarkError';
	}
}
```

---

### Step 2: Repository Interface & Use Cases (`domain/`)

**Repository Contract (`domain/repositories/bookmark.repository.ts`):**

```typescript
import type { BookmarkInput, BookmarkRecord } from '../entities/bookmark.entity';

export interface BookmarkRepository {
	list(): Promise<BookmarkRecord[]>;
	create(input: BookmarkInput): Promise<BookmarkRecord>;
	remove(id: string): Promise<void>;
}
```

**Use Case (`domain/usecases/get-bookmarks.usecase.ts`):**

```typescript
import type { BookmarkRepository } from '../repositories/bookmark.repository';
import type { BookmarkRecord } from '../entities/bookmark.entity';

export class GetBookmarksUseCase {
	constructor(private readonly repo: BookmarkRepository) {}

	async exec(): Promise<BookmarkRecord[]> {
		return this.repo.list();
	}
}
```

---

### Step 3: Repository Implementation (`data/repositories/<feature>.repository.impl.ts`)

Inject `fetcher: typeof fetch` for compatibility with `#request-fetch`:

```typescript
import {
	BookmarkError,
	type BookmarkInput,
	type BookmarkRecord
} from '../../domain/entities/bookmark.entity';
import type { BookmarkRepository } from '../../domain/repositories/bookmark.repository';

export class BookmarkRepositoryImpl implements BookmarkRepository {
	constructor(private readonly fetcher: typeof fetch) {}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		try {
			const headers = new Headers(options.headers);
			headers.set('Accept', 'application/json');
			if (typeof options.body === 'string') {
				headers.set('Content-Type', 'application/json');
			}

			const response = await this.fetcher(`/api/v1/${path}`, {
				...options,
				headers,
				credentials: 'same-origin',
				cache: 'no-store'
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new BookmarkError(
					response.status,
					result.error || 'Bookmark operation failed.',
					result.field_errors || {}
				);
			}
			return result.data as T;
		} catch (cause) {
			if (cause instanceof BookmarkError) throw cause;
			throw new BookmarkError(502, 'Failed to connect to the API server.');
		}
	}

	list() {
		return this.request<BookmarkRecord[]>('bookmarks');
	}

	create(input: BookmarkInput) {
		return this.request<BookmarkRecord>('bookmarks', {
			method: 'POST',
			body: JSON.stringify(input)
		});
	}

	async remove(id: string) {
		await this.request<void>(`bookmarks/${encodeURIComponent(id)}`, { method: 'DELETE' });
	}
}
```

---

### Step 4: Dependency Injection Composition (`src/dependencies/<feature>.dependency.ts`)

Wire instances using `#request-fetch`:

```typescript
import { requestFetch } from '#request-fetch';
import { BookmarkRepositoryImpl } from '$features/bookmark/data/repositories/bookmark.repository.impl';
import { GetBookmarksUseCase } from '$features/bookmark/domain/usecases/get-bookmarks.usecase';

export const bookmarkRepository = new BookmarkRepositoryImpl(requestFetch);
export const getBookmarksUseCase = new GetBookmarksUseCase(bookmarkRepository);
```

---

### Step 5: Presentation Server Loaders (`presentation/server/<feature>-loaders.ts`)

Use `managementLoad` for administrative endpoints or invoke use cases directly:

```typescript
import type { RequestEvent } from '@sveltejs/kit';
import { getBookmarksUseCase } from '$dependencies/bookmark.dependency';

export async function loadBookmarks(event: RequestEvent) {
	const items = await getBookmarksUseCase.exec();
	return { items };
}
```

---

### Step 6: Presentation View with Svelte 5 Runes (`presentation/views/<feature>-view.svelte`)

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { BookmarkRecord } from '../../domain/entities/bookmark.entity';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		items: BookmarkRecord[];
	}

	let { items }: Props = $props();
</script>

<div class="space-y-6 p-4 sm:p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight">Bookmarks</h1>
		<a
			href={resolve('/dashboard')}
			class="text-sm font-semibold text-primary hover:underline"
		>
			Kembali ke Dashboard
		</a>
	</div>
	{#if items.length === 0}
		<Card.Root>
			<Card.Content class="py-6 text-center text-muted-foreground">
				No bookmarks saved yet.
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Always specify a key for each block (svelte/require-each-key) -->
			{#each items as item (item.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">{item.target_id}</Card.Title>
					</Card.Header>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
```

---

### Step 7: Thin SvelteKit Routes

SvelteKit route files act as thin delegates:

**`src/routes/(protected)/bookmarks/+page.server.ts`**:

```typescript
import { loadBookmarks } from '$features/bookmark/presentation/server/bookmark-loaders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadBookmarks;
```

**`src/routes/(protected)/bookmarks/+page.svelte`**:

```svelte
<script lang="ts">
	import BookmarkView from '$features/bookmark/presentation/views/bookmark-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<BookmarkView items={data.items} />
```

---

## 5. Testing & Verification

1. **Unit & Repository Tests**:
   - Mock fetcher using `vi.fn()` to verify endpoints, headers, multipart boundaries, and error translation.
   - Format test files as `<feature>.repository.test.ts`.

2. **Mandatory Verification Suite**:
   Run the following verification commands:

   ```bash
   npx eslint src
   npm run check
   npm run test:unit -- --run
   npm run build
   ```

   For admin navigation and API proxy test suites:

   ```bash
   npm run test:admin
   npm run test:api-proxy
   ```

3. **Knowledge Graph Synchronization**:
   After adding or modifying components, use cases, or views:
   ```bash
   graphify update .
   ```
   Ensure graphify detects all newly created views, use cases, and dependencies without invalid circular dependencies.
