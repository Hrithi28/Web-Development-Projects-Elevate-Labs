// src/components/CampaignForm.jsx
// The input form where users enter their campaign brief.

import React, { useState } from "react";

const PLATFORMS = [
  { value: "blog", label: "📝 Blog Post" },
  { value: "twitter", label: "🐦 Twitter / X" },
  { value: "instagram", label: "📸 Instagram" },
  { value: "newsletter", label: "📧 Newsletter" },
];

const TONES = [
  "professional yet approachable",
  "playful and energetic",
  "luxury and exclusive",
  "eco-conscious and sincere",
  "bold and edgy",
];

export default function CampaignForm({ onSubmit, loading }) {
  const [brief, setBrief] = useState("");
  const [platforms, setPlatforms] = useState(["blog", "twitter"]);
  const [brandTone, setBrandTone] = useState(TONES[0]);
  const [numImages, setNumImages] = useState(2);

  const togglePlatform = (value) => {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brief.trim() || platforms.length === 0) return;
    onSubmit({ brief, platforms, brand_tone: brandTone, num_images: numImages });
  };

  return (
    <form onSubmit={handleSubmit} className="campaign-form">
      <div className="form-group">
        <label htmlFor="brief">Campaign Brief</label>
        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g. Launch campaign for eco-friendly sneakers targeting Gen-Z on a summer theme..."
          rows={4}
          required
          minLength={10}
          disabled={loading}
        />
        <span className="char-count">{brief.length} / 1000</span>
      </div>

      <div className="form-group">
        <label>Target Platforms</label>
        <div className="platform-grid">
          {PLATFORMS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`platform-chip ${platforms.includes(value) ? "active" : ""}`}
              onClick={() => togglePlatform(value)}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tone">Brand Tone</label>
          <select
            id="tone"
            value={brandTone}
            onChange={(e) => setBrandTone(e.target.value)}
            disabled={loading}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="images">Number of Images</label>
          <select
            id="images"
            value={numImages}
            onChange={(e) => setNumImages(Number(e.target.value))}
            disabled={loading}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} image{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || !brief.trim() || platforms.length === 0}
      >
        {loading ? "Generating..." : "✨ Generate Campaign Assets"}
      </button>
    </form>
  );
}
