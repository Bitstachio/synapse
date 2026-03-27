import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";

const resolver = new Resolver();

const SYNAPSE_ANALYZE_URL =
  process.env.SYNAPSE_ANALYZE_URL ||
  "https://synapse-0olq.onrender.com/api/v1/analyze-story";

/**
 * Flatten Jira issue description (Atlassian Document Format) to plain text.
 */
function adfToPlainText(node) {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node)) return node.map(adfToPlainText).join(" ");
  if (node.content != null) return adfToPlainText(node.content);
  return "";
}

/**
 * Load description (preferred) or summary for the current issue.
 */
async function getIssueStoryText(issueKey) {
  const res = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/${issueKey}?fields=description,summary`,
    );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Jira issue fetch failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  const descText = adfToPlainText(data.fields?.description).trim();
  const summary = (data.fields?.summary || "").trim();

  if (descText.length >= 10) return descText;
  if (summary.length >= 10) return summary;
  if (descText.length > 0) return descText;
  if (summary.length > 0) return summary;
  return "No description or summary available for analysis.";
}

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
 * Calls the Synapse analyze-story API with the issue description (or payload.story_text).
 * Returns the raw JSON body as a string for the Custom UI to parse.
 */
resolver.define("analyzeStory", async (req) => {
  const issueKey = req.context?.extension?.issue?.key;
  let storyText =
    req.payload && typeof req.payload.story_text === "string"
      ? req.payload.story_text.trim()
      : "";

  if (storyText.length < 10) {
    if (!issueKey) {
      throw new Error(
        "story_text must be at least 10 characters, or open this panel from an issue with a description.",
      );
    }
    storyText = await getIssueStoryText(issueKey);
  }

  const response = await fetch(SYNAPSE_ANALYZE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story_text: storyText }),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`Synapse API error ${response.status}: ${rawText}`);
  }
  return rawText;
});

export const handler = resolver.getDefinitions();
