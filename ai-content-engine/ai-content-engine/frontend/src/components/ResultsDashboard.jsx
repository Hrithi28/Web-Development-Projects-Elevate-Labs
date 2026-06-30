// src/components/ResultsDashboard.jsx
// Displays all generated campaign assets in a tabbed layout.

import React, { useState } from "react";

const TABS = ["Blog Post", "Tweets", "Instagram", "Newsletter", "SEO", "Images"];

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ResultsDashboard({ result, onReset }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!result) return null;

  const {
    blog_post,
    tweets = [],
    instagram_caption,
    newsletter_intro,
    seo_metadata = {},
    image_urls = [],
    image_prompts = [],
  } = result;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🎯 Campaign Assets Ready</h2>
        <button className="btn-secondary" onClick={onReset}>
          ← New Campaign
        </button>
      </div>

      {/* Tab navigation */}
      <nav className="tab-nav">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab: Blog Post */}
      {activeTab === 0 && (
        <div className="tab-content">
          <div className="content-card">
            <div className="card-actions">
              <button className="btn-copy" onClick={() => copyToClipboard(blog_post || "")}>
                📋 Copy
              </button>
            </div>
            <div className="blog-content">
              {(blog_post || "No blog post generated.").split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tweets */}
      {activeTab === 1 && (
        <div className="tab-content">
          {tweets.length === 0 ? (
            <p>No tweets generated.</p>
          ) : (
            tweets.map((tweet, i) => (
              <div key={i} className="tweet-card">
                <div className="tweet-header">
                  <span className="tweet-label">Tweet {i + 1}</span>
                  <span className={`char-badge ${tweet.length > 280 ? "over" : "ok"}`}>
                    {tweet.length}/280
                  </span>
                  <button className="btn-copy" onClick={() => copyToClipboard(tweet)}>📋</button>
                </div>
                <p className="tweet-text">{tweet}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Instagram */}
      {activeTab === 2 && (
        <div className="tab-content">
          <div className="content-card">
            <div className="card-actions">
              <button className="btn-copy" onClick={() => copyToClipboard(instagram_caption || "")}>
                📋 Copy
              </button>
            </div>
            <p className="instagram-caption">{instagram_caption || "No Instagram caption generated."}</p>
          </div>
        </div>
      )}

      {/* Tab: Newsletter */}
      {activeTab === 3 && (
        <div className="tab-content">
          <div className="content-card">
            <div className="card-actions">
              <button className="btn-copy" onClick={() => copyToClipboard(newsletter_intro || "")}>
                📋 Copy
              </button>
            </div>
            <p className="newsletter-intro">{newsletter_intro || "No newsletter intro generated."}</p>
          </div>
        </div>
      )}

      {/* Tab: SEO */}
      {activeTab === 4 && (
        <div className="tab-content">
          <div className="seo-card">
            <div className="seo-field">
              <label>Meta Title</label>
              <div className="seo-value-row">
                <span>{seo_metadata.title || "—"}</span>
                <button className="btn-copy" onClick={() => copyToClipboard(seo_metadata.title || "")}>📋</button>
              </div>
            </div>
            <div className="seo-field">
              <label>Meta Description</label>
              <div className="seo-value-row">
                <span>{seo_metadata.meta_description || "—"}</span>
                <button className="btn-copy" onClick={() => copyToClipboard(seo_metadata.meta_description || "")}>📋</button>
              </div>
            </div>
            <div className="seo-field">
              <label>Keywords</label>
              <div className="keyword-chips">
                {(seo_metadata.keywords || []).map((kw, i) => (
                  <span key={i} className="keyword-chip">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Images */}
      {activeTab === 5 && (
        <div className="tab-content">
          {image_urls.length === 0 ? (
            <p>No images generated.</p>
          ) : (
            <div className="image-grid">
              {image_urls.map((url, i) => (
                <div key={i} className="image-card">
                  <img src={url} alt={`Generated promotional image ${i + 1}`} />
                  <div className="image-caption">
                    <p className="image-prompt-text">Prompt: {image_prompts[i] || "—"}</p>
                    <a href={url} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                      ↗ Open Full Size
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
