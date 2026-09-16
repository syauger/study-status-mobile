import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useLayoutEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Uniwind } from "uniwind";

import "../global.css";
import { ReportDraftProvider } from "@/features/reports/report-drafts";
import { queryClient } from "@/lib/query-client";

export default function RootLayout() {
  useLayoutEffect(() => Uniwind.setTheme("dark"), []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <ReportDraftProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </ReportDraftProvider>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
