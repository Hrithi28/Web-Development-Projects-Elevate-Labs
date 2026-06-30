// src/utils/api.js
// Centralised API client for the AI Content Engine backend.

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Submit a campaign brief for async processing.
 * Returns { task_id, status, message }
 */
export async function createCampaign(payload) {
  const res = await fetch(`${API_BASE}/api/v1/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create campaign");
  }
  return res.json();
}

/**
 * Poll task status by task_id.
 * Returns { task_id, status, progress, result, error }
 */
export async function getTaskStatus(taskId) {
  const res = await fetch(`${API_BASE}/api/v1/tasks/${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch task status");
  return res.json();
}

/**
 * Poll until task reaches SUCCESS or FAILURE.
 * Calls onProgress(taskData) on each tick.
 */
export async function pollUntilComplete(taskId, onProgress, intervalMs = 2000) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const data = await getTaskStatus(taskId);
        onProgress(data);
        if (data.status === "SUCCESS") {
          clearInterval(interval);
          resolve(data);
        } else if (data.status === "FAILURE") {
          clearInterval(interval);
          reject(new Error(data.error || "Task failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, intervalMs);
  });
}
