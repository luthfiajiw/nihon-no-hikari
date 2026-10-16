# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.17.0 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:none" paraglide="languageTags:en, id, ja+demo:yes" --install bun nihon-no-hikari
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## API dan autentikasi

Atur `API_BASE_URL` ke base URL backend yang mencakup prefix `/api`, misalnya `http://localhost:3000/api`, dan `AUTH_SECRET` untuk enkripsi cookie session. Variabel ini hanya dipakai server.
Gunakan origin backend dengan host atau port yang berbeda dari frontend agar `event.fetch` tidak kembali ke route SvelteKit.

Source menerima fungsi bertipe native `fetch` dan mengakses endpoint lokal `/api/v1/*`. Source, repository, dan usecase diinisiasi langsung di file `.dependency.ts`; pemanggil cukup mengimpor instance usecase lalu menjalankan `.exec()`. Import kondisional `#request-fetch` memakai browser fetch di client dan `getRequestEvent().fetch` di server. Dispatcher server mengambil request aktif saat dipanggil, sehingga singleton tidak menyimpan session atau fetch milik pengguna.

Proxy meneruskan request ke backend. `handleFetch` memasukkan bearer dari cookie session HttpOnly dan menangani refresh serta satu retry 401. Endpoint auth publik dikecualikan dari bearer dan retry. Signin/signout tetap memakai endpoint lokal khusus untuk mengelola cookie; form actions admin tetap dipertahankan.

Unit test server: `npm run test:unit -- --run --project server`. Smoke test browser: `npm run test:api-proxy` dan `npm run test:admin`; keduanya memakai API fixture tanpa database aplikasi. Setelah build, set `API_PROXY_PREVIEW=1` atau `ADMIN_SMOKE_PREVIEW=1` untuk menguji build produksi. Jika Chromium Playwright belum tersedia, set `API_PROXY_CHANNEL=msedge` dan `ADMIN_SMOKE_CHANNEL=msedge` untuk memakai Edge yang terpasang.
