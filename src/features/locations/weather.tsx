import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Card } from "heroui-native";
import { Text } from "react-native";

import { weatherQueryOptions } from "@/features/locations/api";

const conditions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export const LocationWeather = ({ locationId }: { locationId: number }) => {
  const query = useQuery(weatherQueryOptions(locationId));
  const weather = query.data;
  return (
    <Card className="gap-2 p-5">
      <Card.Title>Weather here</Card.Title>
      {weather ? (
        <Card.Body className="gap-1">
          <Text className="text-foreground text-xl font-semibold">
            {Math.round(weather.temperature_2m)}°C ·{" "}
            {conditions[weather.weather_code] ?? "Current conditions"}
          </Text>
          <Text className="text-muted text-sm">
            Feels like {Math.round(weather.apparent_temperature)}°C · Wind{" "}
            {Math.round(weather.wind_speed_10m)} km/h
          </Text>
          <Text className="text-muted text-xs">
            {query.isError ? "Showing last available weather · " : ""}
            Updated{" "}
            {new Date(weather.time * 1000).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        </Card.Body>
      ) : (
        <Text className="text-muted text-sm">
          {query.isPending
            ? "Loading weather…"
            : "Weather is temporarily unavailable."}
        </Text>
      )}
      <Link className="text-muted text-xs" href="https://open-meteo.com/">
        Weather by Open-Meteo
      </Link>
    </Card>
  );
};
