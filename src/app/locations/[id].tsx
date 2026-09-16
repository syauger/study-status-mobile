import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip } from "heroui-native";
import { Text, View } from "react-native";

import { LocationQueryState } from "@/components/location-query-state";
import { Screen } from "@/components/screen";
import {
  locationQueryOptions,
  noiseLabels,
  getAmenities,
  weekdays,
} from "@/features/locations/api";
import { LocationReports } from "@/features/reports/location-reports";

export default function LocationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery(locationQueryOptions(id));
  const location = query.data;
  if (query.isPending) {
    return (
      <Screen back>
        <LocationQueryState loading />
      </Screen>
    );
  }
  if (query.isError && !location) {
    return (
      <Screen back>
        <LocationQueryState
          retry={() => {
            void query.refetch();
          }}
          refreshing={query.isFetching}
        />
      </Screen>
    );
  }
  if (!location) {
    return (
      <Screen back>
        <Text
          accessibilityRole="header"
          className="text-foreground text-3xl font-bold"
        >
          Location not found
        </Text>
        <Text className="text-muted text-base">
          This spot isn’t in our list. Browse the other study locations to find
          a place.
        </Text>
        <Link href="/" asChild>
          <Button>Browse locations</Button>
        </Link>
      </Screen>
    );
  }
  return (
    <Screen back>
      {query.isError ? (
        <LocationQueryState
          retry={() => {
            void query.refetch();
          }}
          refreshing={query.isFetching}
        />
      ) : null}
      <View className="gap-3">
        <Text className="text-accent text-xs font-semibold tracking-widest uppercase">
          Study location
        </Text>
        <Text
          accessibilityRole="header"
          className="text-foreground text-4xl font-bold tracking-tight"
        >
          {location.name}
        </Text>
      </View>
      <Card className="gap-4 p-5">
        <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
          <Card.Title>Study conditions</Card.Title>
        </Card.Header>
        <Card.Body className="gap-4">
          <View className="gap-1">
            <Text className="text-muted text-sm">Expected noise level</Text>
            <Text className="text-foreground text-lg font-semibold">
              {noiseLabels[location.noiseLevel]}
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-muted text-sm">Hours</Text>
            {location.hours ? (
              <View className="gap-2">
                {weekdays.map((day) => (
                  <View
                    key={day}
                    className="flex-row flex-wrap justify-between gap-2"
                  >
                    <Text className="text-foreground capitalize">{day}</Text>
                    <Text className="text-foreground">
                      {location.hours?.[day]}
                    </Text>
                  </View>
                ))}
                <Text className="text-muted text-xs">
                  Times in {location.hours.timezone}
                </Text>
                {location.hours.notes ? (
                  <Text className="text-muted text-sm leading-6">
                    {location.hours.notes}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text className="text-muted">Hours not listed</Text>
            )}
          </View>
        </Card.Body>
        <Card.Footer>
          <Text className="text-muted text-xs">
            Noise levels describe typical conditions, not live reports.
          </Text>
        </Card.Footer>
      </Card>
      <View className="gap-3">
        <Text
          accessibilityRole="header"
          className="text-foreground text-xl font-semibold"
        >
          About this spot
        </Text>
        <Text className="text-muted text-base leading-7">
          {location.description || "No description available yet."}
        </Text>
      </View>
      <View className="gap-3">
        <Text
          accessibilityRole="header"
          className="text-foreground text-xl font-semibold"
        >
          What’s here
        </Text>
        {getAmenities(location.amenities).length === 0 ? (
          <Text className="text-muted">Amenities not listed</Text>
        ) : null}
        <View className="flex-row flex-wrap gap-2">
          {getAmenities(location.amenities).map((amenity) => (
            <Chip key={amenity} variant="secondary" color="default">
              <Chip.Label>{amenity}</Chip.Label>
            </Chip>
          ))}
        </View>
      </View>
      <LocationReports key={location.id} locationId={location.id} />
    </Screen>
  );
}
