/**
 * Paste this into Extensions > Apps Script from inside your Google Sheet.
 * It runs bound to that Sheet, so it needs no credentials of its own.
 *
 * Expects two tabs: "Places" and "DayPlans" with the same columns as before.
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var places = sheetToObjects(ss.getSheetByName("Places"));
  var plans = sheetToObjects(ss.getSheetByName("DayPlans"));
  return jsonOutput({ places: places, plans: plans });
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (body.action === "visited") {
    setVisited(ss, body.id, body.visited);
  } else if (body.action === "lock") {
    setLock(ss, body.day, body.meal, body.place_id, body.locked);
  } else {
    return jsonOutput({ error: "Unknown action" });
  }
  return jsonOutput({ ok: true });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  return data.slice(1)
    .filter(function (row) { return row[0] !== ""; })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
}

function setVisited(ss, id, visited) {
  var sheet = ss.getSheetByName("Places");
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var visitedCol = headers.indexOf("visited") + 1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, visitedCol).setValue(visited ? "TRUE" : "FALSE");
      return;
    }
  }
}

function setLock(ss, day, meal, placeId, locked) {
  var sheet = ss.getSheetByName("DayPlans");
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var dayCol = headers.indexOf("day");
  var mealCol = headers.indexOf("meal");
  var placeCol = headers.indexOf("place_id");
  var lockedCol = headers.indexOf("locked");

  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][dayCol]) === String(day) && data[i][mealCol] === meal) {
      foundRow = i;
      break;
    }
  }

  if (foundRow === -1) {
    sheet.appendRow([day, meal, placeId || "", locked ? "TRUE" : "FALSE"]);
  } else {
    sheet.getRange(foundRow + 1, placeCol + 1).setValue(placeId || "");
    sheet.getRange(foundRow + 1, lockedCol + 1).setValue(locked ? "TRUE" : "FALSE");
  }
}
