import { infiniteQueryOptions } from "@tanstack/react-query";

import { API_BASE_URL } from "@/lib/constants";

export const crowdLevels = ["empty", "moderate", "busy"] as const;
export type CrowdLevel = (typeof crowdLevels)[number];
export const crowdLabels: Record<CrowdLevel, string> = {
  empty: "Plenty of space",
  moderate: "Some seats available",
  busy: "Busy",
};
export interface StudyReport {
  id: number;
  locationId: number;
  authorName: string;
  crowdLevel: CrowdLevel;
  comment: string | null;
  createdAt: string;
}
export interface ReportsPage {
  success: boolean;
  reports: StudyReport[];
  nextCursor: number | null;
}
export interface CreateReportInput {
  locationId: number;
  crowdLevel: CrowdLevel;
  comment?: string;
}

export class ReportApiError extends Error {
  status: number;
  constructor(status: number) {
    let message = "We couldn’t save your report. Please try again.";
    if (status === 401) {
      message = "Your session expired. Sign in again to create a report.";
    }
    if (status === 400) {
      message =
        "Choose a crowd level and keep your comment under 1,001 characters.";
    }
    if (status === 404) {
      message = "This location is no longer available.";
    }
    super(message);
    this.name = "ReportApiError";
    this.status = status;
  }
}

export const reportsQueryOptions = (locationId: number) =>
  infiniteQueryOptions({
    queryKey: ["reports", locationId],
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam, signal }): Promise<ReportsPage> => {
      const params = new URLSearchParams({ locationId: String(locationId) });
      if (pageParam !== null) {
        params.set("before", String(pageParam));
      }
      const response = await fetch(`${API_BASE_URL}/api/reports?${params}`, {
        signal,
      });
      if (!response.ok) {
        throw new Error("Unable to load reports");
      }
      const data: ReportsPage = await response.json();
      if (!data.success) {
        throw new Error("Unable to load reports");
      }
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    retry: 1,
  });

export const postReport = async (
  input: CreateReportInput,
  authentication: Pick<RequestInit, "headers" | "credentials">
): Promise<StudyReport> => {
  const headers = new Headers(authentication.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    ...authentication,
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new ReportApiError(response.status);
  }
  const data: { success: boolean; report: StudyReport } = await response.json();
  if (!data.success) {
    throw new ReportApiError(500);
  }
  return data.report;
};
