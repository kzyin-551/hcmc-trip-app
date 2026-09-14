const { PLACES_TAB, PLACES_COLUMNS, PLANS_TAB, PLANS_COLUMNS, readTab } = require("../../lib/sheets");

exports.handler = async () => {
  try {
    const [places, plans] = await Promise.all([
      readTab(PLACES_TAB, PLACES_COLUMNS),
      readTab(PLANS_TAB, PLANS_COLUMNS)
    ]);
    return {
      statusCode: 200,
      headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
      body: JSON.stringify({ places, plans })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
