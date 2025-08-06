export async function logInfo(event, details) {
  try {
    const response = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        details,
        level: "info",
        timestamp: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("Logging failed");
    const data = await response.json();
    return data.logID;
  } catch {
    return null;
  }
}

export async function logError(event, details) {
  try {
    const response = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        details,
        level: "error",
        timestamp: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("Logging failed");
    const data = await response.json();
    return data.logID;
  } catch {
    return null;
  }
}
