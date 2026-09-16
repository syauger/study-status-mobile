import { Button, Card, Spinner } from "heroui-native";
import { Text, View } from "react-native";

export const LocationQueryState = ({
  loading = false,
  retry,
  refreshing = false,
}: {
  loading?: boolean;
  retry?: () => void;
  refreshing?: boolean;
}) => (
  <Card className="gap-4 p-5">
    {loading ? (
      <View
        className="flex-row items-center gap-3"
        accessibilityLiveRegion="polite"
      >
        <Spinner size="sm" />
        <Text className="text-muted">Loading locations…</Text>
      </View>
    ) : (
      <>
        <Text accessibilityRole="alert" className="text-foreground text-base">
          We couldn’t load the latest location information. Check your
          connection and try again.
        </Text>
        <Button variant="secondary" isDisabled={refreshing} onPress={retry}>
          {refreshing ? "Retrying…" : "Try again"}
        </Button>
      </>
    )}
  </Card>
);
