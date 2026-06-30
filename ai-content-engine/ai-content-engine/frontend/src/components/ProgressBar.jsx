// src/components/ProgressBar.jsx
// Animated progress bar shown while the Celery task is running.

import React from "react";

const STEPS = [
  { threshold: 0,  label: "Queued" },
  { threshold: 10, label: "Initialising AI models" },
  { threshold: 20, label: "Generating copy & images in parallel" },
  { threshold: 60, label: "Copy ready — awaiting images" },
  { threshold: 90, label: "Assembling final assets" },
  { threshold: 100, label: "Complete!" },
];

function getCurrentStep(progress) {
  let current = STEPS[0];
  for (const step of STEPS) {
    if (progress >= step.threshold) current = step;
  }
  return current;
}

export default function ProgressBar({ progress, taskId }) {
  const step = getCurrentStep(progress);

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-label">{step.label}</span>
        <span className="progress-pct">{progress}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {taskId && (
        <p className="task-id-label">Task ID: <code>{taskId}</code></p>
      )}
      <p className="progress-hint">
        ⚡ Text &amp; images are generating in parallel — this takes ~15–30s
      </p>
    </div>
  );
}
