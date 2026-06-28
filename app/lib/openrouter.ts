import { getOpenRouterConfig } from "./env";

type OpenRouterTextPart = { type: "text"; text: string };
type OpenRouterImagePart = {
  type: "image_url";
  image_url: { url: string };
};

type OpenRouterMessage = {
  role: "system" | "user";
  content: string | Array<OpenRouterTextPart | OpenRouterImagePart>;
};

interface OpenRouterResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
}

const RECEIPT_USER_PROMPT =
  "Extract grocery items from this receipt. For each item, use the final line total amount after all per-line calculations on the receipt (not unit price or pre-discount MRP unless that is the only amount shown).";

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

async function callOpenRouter(messages: OpenRouterMessage[]): Promise<unknown> {
  const config = getOpenRouterConfig();

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": config.appUrl,
      "X-Title": config.appTitle,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      response_format: { type: "json_object" },
      temperature: config.temperature,
    }),
  });

  const data = (await response.json()) as OpenRouterResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenRouter request failed");
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  try {
    return extractJson(content);
  } catch {
    throw new Error("Failed to parse OpenRouter response as JSON");
  }
}

function systemMessage(): OpenRouterMessage {
  return { role: "system", content: getOpenRouterConfig().systemPrompt };
}

export async function extractReceiptFromText(
  receiptText: string
): Promise<unknown> {
  return callOpenRouter([
    systemMessage(),
    {
      role: "user",
      content: `${RECEIPT_USER_PROMPT}\n\n${receiptText}`,
    },
  ]);
}

export async function extractReceiptFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<unknown> {
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return callOpenRouter([
    systemMessage(),
    {
      role: "user",
      content: [
        { type: "text", text: RECEIPT_USER_PROMPT },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ]);
}
