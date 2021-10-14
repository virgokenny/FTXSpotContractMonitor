function GetCurrentHourDateTime() {
  var now = new Date();
  var currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  Logger.log(currentHour.toLocaleDateString() + ' ' + currentHour.toLocaleTimeString());
  return currentHour;
}

function GetSpotContractDataInTime(start, end = undefined) {
  if (end == undefined) {
    end = start
  }
  var fpResults = GetFundingPayments(start, end);
  var bhResults = GetBorrowHistory(start, end);

  return HandleSpotContractData(fpResults, bhResults);
}

function CheckLastHourData() {
  var startDate = GetCurrentHourDateTime();
  var startTime = startDate.getTime() / 1000;
  var records = GetSpotContractDataInTime(startTime);
  // var fpResults = GetFundingPayments(undefined, undefined, 10);
  // var bhResults = GetBorrowHistory(undefined, undefined, 10);
  //var records = HandleSpotContractData(fpResults, bhResults);
  if (Object.keys(records).length == 0) {
    return undefined;
  }
  
  var recordsKeys = [];
  for (const [key, value] of Object.entries(records)) {
    recordsKeys.push( key );
  }

  recordsKeys.sort(function(a, b) {
    return new Date(b) - new Date(a);
  });

  var lastDateTime = new Date(recordsKeys[0]);
  var r = records[recordsKeys[0]];

  if (InsertSpotContractRecords(r['funding_payments'], r['borrow_history'], lastDateTime) == false) {
    return undefined;
  }

  return lastDateTime;
}

// Query The Data We Need From FTX Server
function CheckSheetData() {
  if (sheet.getLastRow() == 1) {
    InitSheetData();
    return;
  }

  var lastDataDateTime = CheckLastHourData();
  if (lastDataDateTime == undefined) {
    Logger.log("抓不到最後一筆資料");
    return;
  }

  var lastRowNumber = sheet.getLastRow();
  var lastRowDateTimeStr = sheet.getRange(lastRowNumber, 1).getValue();
  var latestRowDateTimeStr = sheet.getRange(2, 1).getValue();
  var lastRowDateTime = new Date(lastRowDateTimeStr);
  var latestRowDateTime = new Date(latestRowDateTimeStr);
  var diffTime =  lastDataDateTime - lastRowDateTime;
  var insertRowCount = lastRowNumber - 1;
  var totalHours = diffTime / 3600000 + 1;
  if (insertRowCount == totalHours) {
    Logger.log("已不需要更新");
    return;
  }

  // Only need to insert last hour data
  if ((lastDataDateTime - latestRowDateTime) / 3600000 == 1 
    & insertRowCount == (totalHours - 1)) {
    return;
  }

  // Check all data
  var checkDate = lastRowDateTime;
  for (var rowIndex = sheet.getLastRow(); rowIndex >= 2; rowIndex--) {
    var targetDate = new Date(sheet.getRange(rowIndex, 1).getValue());
    while ((targetDate.getTime() !== checkDate.getTime())) {
      Logger.log(checkDate);

      var time = checkDate.getTime() / 1000;
      var records = GetSpotContractDataInTime(time);
      
      var r = records[checkDate.toISOString()];
      Logger.log("資料遺失，進行補齊");
      InsertSpotContractRecords(r['funding_payments'], r['borrow_history'], checkDate, rowIndex);
      checkDate.setTime(checkDate.getTime() + 3600000);
    }
    checkDate.setTime(checkDate.getTime() + 3600000);
  }
}

// Query All Data From FTX Server
function CheckAllSheetData() {
  //var startDate = new Date('2021-09-01');
  var endDate = GetCurrentHourDateTime();

  var startTime = startDate.getTime() / 1000;
  var endTime = endDate.getTime() / 1000;

  var records = GetSpotContractDataInTime(startTime, endTime);

  var recordsKeys = [];
  for (const [key, value] of Object.entries(records)) {
    recordsKeys.push( key );
  }

  recordsKeys.sort(function(a, b) {
    return new Date(b) - new Date(a);
  });

  Logger.log("重新更新所有資料");
  var rowNumber = 1;
  for (var k of recordsKeys) {
    var r = records[k];
    InsertSpotContractRecords(r['funding_payments'], r['borrow_history'], (new Date(k)), rowNumber);
    rowNumber++;
  }
}

function InitSheetData() {
  //var startDate = new Date('2021-09-01');
  var endDate = GetCurrentHourDateTime();

  var startTime = startDate.getTime() / 1000;
  var endTime = endDate.getTime() / 1000;

  var records = GetSpotContractDataInTime(startTime, endTime);
  var sheetRowLength = sheet.getLastRow() - 1;

  if (Object.keys(records).length === sheetRowLength) {
    Logger.log("沒有需要更新");
    return;
  }
  else {
    var recordsKeys = [];
    for (const [key, value] of Object.entries(records)) {
      recordsKeys.push( key );
    }

    recordsKeys.sort(function(a, b) {
      return new Date(b) - new Date(a);
    });

    if (sheetRowLength <= 0) {
      Logger.log("第一次更新資料");

      var rowNumber = 2;
      for (var k of recordsKeys) {
        var r = records[k];
        SetSheetDataInRow(r['funding_payments'], r['borrow_history'], (new Date(k)), rowNumber++);
      }
    }
  }
}

function SetSheetDataInRow(fp, bh, d, rowNumber) {
  var datetimeStr = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.toLocaleTimeString();
  Logger.log("新增一筆資料 " + datetimeStr + " 到第" + rowNumber + "列");
  sheet.getRange(rowNumber, 1).setValue(datetimeStr);
  if (fp != undefined) {
    for (var idx = 0; idx < fp.length; ++idx) {
      var rowIdx = rowNumber + idx;
      if (idx >= 1) {
        sheet.insertRowAfter(rowIdx-1);
        sheet.getRange(rowIdx, 1).setValue(datetimeStr);
      }
      sheet.getRange(rowIdx, 2).setValue(fp[idx]['future']);
      sheet.getRange(rowIdx, 3).setValue(fp[idx]['payment']);
      sheet.getRange(rowIdx, 3).setNumberFormat('0.000000');
      sheet.getRange(rowIdx, 4).setValue(fp[idx]['rate']);
      sheet.getRange(rowIdx, 4).setNumberFormat('0.00000%');
    }
  }
  sheet.getRange(rowNumber, 5).setValue(datetimeStr);
  if (bh != undefined) {
    sheet.getRange(rowNumber, 6).setValue(bh['coin']);
    sheet.getRange(rowNumber, 7).setValue(bh['size']);
    sheet.getRange(rowNumber, 7).setNumberFormat('0.000000');
    sheet.getRange(rowNumber, 8).setValue(bh['rate']);
    sheet.getRange(rowNumber, 8).setNumberFormat('0.00000%');
    sheet.getRange(rowNumber, 9).setValue(bh['cost']);
    sheet.getRange(rowNumber, 9).setNumberFormat('0.000000');
  }
  sheet.getRange(rowNumber, 10).setFormula('=-(C' + (rowNumber) +'+I' + (rowNumber) +')');
  sheet.getRange(rowNumber, 10).setFontColor(sheet.getRange(rowNumber, 10).getValue() < 0 ? 'red' : 'green');
  sheet.getRange(rowNumber, 11).setFormula("=(J"+(rowNumber)+"/M"+(rowNumber)+")*24*365");
  sheet.getRange(rowNumber, 11).setNumberFormat('0.00000%');
  sheet.getRange(rowNumber, 12).setFormula('=SUM(J'+(rowNumber)+':J)-Overview!$C$9');
  sheet.getRange(rowNumber, 12).setNumberFormat('0.000000');

  sheet.getRange(rowNumber, 13).setValue(principalAmount);
}

// Insert Row After Row Index
function InsertSpotContractRecords(fp, bh, d, rowIndex = 1) {
  var datetimeStr = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.toLocaleTimeString();
  var insertRowNo = rowIndex+1;
  Logger.log("插入一筆資料 " + datetimeStr + " 到第" + insertRowNo + "列");

  var lastDatetimeStr = sheet.getRange(insertRowNo, 1).getValue();
  var lastD = new Date(lastDatetimeStr);
  if (lastD.toString() == d.toString()) {
    Logger.log(datetimeStr + ' 這一筆已經記錄過');
    return false;
  }
  sheet.insertRowAfter(rowIndex);
  SetSheetDataInRow(fp, bh, d, insertRowNo);

  return true;
}

function HandleBorrowData(b1, b2) {
  if (b1 == undefined) {
    return b2;
  }

  var coinList = b1.coin.split(',');
  var coin = b1.coin;
  if (!coinList.includes(b2.coin)) {
    coin = coin + ',' + b2.coin;
  }
  var size = b1.size + b2.size;
  var rate = (b1.rate + b2.rate)/2;
  var cost = b1.cost + b2.cost;

  return {
    'coin': coin,
    'size': size,
    'rate': rate,
    'cost': cost
  };
}

function HandleSpotContractData(fpResults, bhResults) {
  var records = {};

  for (var fp of fpResults) {
    var timeKey = (new Date(fp['time'])).toISOString();
    if (records[timeKey] == undefined) {
      records[timeKey] = {};
    }
    if (records[timeKey]['funding_payments'] == undefined) {
      records[timeKey]['funding_payments'] = [];
    }
    records[timeKey]['funding_payments'].push(fp);
  }

  for (var bh of bhResults) {
    var timeKey = (new Date(bh['time'])).toISOString();
    if (records[timeKey] == undefined) {
      records[timeKey] = {};
    }
    records[timeKey]['borrow_history'] = HandleBorrowData(records[timeKey]['borrow_history'], bh);
  }
  return records;
}
