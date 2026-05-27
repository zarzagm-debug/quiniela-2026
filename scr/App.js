const SHEET_ID = "1-8MpIN_ulBjzBi5NjEqXxqadjEHml_3kc4oINl-LIhU";

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  const action = e.parameter.action;
  
  let result;
  if (action === "get") {
    const val = sheet.getRange("B1").getValue();
    result = val || "{}";
  } else if (action === "set") {
    sheet.getRange("B1").setValue(e.parameter.data);
    result = '{"ok":true}';
  }
  
  return ContentService
    .createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON);
}
