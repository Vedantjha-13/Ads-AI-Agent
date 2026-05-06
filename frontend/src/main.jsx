import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [productUrl, setProductUrl] = useState("https://crowdwisdomtrading.com");
  const [niche, setNiche] = useState("trading research and market signals");
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(5);
  const [forceMock, setForceMock] = useState(false);
  const [apifyStatus, setApifyStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/apify-status`)
      .then((response) => response.json())
      .then(setApifyStatus)
      .catch(() => setApifyStatus(null));
  }, []);

  async function generateAd() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/generate-ad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_url: productUrl,
          niche,
          days: Number(days),
          limit: Number(limit),
          force_mock: forceMock,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "The backend could not generate the ad flow.");
      }

      setResult(await response.json());
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="backdrop">
      <main className="page">
        <section className="panel form-panel">
          <div className="hero">
            <p className="eyebrow">Ads Intelligence Studio</p>
            <h1>Build your next winning ad angle in one run</h1>
            <p className="subtitle">
              Pull top-performing ads, extract insights, and generate a script ready for creative
              production.
            </p>
          </div>

          {apifyStatus && (
            <p className={apifyStatus.configured ? "status good" : "status"}>
              {apifyStatus.configured
                ? `Apify connected (${apifyStatus.target_type})`
                : "Apify not configured. Using mock fallback."}
            </p>
          )}

          <div className="form-grid">
            <label>
              Product URL
              <input
                value={productUrl}
                onChange={(event) => setProductUrl(event.target.value)}
                placeholder="https://your-product-site.com"
              />
            </label>

            <label>
              Niche
              <input
                value={niche}
                onChange={(event) => setNiche(event.target.value)}
                placeholder="Example: trading education for beginners"
              />
            </label>

            <div className="grid">
              <label>
                Lookback Days
                <input
                  min="1"
                  max="90"
                  type="number"
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                />
              </label>

              <label>
                Ad Limit
                <input
                  min="1"
                  max="25"
                  type="number"
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                />
              </label>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={forceMock}
                onChange={(event) => setForceMock(event.target.checked)}
              />
              <span>Use mock ads instead of Apify</span>
            </label>
          </div>

          <button onClick={generateAd} disabled={loading}>
            {loading ? "Generating Campaign..." : "Generate Campaign"}
          </button>

          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel results">
          {!result && (
            <div className="empty">
              <h2>Results will appear here</h2>
              <p>Run the generator to view market insights, ad script, selected ads, and output files.</p>
            </div>
          )}

          {result && (
            <>
              <div className="meta">
                <span>Source: {result.ad_source}</span>
                <span>Days: {result.search_days}</span>
                <span>Limit: {result.search_limit}</span>
              </div>

              {result.apify?.last_error && <p className="warning">{result.apify.last_error}</p>}

              <div className="insight-grid">
                <ResultList title="Pain Points" items={result.pain_points} />
                <ResultList title="Marketing Angles" items={result.marketing_angles} />
                <ResultList title="Concepts" items={result.concepts} />
              </div>

              <h2>Generated Script</h2>
              <pre>{result.ad_script}</pre>

              <h2>Selected Working Ads</h2>
              <div className="ads">
                {result.selected_ads.map((ad, index) => (
                  <article className="ad" key={`${ad.brand || "ad"}-${ad.started_at || index}`}>
                    <strong>{ad.brand}</strong>
                    <span>{ad.started_at}</span>
                    <p>{ad.hook}</p>
                    {ad.url && (
                      <a href={ad.url} target="_blank" rel="noreferrer">
                        View ad
                      </a>
                    )}
                  </article>
                ))}
              </div>

              <h2>Saved Files</h2>
              <pre>{JSON.stringify(result.saved_files, null, 2)}</pre>

              <h2>Video Plan</h2>
              <p className="muted">
                Remotion input, voice text, and subtitles are prepared by the backend.
              </p>
              <pre>{JSON.stringify(result.video_plan, null, 2)}</pre>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function ResultList({ title, items = [] }) {
  return (
    <section className="result-list">
      <h3>{title}</h3>
      <ul className="pill-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
