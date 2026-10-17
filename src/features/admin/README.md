# Admin

The feature follows the same domain–data–presentation structure as course and question.

- `domain`: content entities, payload/filter rules, repository contracts and use cases for access, catalog/editor loading, content lifecycle, roles and previews. No SvelteKit or HTTP imports.
- `data`: HTTP sources and the repository implementation. Sources unwrap API responses and preserve failures for the presentation adapters.
- `presentation`: route loaders/actions, views, form models, reusable headers and editors, and shared spacing styles.
- `src/dependencies/admin.dependency.ts`: module-level instances of the source, repository and use cases, using the active request fetch through `#request-fetch`.
- `src/dependencies/admin-preview.dependency.ts`: browser composition for the same-origin lesson preview adapter.

Routes only delegate to the presentation layer. Course lists do not load the entire catalog; detail pages request the selected course's catalog.

Module and lesson editors use a searchable shadcn-svelte Popover/Command combobox to select one prerequisite, alongside the `is_entry` checkbox. Entry content hides the combobox and saves an empty prerequisite array. Other content saves at most one UUID in the API's prerequisite array; older records with multiple prerequisites load their first prerequisite for editing. Changes are saved with drafts and applied on publish. An empty array clears prerequisites; omitted/null arrays preserve existing relations for older clients and drafts. The API rejects missing, duplicate, self-referencing and cyclic prerequisites.

Admin spacing uses 8px within controls, 16px within groups and 24px between sections. Page padding is 16/24/32px across mobile/tablet/desktop; panel padding is 16/24px. Use the shared header and `admin-*` classes in `presentation/styles/admin.css`.

Lesson HTML uses CodeMirror with syntax colors, line numbers, HTML tag/attribute completion, automatic closing tags and two-space indentation. Ctrl+Space opens suggestions; Tab/Shift+Tab changes indentation and Escape followed by Tab moves focus out of the editor. Switching to Preview keeps the editor's cursor and undo history. Source HTML stays in the existing lesson content payload; preview and publication still use the existing sanitization flow.

Navigation uses native buttons or Button components with `onclick={() => goto(resolve(...))}`. Do not use anchor tags or Button `href` for app navigation. Dynamic route IDs include SvelteKit route groups when passing route parameters to `resolve`.

Run `npm run check`, `npm run test:unit -- --run --project server` and `npm run test:admin` to verify. The browser test uses an isolated API fixture.

Course detail lists use `svelte-dnd-action` drag handles with 220ms FLIP animations and reduced-motion support. Space/Enter picks up or drops an item, arrows preview the new order, and Escape cancels. Drops autosave through the page's `?/reorder` action and the dedicated admin reorder endpoint; keyboard arrow movements do not save until the item is dropped. Each module's lessons use a separate zone type to keep them within their original module. Failed saves restore the list and refresh the catalog; all handles are disabled while saving. Reorder changes live order directly and preserves unpublished material edits.

Set `ADMIN_SMOKE_CHANNEL=msedge` to use an installed Edge browser instead of Playwright's Chromium. After `npm run build`, set `ADMIN_SMOKE_PREVIEW=1` to test the production preview without development dependency optimization.
