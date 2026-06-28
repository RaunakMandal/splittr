import { jsonError, jsonOk } from "../../lib/api-utils";
import { getErrorMessage } from "../../lib/errors";
import { listCategories } from "../../lib/grocery-service";

export async function GET() {
  try {
    const categories = await listCategories();
    return jsonOk({ categories });
  } catch (error) {
    return jsonError(getErrorMessage(error, "Failed to load categories"), 500);
  }
}
