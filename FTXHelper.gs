function GetAccount() {
  var ts = String(Date.now());
  var method = 'GET';
  var command = basepath + "/account";

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

var FakeBHData = [
  {'coin': "USDT", 'time': "2021-10-14T08:00:00+00:00", 'size': 5.427, 'rate': 1.024817375e-05, 'cost': 5.56246923218e-05},
  {'coin': "USD", 'time': "2021-10-14T08:00:00+00:00", 'size': 10.427, 'rate': 1.000817375e-05, 'cost': 10.56246923218e-05},
];

function GetBorrowHistory(startTime = undefined, endTime = undefined, limit = 0) {
  var ts = String(Date.now());

  var method = 'GET';
  var command = basepath + "/spot_margin/borrow_history";

  if (startTime != undefined && endTime != undefined) {
    command = command + '?start_time=' + startTime + "&end_time=" + endTime;
  }
  else if (limit > 0) {
    command = command + '?limit=' + limit;
  }

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
  //return FakeBHData;
}

function GetOrderDetails(startTime = undefined, endTime = undefined, limit = 0) {
  var ts = String(Date.now());
  var method = 'GET';
  var command = basepath + "/fills?include_order_details=1";

  if (startTime != undefined && endTime != undefined) {
    command = command + '&start_time=' + startTime + "&end_time=" + endTime;
  }
  else if (limit > 0) {
    command = command + '&limit=' + limit;
  }

  var sign = toHexString(Utilities.computeHmacSha256Signature(ts + method + command, keys.apisecret));
  function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }
  var header = {
    'FTX-KEY' : keys.apikey,
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

function GetFundingPayments(startTime = undefined, endTime = undefined, limit = 0) {
  var ts = String(Date.now());
  var method = 'GET';
  var command = basepath + "/funding_payments";

  if (startTime != undefined && endTime != undefined) {
      command = command + '?start_time=' + startTime + "&end_time=" + endTime;
  }
  else if (limit > 0) {
    command = command + '?limit=' + limit;
  }

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