# StudyStatus mobile

An Expo SDK 57 / React Native app for finding Georgia Tech study spaces, viewing hours, amenities, expected noise, distance, weather, and community reports. Browsing is public; creating reports requires an email/password account. Routing uses Expo Router, data fetching uses TanStack Query, and styling uses HeroUI Native and Uniwind.

## Prerequisites

- Node.js 22 LTS or newer and Bun (the repo uses `bun.lock`).
- The companion API repo, preferably checked out as `../api`.
- For iOS simulator: macOS and Xcode. For Android emulator: Android Studio with an emulator configured. Desktop web only needs a browser.

## Run locally

### 1. Start the API first

Follow the [API README](../api/README.md) for full setup. From the API root:

```sh
npm ci
```

Create `api/.dev.vars` (inside the API repo, not this repo):

```dotenv
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=replace-with-a-generated-secret
```

Generate the secret with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the output in place of the placeholder, then run from the API root:

```sh
npm run migrate:dev
npm run seed:dev
npm run dev
```

Keep the API running. [The locations endpoint](http://localhost:8787/api/locations) should return seeded locations. Local setup does not require deployment or Cloudflare login.

### 2. Install the frontend and set its API URL

In a second terminal, from this repo's root:

```sh
bun install --frozen-lockfile
cp .env.example .env.local
```

**Edit `.env.local` before starting Expo.** For desktop web or the iOS simulator, use:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8787
```

The example file and code fallback currently point to a specific developer LAN address; explicitly replace it with your own URL. Use the API origin only, without `/api`; the app adds endpoint paths. `.env.local` is ignored by Git. `EXPO_PUBLIC_` values are bundled into the client, so never put the API auth secret here. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

| Where the app runs                       | `EXPO_PUBLIC_API_URL`           |
| ---------------------------------------- | ------------------------------- |
| Browser on your computer / iOS simulator | `http://localhost:8787`         |
| Android Studio emulator                  | `http://10.0.2.2:8787`          |
| Physical phone                           | `http://<computer-LAN-IP>:8787` |

For Android or a physical phone, start the API with `npm start` instead of `npm run dev`; this listens on `0.0.0.0`. Set the API's `BETTER_AUTH_URL` to the same reachable URL in the table and restart it. A phone must be on the same network as your computer, with port 8787 reachable through the firewall. Do not use `localhost` or `0.0.0.0` as the phone's API hostname.

### 3. Start Expo

For desktop web:

```sh
bun run web --port 8081
```

For the Expo development server and platform picker:

```sh
bun start
```

Use `bun run ios` or `bun run android` to open an installed simulator/emulator. These scripts start Expo; they do not compile a native app. Expo Go requires a version compatible with SDK 57 and the project's native modules. If a compatible Expo Go is unavailable or a native module is missing, use a native development build with the platform toolchain installed:

```sh
bunx expo run:ios
# Or:
bunx expo run:android
```

These generate the native project directories; configure native behavior in `app.json`. See [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/) for device setup.

After changing `.env.local`, restart Expo and fully reload the app. If it still uses the old URL, restart with `bunx expo start --clear`.

### 4. Verify the connection and authentication

The home screen should show the five seeded locations. Open one to see its details and reports, then register/sign in and create a report.

The API defaults allow browser origins on `localhost` and `127.0.0.1`, ports 8081 and 8088. If Expo chooses another port or you open web through a LAN address, add that exact frontend origin to the API's `WEB_ORIGINS` (see the API README). This is the frontend browser URL, not the API URL. Use `localhost` consistently across the desktop browser frontend and API to avoid cookie issues.

## Troubleshooting

- **Cannot load locations:** verify `.env.local`, restart Expo, and open `<API URL>/api/locations` on the same device. Check that the API is running and its local database has been migrated and seeded.
- **Locations load but sign-in/report posting fails:** check the API's auth secret, `BETTER_AUTH_URL`, and `WEB_ORIGINS`; restart the API after changes. Browser requests need session cookies.
- **Phone cannot connect:** check the computer's LAN IP and shared network, start the API with `npm start`, and allow port 8787 through the firewall. An Expo tunnel does not also tunnel the API.
- **Distance unavailable:** enable location permission. Distance is straight-line, not walking distance; the app remains usable without permission.
- **Weather unavailable:** weather comes through the API from Open-Meteo and requires the API to have internet access.

## Development and checks

- `src/app/`: Expo Router screens and layouts.
- `src/features/locations/`: API queries, distance, and weather UI.
- `src/features/reports/` and `src/features/auth/`: reports, drafts, and authentication.
- `src/lib/constants.ts`: shared API base URL.
- `src/lib/auth-client.ts`: Better Auth client.
- `app.json`: Expo scheme, plugins, and platform configuration.

```sh
bun run check
bunx tsc --noEmit
bun test tests/locations.test.ts tests/distance.test.ts
```

Use `bun run check` for the configured Ultracite (Oxlint/Oxfmt) lint and formatting checks. The legacy `lint` script invokes Expo's ESLint setup; ESLint is not the configured linter. The legacy `reset-project` script points to a missing file and is not a supported setup step.

The frontend follows all pages of `GET /api/locations` and loads details from `GET /api/locations/:locationId`. Hours use the location's timezone; noise is an expected level rather than a live measurement. Web uses single-page output: a deployed web host must serve `index.html` for unmatched paths. Set `EXPO_PUBLIC_API_URL` before exporting/building for another environment.

## Reports and sign-in

Each location displays public reports in pages of 10 with a **Load more reports** button. Signed-in users see **Create**; guests see **Sign in to create a report**. The sign-in screen includes registration and returns to that location's report form after authentication. Account controls also support signing out.

Reports include a crowd level and optional comment. Posting refreshes the list; validation and network errors keep the draft. Drafts survive the sign-in route in memory and are cleared on posting, canceling, or an app restart.

The auth client and report requests use the same `EXPO_PUBLIC_API_URL` as location requests. Set the API's `BETTER_AUTH_URL` and `WEB_ORIGINS` for your environment (see the API README). Native sessions use Expo SecureStore; web sessions use browser cookies. Server-side authentication is required to create reports even if a client bypasses the UI.
