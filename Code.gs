const SOURCE_SHEET_ID = "1n6juQuCCmtZoZ_bxCGmwOHKjayiQK9lLMrar4Promss";
const SOURCE_SHEET_NAME = "Sheet1";
const DB_SHEET_ID = "17SUH6YUHFidAhbE74jCzPG2MW--owC-FNZqYh1SyHyI";
const DB_SHEET_NAME = "Sheet1";

// Menangani permintaan GET (Membaca Data)
function doGet(e) {
  const action = e.parameter.action;
  
  if (action == "read") {
    const data = getStudentData();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("API Aktif. Gunakan parameter ?action=read");
}

// Menangani permintaan POST (Menyimpan Data)
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    if (params.action == "save") {
      const result = saveData(params.data);
      return ContentService.createTextOutput(JSON.stringify({status: "success", message: result}))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (params.action == "reset") {
      const result = resetAllScores();
      return ContentService.createTextOutput(JSON.stringify({status: "success", message: result}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- FUNGSI LOGIKA (Sama seperti sebelumnya, sedikit disesuaikan) ---

function getStudentData() {
  const ssSource = SpreadsheetApp.openById(SOURCE_SHEET_ID);
  const sheetSource = ssSource.getSheetByName(SOURCE_SHEET_NAME);
  const lastRowSource = sheetSource.getLastRow();
  
  let sourceData = [];
  if (lastRowSource > 1) {
    sourceData = sheetSource.getRange(2, 2, lastRowSource - 1, 5).getValues();
  }

  const ssDB = SpreadsheetApp.openById(DB_SHEET_ID);
  const sheetDB = ssDB.getSheetByName(DB_SHEET_NAME);

  if (sheetDB.getLastRow() === 0) {
    sheetDB.appendRow(["Nama Siswa", "TP1", "TP2", "TP3", "TP4", "TP5", "LM1", "LM2", "LM3", "SAS"]);
  }
  
  const lastRowDB = sheetDB.getLastRow();
  let dbData = [];
  if (lastRowDB > 1) {
    dbData = sheetDB.getRange(2, 1, lastRowDB - 1, 10).getValues();
  }

  let dbMap = {};
  dbData.forEach(row => { dbMap[row[0]] = row; });

  let finalOutput = [];
  sourceData.forEach((rowSource) => {
    let nama = rowSource[0]; 
    let nis  = rowSource[1]; 
    let nisn = rowSource[2]; 
    let jk   = rowSource[3]; 
    let ttl  = rowSource[4]; 

    let gradeData = ["", "", "", "", "", "", "", "", ""];
    if (dbMap[nama]) {
      gradeData = dbMap[nama].slice(1);
    }
    finalOutput.push([nama, nis, nisn, ttl, jk, ...gradeData]);
  });
  
  return finalOutput;
}

function saveData(frontendData) {
  const ssDB = SpreadsheetApp.openById(DB_SHEET_ID);
  const sheetDB = ssDB.getSheetByName(DB_SHEET_NAME);
  
  // Format data untuk DB: Nama (idx 0) + Nilai (idx 5-13 dari frontend)
  let dbPayload = frontendData.map(row => {
    return [row[0], ...row.slice(5)]; 
  });

  let maxRows = sheetDB.getMaxRows();
  if (maxRows > 1) {
    sheetDB.getRange(2, 1, maxRows - 1, 10).clearContent();
  }
  
  if (dbPayload.length > 0) {
    sheetDB.getRange(2, 1, dbPayload.length, 10).setValues(dbPayload);
  }
  return "Data Berhasil Disimpan!";
}

function resetAllScores() {
  const ssDB = SpreadsheetApp.openById(DB_SHEET_ID);
  const sheetDB = ssDB.getSheetByName(DB_SHEET_NAME);
  const lastRow = sheetDB.getLastRow();
  if (lastRow > 1) {
    sheetDB.getRange(2, 2, lastRow - 1, 9).clearContent();
  }
  return "success";
}