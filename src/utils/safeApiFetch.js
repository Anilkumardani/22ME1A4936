export async function safeApiFetch(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(
      "Unexpected server response. Not valid JSON: " + text.slice(0, 100)
    );
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "API error");
  }
  return data;
}
