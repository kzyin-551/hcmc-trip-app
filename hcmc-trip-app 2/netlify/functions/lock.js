const {
  PLANS_TAB, PLANS_COLUMNS,
  readTab, updateCell, appendRow
} = require("../../lib/sheets");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { day, meal, place_id, locked } = JSON.parse(event.body);
    if (!day || !meal) return { statusCode: 400, body: JSON.stringify({ error: "Missing day or meal" }) };

    const allPlans = await readTab(PLANS_TAB, PLANS_COLUMNS);
    const existingIndex = allPlans.findIndex(
      (p) => String(p.day) === String(day) && p.meal === meal
    );

    if (existingIndex === -1) {
      await appendRow(PLANS_TAB, PLANS_COLUMNS, {
        day, meal, place_id: place_id || "", locked: locked ? "TRUE" : "FALSE"
      });
    } else {
      const rowNum = existingIndex + 2;
      await updateCell(PLANS_TAB, `C${rowNum}`, place_id || "");
      await updateCell(PLANS_TAB, `D${rowNum}`, locked ? "TRUE" : "FALSE");
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
