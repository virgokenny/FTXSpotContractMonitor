function GetRowData(rowNumber) {
  return {
    time: sheet.getRange(rowNumber, 1).getValue(),
    future: sheet.getRange(rowNumber, 2).getValue(),
    futureGetPaid: sheet.getRange(rowNumber, 3).getValue(),
    futurePaymentRate: sheet.getRange(rowNumber, 4).getValue(),
    lendingCoin: sheet.getRange(rowNumber, 6).getValue(),
    lendingSize: sheet.getRange(rowNumber, 7).getValue(),
    lendingCostRate: sheet.getRange(rowNumber, 8).getValue(),
    lendingCost: sheet.getRange(rowNumber, 9).getValue(),
    revenue: sheet.getRange(rowNumber, 10).getValue(),
    yearlyEarn: sheet.getRange(rowNumber, 11).getValue(),
    margin: sheet.getRange(rowNumber, 12).getValue(),
    principalAmount: sheet.getRange(rowNumber, 13).getValue()
  };
}

function GetUpDownString(r1, r2) {
  return r1 == r2 ? '● ' : r1 > r2 ? '▲ ' : '▼ ';
}

function GetPercentage(number, decimal) {
  var a = number * 100;
  var b = a.toFixed(decimal);
  return b;
}

function NotifyLatestData() {
  Logger.log("通知");

  var message = '';

  if (sheet.getLastRow() == 1) {
    return;
  }

  var r2 = GetRowData(2);

  var avgYearEarn = overviewSheet.getRange('C12').getValue();
  var totalHours = overviewSheet.getRange('C13').getValue();

  if (sheet.getLastRow() == 2) {
    message = 
      '\n'
      + '\n時間: ' + r2.time
      + '\n合約: ' + r2.future
      + '\n資金費: ' + r2.futureGetPaid
      + '\n資金費率: ' + GetPercentage(r2.futurePaymentRate, 4) + '%'
      + '\n借貸幣種: ' + r2.lendingCoin
      + '\n借貸金額: ' + r2.lendingSize
      + '\n借貸利率: ' + GetPercentage(r2.lendingCostRate, 4) + '%'
      + '\n付款金額: ' + r2.lendingCost
      + '\n利潤: ' + r2.revenue
      + '\n年化: ' + GetPercentage(r2.yearlyEarn, 2) + '%'
      + '\n平均年化: ' + GetPercentage(avgYearEarn, 2) + '%'
      + '\n經歷小時: ' + totalHours
      + '\n累積淨利: ' + r2.margin
      + '\n投入金額: ' + r2.principalAmount
      + '\n'
      ;
  }
  else {
    var r3 = GetRowData(3);

    message = 
      '\n'
      + '\n時間: ' + r2.time
      + '\n合約: ' + r2.future
      + '\n資金費: ' + GetUpDownString(-r2.futureGetPaid, -r3.futureGetPaid) + r2.futureGetPaid
      + '\n資金費率: ' + GetUpDownString(r2.futurePaymentRate, r3.futurePaymentRate) + GetPercentage(r2.futurePaymentRate, 4) + '%'
      + '\n借貸幣種: ' + r2.lendingCoin
      + '\n借貸金額: ' + r2.lendingSize
      + '\n借貸利率: ' + GetUpDownString(r2.lendingCostRate, r3.lendingCostRate) + GetPercentage(r2.lendingCostRate, 4) + '%'
      + '\n付款金額: ' + r2.lendingCost
      + '\n利潤: ' + GetUpDownString(r2.revenue, r3.revenue) + r2.revenue
      + '\n年化: ' + GetUpDownString(r2.yearlyEarn, r3.yearlyEarn) + GetPercentage(r2.yearlyEarn, 2) + '%'
      + '\n平均年化: ' + GetPercentage(avgYearEarn, 2) + '%'
      + '\n經歷小時: ' + totalHours
      + '\n累積淨利: ' + GetUpDownString(r2.margin, r3.margin) + r2.margin
      + '\n投入金額: ' + r2.principalAmount
      + '\n'
      ;
  }
  
  if (lineToken != '')
    LineNotify(message);

  if (discordWebhook != '')
    DiscordNotify(message);
}

function LineNotify(message) {
  var options = {
    'method'  : 'post',
    'payload' : {'message' : message},
    'headers' : {'Authorization' : 'Bearer ' + lineToken}
    };      
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify',options);
}

function DiscordNotify(message) {
  var options = {
    'method'  : 'post',
    'payload' : JSON.stringify({'content': message}),
    'headers' : {'Content-Type' : 'application/json'}
  };

  UrlFetchApp.fetch(discordWebhook, options);
}
