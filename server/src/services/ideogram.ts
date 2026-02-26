import "dotenv/config";

const IDEOGRAM_API_URL = "https://api.ideogram.ai/v1/ideogram-v3/generate";

export async function generateQuestionImage(
  question: string,
  topic: string
): Promise<string> {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("IDEOGRAM_API_KEY is not set");
  }

  const topicDescriptions: Record<string, string> = {
    DAILY_LIFE: "daily life and modern culture in Jerusalem",
    HOLY_CITY: "holy sites and ancient architecture in Jerusalem",
    THREE_RELIGIONS: "the three religions coexisting in Jerusalem",
    WARS_HISTORY: "historical events and ancient battles in Jerusalem",
  };

  const topicDesc = topicDescriptions[topic] || "Jerusalem landmarks";

  const prompt = `A colorful children's book illustration about ${topicDesc}. Related to the question: "${question}". Style: friendly, educational, suitable for 9-10 year old children. Bright colors, simple shapes, warm and inviting atmosphere. No text in the image.`;

  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("rendering_speed", "TURBO");
  formData.append("aspect_ratio", "1x1");
  formData.append("style_preset", "CHILDRENS_BOOK");

  const response = await fetch(IDEOGRAM_API_URL, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ideogram API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    data?: { url?: string }[];
  };

  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL returned from Ideogram API");
  }

  return imageUrl;
}
