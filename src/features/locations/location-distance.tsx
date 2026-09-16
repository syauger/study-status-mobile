import { useQuery } from "@tanstack/react-query";
import {
  Accuracy,
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { Text } from "react-native";

import type { Coordinates } from "@/features/locations/distance";
import { distanceInMiles, formatDistance } from "@/features/locations/distance";

export const LocationDistance = ({ location }: { location: Coordinates }) => {
  const position = useQuery({
    queryKey: ["device-location"],
    queryFn: async () => {
      let permission = await getForegroundPermissionsAsync();
      if (permission.status === "undetermined") {
        permission = await requestForegroundPermissionsAsync();
      }
      if (!permission.granted) {
        return null;
      }
      const current = await getCurrentPositionAsync({
        accuracy: Accuracy.High,
      });
      return current.coords;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  });
  let label = "Distance unavailable";
  if (position.isPending) {
    label = "Finding your location…";
  } else if (position.data === null) {
    label = "Enable location for distance";
  } else if (position.data && !position.isError) {
    label = `${formatDistance(distanceInMiles(position.data, location))} away · straight-line`;
  }
  return (
    <Text className="text-accent bg-accent/10 self-start rounded-full px-3 py-1 text-xs font-semibold">
      {label}
    </Text>
  );
};
