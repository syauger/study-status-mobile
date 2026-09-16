import { queryOptions } from "@tanstack/react-query";

import { API_BASE_URL } from "@/lib/constants";

export const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type LocationHours = Record<(typeof weekdays)[number], string> & {
  timezone: string;
  notes: string;
};
export interface StudyLocation {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  amenities: string;
  hours: LocationHours | null;
  noiseLevel: "unknown" | "quiet" | "conversational" | "lively" | "mixed";
}

interface LocationsPage {
  success: boolean;
  locations: StudyLocation[];
  nextPage: number | null;
}

export class LocationsError extends Error {
  status: number;
  constructor(status: number) {
    super("Unable to load locations. Please try again.");
    this.name = "LocationsError";
    this.status = status;
  }
}

const request = async <T extends { success: boolean }>(
  path: string,
  signal: AbortSignal
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new LocationsError(response.status);
  }
  const data: T = await response.json();
  if (!data.success) {
    throw new LocationsError(500);
  }
  return data;
};

export const locationsQueryOptions = queryOptions({
  queryKey: ["locations", "list"],
  queryFn: async ({ signal }): Promise<StudyLocation[]> => {
    const locations: StudyLocation[] = [];
    let page: number | null = 0;
    while (page !== null) {
      // Each page depends on the nextPage cursor returned by the previous request.
      // eslint-disable-next-line no-await-in-loop
      const result: LocationsPage = await request(
        `/api/locations?page=${page}`,
        signal
      );
      locations.push(...result.locations);
      if (
        result.nextPage !== null &&
        (!Number.isInteger(result.nextPage) || result.nextPage <= page)
      ) {
        throw new LocationsError(500);
      }
      page = result.nextPage;
    }
    return locations;
  },
  staleTime: 60_000,
  retry: 1,
});

export const locationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["locations", "detail", id],
    queryFn: async ({ signal }): Promise<StudyLocation | null> => {
      if (
        !/^\d+$/u.test(id) ||
        !Number.isSafeInteger(Number(id)) ||
        Number(id) <= 0
      ) {
        return null;
      }
      try {
        const result = await request<{
          success: boolean;
          location: StudyLocation;
        }>(`/api/locations/${encodeURIComponent(id)}`, signal);
        return result.location;
      } catch (error) {
        if (error instanceof LocationsError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 60_000,
    retry: 1,
  });

export const noiseLabels: Record<StudyLocation["noiseLevel"], string> = {
  unknown: "Noise level not listed",
  quiet: "Quiet",
  conversational: "Conversational",
  lively: "Lively",
  mixed: "Quiet & collaborative areas",
};

const amenityLabels: Record<string, string> = {
  wifi: "Wi-Fi",
  coffee: "Coffee",
  outdoor: "Outdoor space",
  seating: "Seating",
  outlets: "Power outlets",
  printing: "Printing",
  whiteboards: "Whiteboards",
};
export const getAmenities = (value: string): string[] =>
  [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ].map((item) => amenityLabels[item] ?? item);

export interface Weather {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  time: number;
}

export const weatherQueryOptions = (locationId: number) =>
  queryOptions({
    queryKey: ["locations", "weather", locationId],
    queryFn: async ({ signal }): Promise<Weather> => {
      const result = await request<{ success: boolean; weather: Weather }>(
        `/api/locations/${locationId}/weather`,
        signal
      );
      return result.weather;
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
    retry: 1,
  });
