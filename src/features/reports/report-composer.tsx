import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Label,
  RadioGroup,
  TextArea,
  TextField,
} from "heroui-native";
import { useRef } from "react";
import { Text, View } from "react-native";

import {
  crowdLabels,
  crowdLevels,
  ReportApiError,
} from "@/features/reports/api";
import { createReport } from "@/features/reports/create-report";
import { useReportDraft } from "@/features/reports/report-drafts";

export const ReportComposer = ({
  locationId,
  signedIn,
  onSignIn,
  onClose,
  onCreated,
  onSessionExpired,
}: {
  locationId: number;
  signedIn: boolean;
  onSignIn: () => void;
  onClose: () => void;
  onCreated: () => void;
  onSessionExpired: () => void;
}) => {
  const {
    draft: { crowdLevel, comment },
    updateDraft,
    clearDraft,
  } = useReportDraft(locationId);
  const submitting = useRef(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createReport,
    retry: false,
    onError: (error) => {
      if (error instanceof ReportApiError && error.status === 401) {
        onSessionExpired();
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reports", locationId],
      });
      clearDraft();
      onCreated();
    },
  });
  const expired =
    mutation.error instanceof ReportApiError && mutation.error.status === 401;
  const submit = async () => {
    if (!crowdLevel || submitting.current || !signedIn) {
      return;
    }
    submitting.current = true;
    try {
      await mutation.mutateAsync({
        locationId,
        crowdLevel,
        comment: comment.trim() || undefined,
      });
    } catch {
      // The mutation error is displayed below without discarding the draft.
    }
    submitting.current = false;
  };
  return (
    <Card className="gap-5 p-5">
      <Card.Title>Create a report</Card.Title>
      <Text className="text-muted">How busy is it right now?</Text>
      <RadioGroup
        accessibilityLabel="Crowd level"
        value={crowdLevel}
        onValueChange={(value) => {
          const selected = crowdLevels.find((level) => level === value);
          updateDraft({ crowdLevel: selected });
          mutation.reset();
        }}
        isDisabled={mutation.isPending}
      >
        {crowdLevels.map((level) => (
          <RadioGroup.Item key={level} value={level}>
            {crowdLabels[level]}
          </RadioGroup.Item>
        ))}
      </RadioGroup>
      <TextField isDisabled={mutation.isPending}>
        <Label>Comment (optional)</Label>
        <TextArea
          accessibilityLabel="Report comment"
          value={comment}
          onChangeText={(value) => updateDraft({ comment: value })}
          maxLength={1000}
          placeholder="Anything other students should know?"
        />
        <Text className="text-muted text-xs">
          {comment.length}/1000 · Your name and report will be visible to
          everyone.
        </Text>
      </TextField>
      {mutation.isError ? (
        <Text accessibilityRole="alert" className="text-danger">
          {mutation.error.message}
        </Text>
      ) : null}
      {!signedIn || expired ? (
        <Button
          onPress={() => {
            mutation.reset();
            onSignIn();
          }}
        >
          Sign in to create a report
        </Button>
      ) : (
        <Button
          isDisabled={!crowdLevel || mutation.isPending}
          onPress={() => {
            void submit();
          }}
        >
          {mutation.isPending ? "Posting…" : "Post report"}
        </Button>
      )}
      <View>
        <Button
          variant="ghost"
          isDisabled={mutation.isPending}
          onPress={() => {
            clearDraft();
            onClose();
          }}
        >
          Cancel
        </Button>
      </View>
    </Card>
  );
};
