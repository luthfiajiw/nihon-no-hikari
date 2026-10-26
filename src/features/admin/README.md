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

Lesson content shows a preview card with a Maximize button opening a nearly fullscreen shadcn dialog. At 768px and above the dialog shows CodeMirror on the left and live preview on the right; smaller screens use HTML/Preview tabs. Tips stay on the page. Changes immediately update the form and are persisted with Simpan Draft. Preview loads on entry and debounces changes by 300ms through the existing sanitization endpoint; both previews share the latest result and ignore stale responses. CodeMirror keeps syntax colors, line numbers, HTML tag/attribute completion, automatic closing tags and two-space indentation. Ctrl+Space opens suggestions; Tab/Shift+Tab changes indentation and Escape followed by Tab moves focus out of the editor without closing the dialog. Closing the dialog or changing tabs/layout preserves its cursor and undo history. Source HTML stays in the existing lesson content payload.

Navigation uses native buttons or Button components with `onclick={() => goto(resolve(...))}`. Do not use anchor tags or Button `href` for app navigation. Dynamic route IDs include SvelteKit route groups when passing route parameters to `resolve`.

**Template Kana** lives at `/admin/kana-templates` and `/admin/kana-templates/[id]`
(`new` creates a template). It has a dedicated typed domain workflow and template
API methods rather than joining the content draft/publish lifecycle. Upload one
KanjiVG SVG (maximum 256 KiB), preview stroke order/direction and try the existing
WritingCanvas, then save immediately. All metadata is editable; script/character
changes require a matching replacement SVG. Metadata-only edits retain stored
geometry. Enhanced forms preserve input and files on errors. The question-set
template selector uses the same metadata list. Existing attempts use server-side
guide snapshots, while future attempts see updated templates. Original SVG files
are not stored; upload a replacement to change geometry. The browser smoke test
includes template management and selection in writing questions.

Run `npm run check`, `npm run test:unit -- --run --project server` and `npm run test:admin` to verify. The browser test uses an isolated API fixture.

**Kotoba** lives at `/admin/kotoba` and `/admin/kotoba/[id]` (`new` creates a topic).
Server loaders read real summaries/details through the authenticated `/api/v1`
proxy and `kotobaRepository`. The layout context only carries a success notice;
topic state belongs to the editor, so Cancel discards unsaved changes. Saving
uploads new PNG/JPEG covers (2 MiB maximum) and optional MP3s (1 MiB maximum), then
sends a complete topic with its version. Successful upload IDs survive failed
saves/retries. Existing words retain server IDs; duplicates omit them and share
persisted audio. API field errors map back to local word IDs after reordering.
Conflicts retain the form until the user explicitly reloads. Deletion waits for
the API before refreshing the list. Counts come from API summaries.

Private media uses 15-minute signed URLs. Editor URL refreshes preserve unsaved
text, file selections, word order, and the original version. The student catalog
and detail loaders also use the API; the banner uses its cover and playback prefers
uploaded MP3s, falling back to Japanese browser speech only for words without audio.
Queues renew expiring URLs before resolving each word, and stop on filter changes,
navigation, or playback errors. Object URLs remain owned by preview components.
The browser smoke test covers persistent API CRUD, multipart uploads, retry reuse,
conflicts, duplication/reordering, signed media playback, and mobile layouts.

Course detail lists use `svelte-dnd-action` drag handles with 220ms FLIP animations and reduced-motion support. Space/Enter picks up or drops an item, arrows preview the new order, and Escape cancels. Drops autosave through the page's `?/reorder` action and the dedicated admin reorder endpoint; keyboard arrow movements do not save until the item is dropped. Each module's lessons use a separate zone type to keep them within their original module. Failed saves restore the list and refresh the catalog; all handles are disabled while saving. Reorder changes live order directly and preserves unpublished material edits.

Set `ADMIN_SMOKE_CHANNEL=msedge` to use an installed Edge browser instead of Playwright's Chromium. After `npm run build`, set `ADMIN_SMOKE_PREVIEW=1` to test the production preview without development dependency optimization.
