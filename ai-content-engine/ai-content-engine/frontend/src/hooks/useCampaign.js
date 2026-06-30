// src/hooks/useCampaign.js
// Custom hook encapsulating campaign creation + polling logic.

import { useState, useCallback } from "react";
import { createCampaign, pollUntilComplete } from "../utils/api";

const INITIAL_STATE = {
  status: "idle",   // idle | loading | polling | success | error
  taskId: null,
  progress: 0,
  result: null,
  error: null,
};

export function useCampaign() {
  const [state, setState] = useState(INITIAL_STATE);

  const generate = useCallback(async (formData) => {
    setState({ ...INITIAL_STATE, status: "loading" });

    try {
      // 1. Submit brief — get task_id immediately (non-blocking)
      const { task_id } = await createCampaign(formData);
      setState((s) => ({ ...s, status: "polling", taskId: task_id, progress: 5 }));

      // 2. Poll backend until generation is complete
      const finalData = await pollUntilComplete(
        task_id,
        (taskData) => {
          setState((s) => ({
            ...s,
            progress: taskData.progress || s.progress,
          }));
        },
        2000,
      );

      setState({
        status: "success",
        taskId: task_id,
        progress: 100,
        result: finalData.result,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "error",
        error: err.message || "An unexpected error occurred.",
      }));
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, generate, reset };
}
