// src/App.js
// Root component wiring together the form, progress bar, and results dashboard.

import React from "react";
import CampaignForm from "./components/CampaignForm";
import ProgressBar from "./components/ProgressBar";
import ResultsDashboard from "./components/ResultsDashboard";
import { useCampaign } from "./hooks/useCampaign";
import "./App.css";

export default function App() {
  const { status, progress, taskId, result, error, generate, reset } = useCampaign();

  const isLoading = status === "loading" || status === "polling";

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">AI Content Engine</span>
          </div>
          <p className="tagline">
            One brief. Blog posts, tweets, images &amp; SEO — generated in parallel.
          </p>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Show form when idle or errored */}
        {(status === "idle" || status === "error") && (
          <>
            <CampaignForm onSubmit={generate} loading={false} />
            {status === "error" && (
              <div className="error-banner">
                <strong>Error:</strong> {error}
              </div>
            )}
          </>
        )}

        {/* Show progress while generating */}
        {isLoading && (
          <div className="loading-section">
            <CampaignForm onSubmit={generate} loading={true} />
            <ProgressBar progress={progress} taskId={taskId} />
          </div>
        )}

        {/* Show results dashboard */}
        {status === "success" && (
          <ResultsDashboard result={result} onReset={reset} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by <strong>GPT-4o</strong> + <strong>DALL-E 3</strong> ·
          Async via <strong>Celery + Redis</strong>
        </p>
      </footer>
    </div>
  );
}
