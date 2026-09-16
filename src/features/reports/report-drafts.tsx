import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import type { CrowdLevel } from "@/features/reports/api";

interface ReportDraft {
  crowdLevel?: CrowdLevel;
  comment: string;
}
interface DraftContextValue {
  drafts: Record<number, ReportDraft>;
  setDrafts: Dispatch<SetStateAction<Record<number, ReportDraft>>>;
}
const DraftContext = createContext<DraftContextValue | null>(null);
const emptyDraft: ReportDraft = { comment: "" };

// In-memory only: keep a draft across the sign-in route, never across app restarts.
export const ReportDraftProvider = ({ children }: { children: ReactNode }) => {
  const [drafts, setDrafts] = useState<Record<number, ReportDraft>>({});
  const value = useMemo(() => ({ drafts, setDrafts }), [drafts]);
  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
};

export const useReportDraft = (locationId: number) => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("ReportDraftProvider is required");
  }
  const { drafts, setDrafts } = context;
  return {
    draft: drafts[locationId] ?? emptyDraft,
    updateDraft: (update: Partial<ReportDraft>) =>
      setDrafts((current) => ({
        ...current,
        [locationId]: { ...(current[locationId] ?? emptyDraft), ...update },
      })),
    clearDraft: () =>
      setDrafts((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== String(locationId))
        )
      ),
  };
};
