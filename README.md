# Notes — Firebase Auth + Firestore + FSD + Material UI + PWA (Offline)

Учебное приложение “Notes” для практики с **React Router**, **Firebase Authentication**, **Cloud Firestore**, архитектуры **Feature-Sliced Design (FSD)** и перевода SPA в **PWA с офлайн-режимом** (ручной `service worker` + caching).

---

## Возможности

- **Авторизация** через Firebase Auth (Email/Password)
- **Заметки в Firestore** (realtime sync через `onSnapshot`)
- **Offline**:
- Firestore persistence (IndexedDB)
- PWA + service worker + caching
- офлайн доступно только то, что было посещено/закешировано онлайн
- Редактирование заметки:
- редактирование **заголовка** отдельно от текста
- редактирование **текста** (Markdown preview)
- autosave черновика текста (debounce)
- подтверждение изменений (обновляет `updatedAt`)
- при переключении заметки во время редактирования — prompt **Save? (Yes/No)**
- Удаление заметки с подтверждением
- Поиск по заголовку/тексту
- Hotkeys:
- `Ctrl/Cmd + N` — создать заметку
- `Ctrl/Cmd + F` — фокус на поиск
- `Esc` — закрыть диалог / подтвердить редактирование
- Log out

---

## Использовано

- React `19`
- TypeScript
- React Router DOM `6` (с `future`-флагами)
- Vite
- Material UI (MUI)
- SCSS Modules
- Firebase SDK:
  - Auth
  - Firestore (realtime + persistence)
- `react-markdown` + `remark-gfm`

---

## Роуты

### Public

- `/auth` — Sign in
- `*` — NotFound

### Private (только после логина)

- `/notes` — Notes workspace

---

## Как работает авторизация

- `AuthProvider` подписывается на `onAuthStateChanged`
- `RequireAuth` защищает приватные маршруты
- Logout доступен из header

---

## Notes storage

- Структура Firestore: `users/{uid}/notes/{noteId}`
- Поля документа заметки:
  - `title: string`
  - `body: string`
  - `createdAt: number`
  - `updatedAt: number`

`updatedAt` обновляется **только при подтверждённых изменениях** (confirm title/body).

---

## PWA (что сделано)

### Web App Manifest

- `public/site.webmanifest` — installable PWA
- иконки лежат в `public/icons/*`

### Service Worker (manual)

- `public/sw.js`
  - `install`: precache “app shell” + важные ресурсы
  - `activate`: очистка старых кэшей
  - `fetch`: стратегии для навигации и ассетов
- `public/offline.html` — fallback-страница для офлайна

---

## Стратегии кэширования (коротко)

- **Static cache (precache)**: `index.html`, `offline.html`, manifest, иконки, шрифты
- **Runtime cache**: ассеты same-origin (`script/style/image/font`) после первого онлайнового запроса
- **Навигация**: network-first → fallback на cached `index.html` → fallback на `offline.html`

---

## Offline behavior

- В офлайне приложение может открываться и работать с ранее загруженными данными:
  - UI/ассеты — из SW cache
  - notes — из Firestore persistence (если уже были загружены онлайн)
- Если пользователь открывает новый маршрут/ресурс, который никогда не был в кэше — будет `offline.html`

---

## Архитектура (FSD)

- `src/app/` — инициализация приложения, роутер, layout
- `src/pages/` — страницы (`auth`, `notes`, `not-found`)
- `src/widgets/` — крупные UI-блоки (header/layout/sidebar/workspace)
- `src/features/` — фичи (auth, notes, libs)
- `src/features/auth/model/*` — provider/context/types/require-auth
- `src/features/auth/ui/*` — `SignInForm`
- `src/features/auth/lib/*` — `getRedirectPath`
- `src/features/notes/model/*` — provider/context/types
- `src/features/notes/lib/*` — `filterNotes`, `getNoteSnippet`
- `src/entities/` — доменная сущность `note` (api/model/lib)
- `src/shared/` — общие хуки, firebase init, тема, утилиты
- `src/shared/lib/type-guards/*` — isString/isNumber/isRecord/getErrorMessage/isNonEmptyString

Алиасы: `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`.

---

## Firebase setup

### Auth

1. Firebase Console → **Authentication** → **Sign-in method**
2. включить **Email/Password**
3. добавить тестового пользователя (Authentication → Users)

- тестовый пользователь: `Email` - `qwerty123@qwerty.com` / `Password` - `_qwerty$123[`

### Firestore

1. Firebase Console → **Firestore Database** → Create database (Production mode)
2. Rules (пример под `users/{uid}/notes`):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### для проверки PWA

Service worker регистрируется только в PROD:

```bash
npm run build
npm run preview
```

### Manual check (quick QA)

1. Открой `/notes` как гость → редирект на `/auth`
2. Войди валидным Email/Password → редирект на `/notes`
3. Создай заметку (`+` или `Ctrl/Cmd+N`)
4. Редактируй title/text, попробуй переключение во время редактирования → prompt Yes/No
5. Delete note → confirmation dialog
6. PWA:

- `npm run build && npm run preview`
- DevTools → Application → Service Workers
- Offline → refresh
- если было посещение онлайн → app shell и ранее загруженные данные доступны

### Deploy (Firebase Hosting)

- `firebase.json` настроен под SPA rewrites (`/** -> /index.html`)
- Сборка: `npm run build`
- Деплой: `firebase deploy`
