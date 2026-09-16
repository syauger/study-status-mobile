import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Button, Card, PressableFeedback } from "heroui-native";
import { Text, View } from "react-native";

import { LocationQueryState } from "@/components/location-query-state";
import { Screen } from "@/components/screen";
import { locationsQueryOptions, noiseLabels } from "@/features/locations/api";

export default function Index() {
  const query = useQuery(locationsQueryOptions);
  const locations = query.data ?? [];
  return (
    <Screen>
      <View className="pt-safe gap-2">
        <Text className="text-accent text-xs font-semibold tracking-widest uppercase">
          A little space to focus
        </Text>
        <Text
          accessibilityRole="header"
          className="text-foreground text-4xl font-bold tracking-tight"
        >
          Find your study spot.
        </Text>
        <Text className="text-muted text-base leading-6">
          A quiet corner or room to collaborate. Find a place that works for
          you.
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text
          accessibilityRole="header"
          className="text-foreground text-lg font-semibold"
        >
          All locations
        </Text>
        <Button
          variant="ghost"
          size="sm"
          isDisabled={query.isFetching}
          onPress={() => {
            void query.refetch();
          }}
        >
          {query.isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </View>
      {query.isPending ? <LocationQueryState loading /> : null}
      {query.isError ? (
        <LocationQueryState
          retry={() => {
            void query.refetch();
          }}
          refreshing={query.isFetching}
        />
      ) : null}
      {query.isSuccess && locations.length === 0 ? (
        <Text className="text-muted text-base">
          No study locations yet. Check back soon.
        </Text>
      ) : null}
      <View className="gap-4">
        {locations.map((location) => (
          <Link
            key={location.id}
            href={{
              pathname: "/locations/[id]",
              params: { id: String(location.id) },
            }}
            asChild
          >
            <PressableFeedback
              accessibilityRole="link"
              accessibilityLabel={`View ${location.name}`}
              className="rounded-3xl"
            >
              <Card className="gap-4 p-5">
                <Card.Body className="gap-1">
                  <Card.Title className="text-xl font-semibold">
                    {location.name}
                  </Card.Title>
                  <Card.Description>
                    {location.description || "Explore this study location."}
                  </Card.Description>
                </Card.Body>
                <Card.Footer className="border-separator flex-row flex-wrap items-center justify-between gap-2 border-t pt-4">
                  <Text className="text-muted text-sm">
                    {noiseLabels[location.noiseLevel]}
                  </Text>
                  <Text className="text-accent text-sm font-semibold">
                    View location →
                  </Text>
                </Card.Footer>
              </Card>
            </PressableFeedback>
          </Link>
        ))}
      </View>
      <Text className="text-muted text-center text-xs leading-5">
        {query.data ? `${locations.length} study locations` : ""}
      </Text>
    </Screen>
  );
}
