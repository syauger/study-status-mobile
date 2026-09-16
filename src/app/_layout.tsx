import { QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { queryClient } from "@/lib/query-client";

import "../global.css";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <Slot />
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
