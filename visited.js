const { PLACES_TAB, findRowIndex, updateCell } = require("../../lib/sheets");

const VISITED_COLUMN_LETTER = "F";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { id, visited } = JSON.parse(event.body);
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

    const rowIndex = await findRowIndex(PLACES_TAB, "A", id);
    if (rowIndex === -1) return { statusCode: 404, body: JSON.stringify({ error: "Place not found" }) };

    await updateCell(PLACES_TAB, `${VISITED_COLUMN_LETTER}${rowIndex}`, visited ? "TRUE" : "FALSE");
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
