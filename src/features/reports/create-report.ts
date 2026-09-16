import { Platform } from "react-native";

import { postReport } from "@/features/reports/api";
import type { CreateReportInput } from "@/features/reports/api";
import { authClient } from "@/lib/auth-client";

export const createReport = async (input: CreateReportInput) => {
  if (Platform.OS === "web") {
    return postReport(input, { credentials: "include" });
  }
  const cookie = await authClient.getCookie();
  return postReport(input, {
    credentials: "omit",
    headers: { Cookie: cookie ?? "" },
  });
};
