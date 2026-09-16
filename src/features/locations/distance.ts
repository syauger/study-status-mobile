export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_MILES = 3958.7613;
const FEET_PER_MILE = 5280;
const radians = (degrees: number): number => (degrees * Math.PI) / 180;

export const distanceInMiles = (from: Coordinates, to: Coordinates): number => {
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return (
    2 *
    EARTH_RADIUS_MILES *
    Math.asin(Math.sqrt(Math.min(1, Math.max(0, haversine))))
  );
};

export const formatDistance = (miles: number): string => {
  const feet = miles * FEET_PER_MILE;
  if (feet < 50) {
    return "Under 50 ft";
  }
  if (miles < 0.1) {
    return `${(Math.round(feet / 10) * 10).toLocaleString("en-US")} ft`;
  }
  return `${miles.toLocaleString("en-US", { maximumFractionDigits: miles < 10 ? 1 : 0 })} mi`;
};
