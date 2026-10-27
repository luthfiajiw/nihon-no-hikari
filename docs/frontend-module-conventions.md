# Frontend module conventions

## Domain ownership

Administrative capabilities belong to the same feature as their student counterparts. There is no `src/features/admin` feature, combined administrative repository, or cross-domain write dispatcher.

| Feature  | Administrative ownership                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| auth     | Access check through `/api/v1/admin/me` and the admin layout guard                                           |
| course   | Courses, modules, lessons, levels, catalog, prerequisites, ordering, lesson authoring and sanitized previews |
| question | Question sets, questions/options, publication versions, kana templates and template previews                 |
| kotoba   | Topics, vocabulary, private media, uploads and the editor notice context                                     |
| user     | User listing and role changes                                                                                |

Preserve each feature's domain/data/presentation layout. Existing source and repository implementations also implement their feature's narrow administrative repository contract. Student repository interfaces remain independent of administrative capabilities. Kotoba retains its existing repository structure.

The course catalog is a read model containing courses, modules, lessons and question-set summaries. It does not give course ownership of question-set writes. Question editor use cases receive a `QuestionCourseCatalogReader` through dependency composition; question's domain does not import course, and course's administrative capabilities do not import question. Existing student lesson/assessment integration retains its established dependencies. Dependency composition adapts the course catalog to that read-only port.

Routes keep the existing `/admin` URLs and delegate to the owning feature. Content editors have concrete course/module/lesson/question_set route entrypoints; the dynamic kind route only redirects unsupported resources. The dashboard is local to its route and reads the course catalog. Shared management components, styles, HTTP transport and presentation error adapters live under `src/lib` and contain no domain write dispatch.

## Naming

New or relocated feature files start with their owning domain and use kebab-case: `course-admin-loaders.ts`, `question-admin-editor-view.svelte`, `kotoba-admin.model.ts`. Existing files outside the refactor keep their established names. Tests use the corresponding responsibility name and `.test.ts` or `.svelte.test.ts` suffix.

Use PascalCase for types/classes (`CourseAdminEditorData`, `GetQuestionAdminEditorUseCase`) and camelCase with an operation followed by domain/context for functions and instances (`loadCourseAdminEditor`, `manageQuestionAdminContentUseCase`). Common presentation names describe their responsibility, such as `ManagementPageHeader` and `ManagementFormResult`.

Create source/repository/use-case instances in each domain's `.dependency.ts`. Preserve `#request-fetch`: server instances resolve the active request when invoked and must never retain a user's session or request fetch. Browser lesson preview composition is in `course-preview.dependency.ts`.

## Compatibility and verification

The resource endpoints are `/api/v1/admin/courses`, `/modules`, `/lessons`, and `/question-sets`. Legacy `/content/{kind}` and `/lesson-content/preview` API URLs have no aliases. Browser editor URLs remain `/admin/content/{kind}/{id}`. Browser previews remain `/api/admin/lesson-preview` and `/api/admin/kana-template-preview`. Payloads, error statuses, full-payload updates, draft/publish behavior, null/empty/omitted values and role checks retain their existing contracts.

Run `npm run check`, `npm run test:unit -- --run`, `npm run build`, `npm run test:admin`, and `npm run test:api-proxy`. Browser smoke tests use an isolated API fixture. Edge can be selected with `VITEST_BROWSER_CHANNEL=msedge`, `ADMIN_SMOKE_CHANNEL=msedge`, and `API_PROXY_CHANNEL=msedge`. After code changes run `graphify update .` and verify that queries find the owning domains and no source nodes for removed feature paths remain.
