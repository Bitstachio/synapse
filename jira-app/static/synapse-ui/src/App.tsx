import { invoke } from "@forge/bridge";
import { useState } from "react";

type SynapseData = {
  risk_score: number;
  violated_controls: string[];
  remediation: string;
};

type SynapseResponse = {
  success: boolean;
  message: string;
  data: SynapseData;
  error_code: string | null;
};

function getRiskLevel(score: number): "low" | "moderate" | "high" {
  if (score <= 0.3) return "low";
  if (score <= 0.6) return "moderate";
  return "high";
}

const riskStyles = {
  low: "bg-risk-low-bg text-risk-low",
  moderate: "bg-risk-moderate-bg text-risk-moderate",
  high: "bg-risk-high-bg text-risk-high",
} as const;

function App() {
  const [result, setResult] = useState<SynapseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const raw = await invoke<string>("analyzeStory", {
        story_text: "stringstri",
      });
      const parsed: SynapseResponse = JSON.parse(raw ?? "{}");
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result?.data ? getRiskLevel(result.data.risk_score) : "low";
  const riskLabel =
    riskLevel === "low"
      ? "Low risk"
      : riskLevel === "moderate"
        ? "Moderate risk"
        : "High risk";

  return (
    <div className="flex flex-col gap-4 max-w-full p-4">
      <h1 className="text-xl font-semibold m-0">Synapse</h1>
      <button
        type="button"
        className="self-start px-4 py-2 text-sm font-medium text-white bg-jira-blue rounded-md border-0 cursor-pointer hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={runAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing…" : "Analyze story"}
      </button>
      {error && (
        <p className="m-0 p-3 text-sm text-risk-high bg-risk-high-bg rounded-md">
          {error}
        </p>
      )}
      {result?.data && (
        <article className="p-4 bg-white border border-[var(--ds-border,#dfe1e6)] rounded-lg shadow-sm text-left">
          {result.message && (
            <p className="m-0 mb-4 text-sm text-[var(--ds-text-subtle,#6b778c)]">
              {result.message}
            </p>
          )}
          <div
            className={`flex flex-col gap-1 mb-4 p-3 rounded-md text-sm font-medium ${riskStyles[riskLevel]}`}
            title={`Risk score: ${result.data.risk_score}`}
          >
            <span className="font-semibold uppercase tracking-wide">
              Risk score
            </span>
            <span>
              {(result.data.risk_score * 100).toFixed(0)}% — {riskLabel}
            </span>
          </div>
          <section className="mb-4 last:mb-0">
            <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ds-text-subtle,#6b778c)]">
              Violated controls
            </h3>
            {result.data.violated_controls.length === 0 ? (
              <p className="m-0 text-sm leading-normal text-[var(--ds-text,#172b4d)]">
                None
              </p>
            ) : (
              <ul className="m-0 pl-5 text-sm leading-normal text-[var(--ds-text,#172b4d)] list-disc">
                {result.data.violated_controls.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ds-text-subtle,#6b778c)]">
              Remediation
            </h3>
            <p className="m-0 text-sm leading-normal text-[var(--ds-text,#172b4d)]">
              {result.data.remediation}
            </p>
          </section>
        </article>
      )}
    </div>
  );
}

export default App;
