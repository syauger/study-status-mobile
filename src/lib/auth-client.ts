import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8787",
  plugins: [
    expoClient({
      scheme: "studystatus",
      storagePrefix: "studystatus",
      storage: SecureStore,
    }),
  ],
});
