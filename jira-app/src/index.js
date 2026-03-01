import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
const resolver = new Resolver();

resolver.define("fetchLabels", async (req) => {
  const key = req.context.extension.issue.key;

  const res = await api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=labels`);

  const data = await res.json();

  const label = data.fields.labels;
  if (label == undefined) {
    console.warn(`${key}: Failed to find labels`);
    return [];
  }

  return label;
});

/**
 * Calls the Synapse analyze-story API with the given story text.
 * Returns the raw response body as a string.
 * Payload: { story_text?: string } (defaults to "stringstri" if omitted).
 */
resolver.define("analyzeStory", async (req) => {
  const storyText =
    (req.payload && req.payload.story_text) || "stringstri";

  const response = await fetch(
    "https://synapse-0olq.onrender.com/api/v1/analyze-story",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story_text: storyText }),
    }
  );

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`Synapse API error ${response.status}: ${rawText}`);
  }
  return rawText;
});

export const handler = resolver.getDefinitions();
