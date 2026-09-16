import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Spinner } from "heroui-native";
import { Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { AuthForm } from "@/features/auth/auth-form";
import { authClient } from "@/lib/auth-client";

const locationIdPattern = /^\d+$/u;

export default function Login() {
  const { locationId } = useLocalSearchParams<{ locationId?: string }>();
  const session = authClient.useSession();
  const hasLocation =
    !!locationId &&
    locationIdPattern.test(locationId) &&
    Number.isSafeInteger(Number(locationId)) &&
    Number(locationId) > 0;
  const continueToApp = (create: boolean) => {
    if (hasLocation) {
      router.navigate({
        pathname: "/locations/[id]",
        params: { id: locationId, create: create ? "1" : undefined },
      });
    } else {
      router.replace("/");
    }
  };
  const signOut = useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error("We couldn't sign you out. Please try again.");
      }
    },
    retry: false,
  });
  return (
    <Screen back>
      <View className="gap-2">
        <Text className="text-accent text-xs font-semibold tracking-widest uppercase">
          Your study space
        </Text>
        <Text
          accessibilityRole="header"
          className="text-foreground text-4xl font-bold tracking-tight"
        >
          {session.data ? "Your account." : "Welcome."}
        </Text>
        <Text className="text-muted text-base leading-6">
          {session.data
            ? "You're ready to share updates with other students."
            : "Sign in or register to share a report. You can browse locations and reports without an account."}
        </Text>
      </View>
      {session.isPending ? (
        <Spinner accessibilityLabel="Authenticating" />
      ) : null}
      {session.data ? (
        <Card className="gap-5 p-5">
          <Card.Title>{session.data.user.name}</Card.Title>
          <Card.Description>{session.data.user.email}</Card.Description>
          <Button onPress={() => continueToApp(hasLocation)}>
            {hasLocation ? "Continue to create a report" : "Browse locations"}
          </Button>
          <Button
            variant="secondary"
            isDisabled={signOut.isPending}
            onPress={() => signOut.mutate()}
          >
            {signOut.isPending ? "Signing out..." : "Sign out"}
          </Button>
          {signOut.isError ? (
            <Text accessibilityRole="alert" className="text-danger">
              {signOut.error.message}
            </Text>
          ) : null}
        </Card>
      ) : (
        <AuthForm onAuthenticated={() => continueToApp(true)} />
      )}
      <Button variant="ghost" onPress={() => continueToApp(false)}>
        Continue browsing
      </Button>
    </Screen>
  );
}
