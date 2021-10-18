function SetupLeverage() {
  var result = GetAccount();

  var totalPositionSize = result['totalPositionSize'];
  var totalAccountValue = result['totalAccountValue'];

  var leverage = totalPositionSize / totalAccountValue;

  overviewSheet.getRange('C14').setValue(leverage.toFixed(2));
}

function SetupPrincipal() {
  var wh = GetWithdrawalsHistory();
  var dh = GetDepositsHistory();

  var principal = 0;
  for (var r of dh) {
    if (r.coin == 'USD' || r.coin == 'UDST') {
      principal = principal + r.size;
    }
  }

  for (var r of wh) {
    if (r.coin == 'USD' || r.coin == 'UDST') {
      principal = principal - r.size;
    }
  }

  overviewSheet.getRange('C7').setValue(principal.toFixed(2));
}

function CheckOrdersData() {
  //var startDate = new Date('2021-09-01');
  var endDate = new Date();

  var startTime = startDate.getTime() / 1000;
  var endTime = endDate.getTime() / 1000;

  var limitation = 5000;

  var records = {};

  while(true) {
    var results = GetOrderDetails(startTime, endTime, limitation);

    for (var r of results) {
      var id = r.id;
      records[id] = r;
      var d = new Date(r.time);
      var t = d.getTime() / 1000;
      endTime = Math.min(t, endTime);
    }

    if (results.length < limitation) {
      break;
    }
  }

  var sheetRowLength = orderSheet.getLastRow() - 1;

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
      return b - a;
    });

    if (sheetRowLength == 0) {
      var rowNumber = 2;
      for (var key of recordsKeys) {
        SetOrderSheetDataInRow(records[key], rowNumber++);
      }
    }
    else {
      var lastRecord = records[recordsKeys[recordsKeys.length - 1]];
      var rowNumber = FindRow(lastRecord);

      for (var j = recordsKeys.length - 1; j >= 0; --j) {
        if (InserOrderSheetData(records[recordsKeys[j]], rowNumber) == false) {
          rowNumber--;
          if (rowNumber < 1) break;
        }
      }
    }

  }
}

function InserOrderSheetData(r, rowNumber) {
  if (orderSheet.getRange(rowNumber, 1).getValue() == r.id) {
    Logger.log("資料已存在: " + r.id);
    return false;
  }

  Logger.log("插入資料: " + r.id);
  orderSheet.insertRowBefore(rowNumber+1);
  SetOrderSheetDataInRow(r, rowNumber+1);
  return true;
}

function SetOrderSheetDataInRow(r, rowNumber) {
  orderSheet.getRange(rowNumber, 1).setValue(r.id);
  orderSheet.getRange(rowNumber, 2).setValue(r.time);
  orderSheet.getRange(rowNumber, 3).setValue(r.market);
  orderSheet.getRange(rowNumber, 4).setValue(r.side);
  orderSheet.getRange(rowNumber, 5).setValue(r.orderType);
  orderSheet.getRange(rowNumber, 6).setValue(r.size);
  orderSheet.getRange(rowNumber, 7).setValue(r.price);
  orderSheet.getRange(rowNumber, 8).setValue(r.fee);
  orderSheet.getRange(rowNumber, 9).setValue(r.feeCurrency);
  orderSheet.getRange(rowNumber, 10).setValue(r.feeRate);
  orderSheet.getRange(rowNumber, 11).setFormula('=F' + rowNumber + '*G' + rowNumber);
}

function FindRow(r) {
  for (var i = 2; i <= orderSheet.getLastRow(); ++i) {
    if (orderSheet.getRange(i, 1).getValue() == r.id) {
      return i;
    }
  }
  
  return -1;
}
