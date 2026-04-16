export async function parseServiceByAI(rawText) {
  const res = await fetch("http://localhost:5000/api/ai/parse-service", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rawText }),
  });

  const result = await res.json();

  if (!res.ok || result.success === false) {
    throw new Error(result.message || "Không thể phân tích nội dung bằng AI");
  }

  return result.data;
}