"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useReviewTasks(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["reviewTasks", params],
    queryFn: () => api.review.list(params),
  });
}

export function useAcceptTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reviewerId, note }: { taskId: string; reviewerId: string; note?: string }) =>
      api.review.accept(taskId, { reviewer_id: reviewerId, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviewTasks"] }),
  });
}

export function useRejectTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reviewerId, note }: { taskId: string; reviewerId: string; note?: string }) =>
      api.review.reject(taskId, { reviewer_id: reviewerId, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviewTasks"] }),
  });
}

export function useEditTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      reviewerId,
      correctedValue,
      note,
    }: {
      taskId: string;
      reviewerId: string;
      correctedValue: unknown;
      note?: string;
    }) => api.review.edit(taskId, { reviewer_id: reviewerId, corrected_value: correctedValue, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviewTasks"] }),
  });
}

export function useBulkAccept() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskIds, reviewerId }: { taskIds: string[]; reviewerId: string }) =>
      api.review.bulkAccept({ task_ids: taskIds, reviewer_id: reviewerId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviewTasks"] }),
  });
}
