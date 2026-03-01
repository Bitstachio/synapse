import { useState } from "react";
import { invoke } from "@forge/bridge";
import "./App.css";

function App() {
  const [rawText, setRawText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalyze = async () => {
    setLoading(true);
    setError(null);
    setRawText("");
    try {
      const result = await invoke<string>("analyzeStory", {
        story_text: "stringstri",
      });
      setRawText(result ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1>Synapse</h1>
        <button type="button" onClick={runAnalyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze story"}
        </button>
        {error && <p className="error">{error}</p>}
        {rawText && (
          <pre className="raw-response">{rawText}</pre>
        )}
      </div>
    </>
  );
}

export default App;
