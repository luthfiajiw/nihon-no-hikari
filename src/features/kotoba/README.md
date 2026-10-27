# Kotoba

Owns student vocabulary browsing/playback and administrative topic/vocabulary/media editing. See [frontend conventions](../../../docs/frontend-module-conventions.md).

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
