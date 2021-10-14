function SetupLeverage() {
  var result = GetAccount();

  var totalPositionSize = result['totalPositionSize'];
  var totalAccountValue = result['totalAccountValue'];

  var leverage = totalPositionSize / totalAccountValue;

  overviewSheet.getRange('C14').setValue(leverage.toFixed(2));
}

function CheckOrdersData() {
  //var startDate = new Date('2021-09-01');
  var endDate = new Date();

  var startTime = startDate.getTime() / 1000;
  var endTime = endDate.getTime() / 1000;

  var records = GetOrderDetails(startTime, endTime);
  var sheetRowLength = orderSheet.getLastRow() - 1;

  if (records.length === sheetRowLength) {
    Logger.log("沒有需要更新");
    return;
  }
  else {
      var rowNumber = 2;
      for (var r of records) {
        SetOrderSheetDataInRow(r, rowNumber++);
      }
  }
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
