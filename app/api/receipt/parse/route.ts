import { jsonError, jsonOk, requireAuth } from "../../../lib/api-utils";
import { getErrorMessage } from "../../../lib/errors";
import { parseReceiptFile } from "../../../lib/receipt-parser";
import { isAllowedReceiptFile } from "../../../lib/receipt-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("A receipt file is required", 400);
    }

    if (!isAllowedReceiptFile(file)) {
      return jsonError("Only PDF, JPG, and PNG receipts are supported", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseReceiptFile(buffer, file.name, file.type);

    return jsonOk({ result, success: true });
  } catch (error) {
    const message = getErrorMessage(error, "Failed to parse receipt");
    const status = message.includes("not configured")
      ? 503
      : message.includes("OPENROUTER") ||
        message.includes("OpenRouter") ||
        message.includes("PDF")
      ? 503
      : 400;
    return jsonError(message, status);
  }
}
