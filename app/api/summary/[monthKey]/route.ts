import { jsonError, jsonOk } from "../../../lib/api-utils";
import { getErrorMessage } from "../../../lib/errors";
import { getMonthSummary } from "../../../lib/grocery-service";

type RouteContext = { params: Promise<{ monthKey: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { monthKey } = await context.params;
    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return jsonError("Invalid month key. Use YYYY-MM.", 400);
    }

    const summary = await getMonthSummary(monthKey);
    if (!summary) return jsonError("No data for this month", 404);
    return jsonOk({ summary });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load summary"), 500);
  }
}
