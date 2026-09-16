# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Locations API

The locations list and detail screens load from the Workers API using TanStack Query. Start the API from `../api` with `npm run dev` after applying its local migrations and seed (see the API README). Copy `.env.example` to `.env.local` to override `EXPO_PUBLIC_API_URL`, then restart Expo.

- Web and iOS simulator: `http://localhost:8787`
- Android emulator: `http://10.0.2.2:8787`
- Physical device: use your computer's LAN address and run the API with `npm run dev -- --ip 0.0.0.0`. Both devices must be on the same network.

The frontend follows all pages of `GET /api/locations` and uses `GET /api/locations/:locationId` for details. Hours are shown in the location's specified timezone. Noise is an expected level, not a live report. No sign-in is needed. Web uses single-page output so new location URLs resolve at runtime; configure your web host to serve `index.html` for unmatched paths.

Run location data tests with `bun test tests/locations.test.ts`.

## Reports and sign-in

Each location displays public reports in pages of 10 with a **Load more reports** button. Signed-in users see **Create**; guests see **Sign in to create a report**. The sign-in screen includes registration and returns to that location's report form after authentication. Account controls also support signing out.

Reports include a crowd level and optional comment. Posting refreshes the list; validation and network errors keep the draft. Drafts survive the sign-in route in memory and are cleared on posting, canceling, or an app restart.

The auth client and report requests use the same `EXPO_PUBLIC_API_URL` as location requests. Set the API's `BETTER_AUTH_URL` and `WEB_ORIGINS` for your environment (see the API README). Native sessions use Expo SecureStore; web sessions use browser cookies. Server-side authentication is required to create reports even if a client bypasses the UI.
