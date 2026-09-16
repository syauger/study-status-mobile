import { router } from "expo-router";
import { Button } from "heroui-native";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Screen = ({
  children,
  back = false,
}: {
  children: ReactNode;
  back?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-background flex-1"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="pt-safe mx-auto w-full max-w-3xl gap-6 px-5">
          {back ? (
            <Button
              className="self-start"
              variant="ghost"
              size="sm"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}
            >
              ← Back
            </Button>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
