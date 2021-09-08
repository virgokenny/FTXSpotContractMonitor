function GetCurrentDateTimeUTCIsoString() {
  var now = new Date();
  var currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  Logger.log(currentHour.toLocaleDateString() + ' ' + currentHour.toLocaleTimeString());
  return currentHour.toISOString();
}

function WriteSpotContractRecords(fp, bh, d) {
  var datetimeStr = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.toLocaleTimeString();

  var lastDatetimeStr = sheet.getRange(2, 1).getValue();
  var lastD = new Date(lastDatetimeStr);
  if (lastD.toString() == d.toString()) {
    Logger.log(datetimeStr + ' 這一筆已經記錄過');
    return;
  }

  sheet.insertRowAfter(1);
  sheet.getRange(2, 1).setValue(datetimeStr);
  sheet.getRange(2, 2).setValue(fp['future']);
  sheet.getRange(2, 3).setValue(fp['payment']);
  sheet.getRange(2, 3).setNumberFormat('0.000000');
  sheet.getRange(2, 4).setValue(fp['rate']);
  sheet.getRange(2, 4).setNumberFormat('0.00000%');
  sheet.getRange(2, 5).setValue(datetimeStr);
  sheet.getRange(2, 6).setValue(bh['coin']);
  sheet.getRange(2, 7).setValue(bh['size']);
  sheet.getRange(2, 7).setNumberFormat('0.000000');
  sheet.getRange(2, 8).setValue(bh['rate']);
  sheet.getRange(2, 8).setNumberFormat('0.00000%');
  sheet.getRange(2, 9).setValue(bh['cost']);
  sheet.getRange(2, 9).setNumberFormat('0.000000');
  sheet.getRange(2, 10).setFormula('=-(C2+I2)');
  sheet.getRange(2, 10).setFontColor(sheet.getRange(2, 10).getValue() < 0 ? 'red' : 'green');
  sheet.getRange(2, 11).setFormula("=(J2/Overview!$C$7)*24*365");
  sheet.getRange(2, 11).setNumberFormat('0.00000%');
  sheet.getRange(2, 12).setFormula('=SUM(J2:J)-Overview!$C$9');
  sheet.getRange(2, 12).setNumberFormat('0.000000');
}

function CheckSpotContractJob() {
  var currTime = GetCurrentDateTimeUTCIsoString();

  var fpResults = GetFundingPayments();
  var bhResults = GetBorrowHistory();

  var fp = undefined;
  var bh = undefined;

  for (var r of fpResults) {
    var time = new Date(r['time']);
    if (time.toISOString() === currTime) {
      fp = r;
      break;
    }
  }

  for (var r of bhResults) {
    if (time.toISOString() === currTime) {
      bh = r;
      break;
    }
  }

  if (fp === undefined || bh === undefined)
    return;

  var d = new Date(fp['time']);

  WriteSpotContractRecords(fp, bh, d);
}

function InitSpotContractRecords() {
  var fpResults = GetFundingPayments();
  var bhResults = GetBorrowHistory();

  for (var index = fpResults.length-1; index >= 0; index--) {
    var fp = fpResults[index];
    var fpTime = new Date(fp['time']);
    for (var bh of bhResults) {
      var bhTime = new Date(bh['time']);
      if (fpTime.toISOString() === bhTime.toISOString()) {
        var d = new Date(fp['time']);
        WriteSpotContractRecords(fp, bh, d);
        break;
      }
    }
  }
}

function GetBorrowHistory() {
  var ts = String(Date.now());
  var method = 'GET';
  var command = basepath + "/spot_margin/borrow_history";

  var sign = toHexString(Utilities.computeHmacSha256Signature(ts + method + command, keys['apisecret']));
  function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }
  var header = {
    'FTX-KEY' : keys['apikey'],
    'FTX-TS' : ts,
    'FTX-SIGN' : sign
  };

  if (subaccount != '') {
    header['FTX-SUBACCOUNT'] = encodeURI(subaccount);
  }

  var options = {
    'method' : method,
    'headers' : header
  };
  
  var result = JSON.parse(UrlFetchApp.fetch(uri + command, options)).result;

  return result;
}

function GetPositions() {
  var ts = String(Date.now());
  var method = 'GET';
  var command = basepath + "/positions";

  var sign = toHexString(Utilities.computeHmacSha256Signature(ts + method + command, keys['apisecret']));
  function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }
  var header = {
    'FTX-KEY' : keys['apikey'],
    'FTX-TS' : ts,
    'FTX-SIGN' : sign
  };

  if (subaccount != '') {
    header['FTX-SUBACCOUNT'] = encodeURI(subaccount);
  }

  var options = {
    'method' : method,
    'headers' : header
  };
  
  var result = JSON.parse(UrlFetchApp.fetch(uri + command, options)).result;

  return result;
}

function GetFundingPayments() {
  var ts = String(Date.now());
  var method = 'GET';
  var command = basepath + "/funding_payments";

  var sign = toHexString(Utilities.computeHmacSha256Signature(ts + method + command, keys['apisecret']));
  function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }
  var header = {
    'FTX-KEY' : keys['apikey'],
    'FTX-TS' : ts,
    'FTX-SIGN' : sign
  };

  if (subaccount != '') {
    header['FTX-SUBACCOUNT'] = encodeURI(subaccount);
  }

  var options = {
    'method' : method,
    'headers' : header
  };
  
  var result = JSON.parse(UrlFetchApp.fetch(uri + command, options)).result;

  return result;
}

