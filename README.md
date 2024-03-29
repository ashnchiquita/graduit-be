# PPL

## Git branching

Repository akan memiliki 2 branch utama, yaitu main dan development.
Setiap pembuatan branch baru, buat branch baru dengan base development.
Format: `<tipe>/<judul>`

List tipe:

- Story, untuk fitur atau use case baru
- Task, untuk bug fixing, performance improvement, refactor, dsb.

Judul: gunakan kebab case

Contoh:

- story/api-attendance
- story/page-attendance
- task/improve-sql-performance-on-xxxx-method

Setelah selesai, Merge Request ke development dan wajib minta review ke scrum master.

## Code Styling & Repository

Sangat dimohon untuk memperhatikan hal-hal berikut:

1. Penamaan variabel, fungsi, dan kelas yang bermakna.
2. Penyingkatan harus mudah ditebak dan masih terbaca.
   - Misalkan, codeStylingAndRepository, terlalu panjang, disingkat menjadi: codeStyleNRepo.
   - Yang Salah: csnr, cdStNrep.
3. Membuat kelas, type, dan interface dengan pascal case (ClassName).
4. Membuat fungsi dan variable dengan camel case (fungsiDanVariabel).
5. Membuat folder dan file dengan kebab case (nama-folder).

## Folder

```
src
├ entities
├ helper
├ middlewares
└ <nama-modul>
  ├ <nama-modul>.controller.ts
  ├ <nama-modul>.module.ts
  ├ <nama-modul>.dto.ts
  └ <nama-modul>.service.ts

```

Folder menggunakan sistem modul NestJS yang bisa dilihat di https://docs.nestjs.com/modules.
Berikut merupakan penjelasan dasar dari setiap folder.

- `src/entities`
  a. Berisi entity typeORM sesuai ERD yang ada di https://app.eraser.io/workspace/z0dwTFLk5F4reT6CYK7E.
  b. Atribut entity (ex: title, description) bebas ditambahkan. Jika ada atribut yang diubah
  atau dihapus, infokan ke yang lain karena mungkin berpengaruh ke pengerjaan sebelumnya.
  c. Jika ingin menambahkan tabel atau relasi, diskusikan dengan yang lain.
  d. Jika mengubah atribut atau tabel, update ERD agar sesuai.
- `src/helper`
  a. Berisi fungsi utility atau helper.
- `src/middlewares`
  a. Berisi midddleware aplikasi, bisa berupa guard atau interceptor.
- `src/<nama-modul>/.module.ts`
  a. Berisi konfigurasi dasar dari sebuah modul.
- `src/<nama-modul>/.controller.ts`
  a. Berisi controller yang akan melakukan mapping antara endpoint dengan handler-nya.
- `src/<nama-modul>/.service.ts`
  a. Berisi service yang akan menerima request dan menghasilkan response.
- `src/<nama-modul>/.dto.ts`
  a. Berisi data transfer object yang mendefinisikan struktur request ataupun response.

## Semantic Commit Message

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)

## Local Development Setup

### Git

Authorize ke github menggunakan SSH/ HTTPs. Referensi untuk SSH:

https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account

### Requirements

1. Node versi 21

### Instalasi Requirements

1. Install node 21 melalui node version manager. Referensi: https://github.com/nvm-sh/nvm#installing-and-updating

`nvm install lts/hydrogen`

### Langkah-Langkah

1. Clone repo `git clone git@gitlab.informatika.org:k-02-02/ppl-backend.git` atau `git clone https://gitlab.informatika.org/k-02-02/ppl-backend.git`
2. Install dependencies `npm install`
3. Sesuaikan env dengan file .env.example
4. Jalankan local dev derver `npm run start:dev`

## Techniques

### Schema Validation

Lakukan schema validation untuk **data yang masuk dari luar saat runtime (request body, params, dll)**. Tulis validasi di kelas DTO (buat kelas yang pendek boleh langsung pipe di controller). Dokumentasi:

- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [Class Validator](https://www.npmjs.com/package/@nestjs/class-validator/v/0.13.1)

> **NOTE** <br> Schema validation bersifat whitelist, artinya kalo ga kalian pasang validasinya gak bakal bisa diakses meskipun di runtime kalian tambahin.

### API Documentation

Dokumentasi API bisa diakses di [http://localhost:3000/api-docs](http://localhost:3000/api-docs). Yang esensial:
| Decorator | Fungsi | Scope |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `@ApiTags("nama-controller")` | Folder/grup API | Method / Controller |
| `@ApiOperation({ summary: "summary" })` | Description | Method |
| `@ApiResponse({ status: XXX, description: "desc", type: Type })` | Keterangan response API | Method / Controller |
| `@ApiBody({ type: Type })` | Enforce body secara hardcode. Kalo bisa jangan pake ini karena harusnya autogenerate dari `@Body()`. Pake ini kalo kalian pake middleware yang ngepass bodynya ke middleware bukan ke handler | Method |
| `@ApiCookieAuth()` | Auth pake cookie | Method / Controller |
| `@ApiProperty({ example: "example", description: "desc" })` | Register property kelas | Model |
| `@ApiHideProperty()` | Hide property kelas | Model |

Langkahnya kurang lebih:

1. Kalo buat tag baru, register tag nya di `src/main.ts` pake `.addTag("tag")`
2. Di kelas yang jadi model transfer object (entity / dto), kasih decorator property
3. Di bagian controller, kasih decorator sesuai kebutuhan auth, response, summary, dll

Dokumentasi:

- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
