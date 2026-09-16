import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Spinner } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { crowdLabels, reportsQueryOptions } from "@/features/reports/api";
import type { CrowdLevel, StudyReport } from "@/features/reports/api";
import { ReportComposer } from "@/features/reports/report-composer";
import { authClient } from "@/lib/auth-client";

const crowdColors: Record<CrowdLevel, "success" | "warning" | "danger"> = {
  empty: "success",
  moderate: "warning",
  busy: "danger",
};
const ReportCard = ({ report }: { report: StudyReport }) => (
  <Card className="gap-3 p-5">
    <Card.Header className="flex-row flex-wrap items-center justify-between gap-3">
      <Text className="text-foreground font-semibold">{report.authorName}</Text>
      <Chip variant="soft" size="sm" color={crowdColors[report.crowdLevel]}>
        <Chip.Label>{crowdLabels[report.crowdLevel]}</Chip.Label>
      </Chip>
    </Card.Header>
    {report.comment ? (
      <Text className="text-foreground text-base leading-6">
        {report.comment}
      </Text>
    ) : null}
    <Text className="text-muted text-xs">
      {new Date(report.createdAt).toLocaleString()}
    </Text>
  </Card>
);

export const LocationReports = ({ locationId }: { locationId: number }) => {
  const query = useInfiniteQuery(reportsQueryOptions(locationId));
  const session = authClient.useSession();
  const { create } = useLocalSearchParams<{ create?: string }>();
  const [created, setCreated] = useState(false);
  const signIn = () =>
    router.push({
      pathname: "/login",
      params: { locationId: String(locationId) },
    });
  const createLabel = session.data ? "Create" : "Sign in to create a report";
  const reports = query.data?.pages.flatMap((page) => page.reports) ?? [];
  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <Text
          accessibilityRole="header"
          className="text-foreground text-2xl font-semibold"
        >
          Recent reports
        </Text>
        <Button
          size="sm"
          variant="ghost"
          isDisabled={query.isFetching}
          onPress={() => {
            void query.refetch();
          }}
        >
          {query.isFetching ? "Refreshing…" : "Refresh reports"}
        </Button>
      </View>
      <Text className="text-muted">
        Updates from people studying here, newest first.
      </Text>
      {session.error ? (
        <View className="gap-2">
          <Text accessibilityRole="alert" className="text-muted">
            We couldn’t check your sign-in status.
          </Text>
          <Button
            variant="secondary"
            onPress={() => {
              void session.refetch();
            }}
          >
            Retry sign-in check
          </Button>
        </View>
      ) : null}
      {create === "1" ? (
        <ReportComposer
          locationId={locationId}
          signedIn={!!session.data}
          onSignIn={signIn}
          onSessionExpired={() => {
            void session.refetch();
          }}
          onClose={() => router.setParams({ create: undefined })}
          onCreated={() => {
            setCreated(true);
            router.setParams({ create: undefined });
          }}
        />
      ) : (
        <Button
          isDisabled={session.isPending || !!session.error}
          onPress={() => {
            setCreated(false);
            if (session.data) {
              router.setParams({ create: "1" });
            } else {
              signIn();
            }
          }}
        >
          {session.isPending ? "Checking sign-in…" : createLabel}
        </Button>
      )}
      {session.data ? (
        <Button variant="ghost" size="sm" onPress={signIn}>
          Signed in as {session.data.user.name} · Account
        </Button>
      ) : null}
      {created ? (
        <Text accessibilityLiveRegion="polite" className="text-success">
          Your report has been posted.
        </Text>
      ) : null}
      {query.isPending ? (
        <View className="flex-row items-center gap-3">
          <Spinner size="sm" />
          <Text className="text-muted">Loading reports…</Text>
        </View>
      ) : null}
      {query.isError ? (
        <View className="gap-3">
          <Text accessibilityRole="alert" className="text-danger">
            We couldn’t load{" "}
            {query.isFetchNextPageError ? "more" : "the latest"} reports.
          </Text>
          <Button
            variant="secondary"
            isDisabled={query.isFetching}
            onPress={() => {
              if (query.isFetchNextPageError) {
                void query.fetchNextPage();
              } else {
                void query.refetch();
              }
            }}
          >
            Try again
          </Button>
        </View>
      ) : null}
      {query.isSuccess && reports.length === 0 ? (
        <Text className="text-muted py-4">
          No reports yet. Be the first to share an update.
        </Text>
      ) : null}
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
      {query.hasNextPage ? (
        <Button
          variant="secondary"
          isDisabled={query.isFetching}
          onPress={() => {
            void query.fetchNextPage();
          }}
        >
          {query.isFetchingNextPage ? "Loading more…" : "Load more reports"}
        </Button>
      ) : null}
      {reports.length > 0 && !query.hasNextPage ? (
        <Text className="text-muted text-center text-xs">
          You’re all caught up.
        </Text>
      ) : null}
    </View>
  );
};
