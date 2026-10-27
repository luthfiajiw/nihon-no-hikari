# Question

Owns student assessments and administrative question sets, questions/options, reading/writing configuration, publication versions and kana templates. Course references for the admin editor are injected through the read-only `QuestionCourseCatalogReader`; the domain imports no course implementation. See [frontend conventions](../../../docs/frontend-module-conventions.md).

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
