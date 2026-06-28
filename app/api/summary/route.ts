import { jsonError, jsonOk } from "../../lib/api-utils";
import { getErrorMessage } from "../../lib/errors";
import { listSummaries } from "../../lib/grocery-service";

export async function GET() {
  try {
    const summaries = await listSummaries();
    return jsonOk({ summaries });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load summaries"), 500);
  }
}
