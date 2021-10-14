var uri = 'https://ftx.com'
var basepath = '/api'
var ss = SpreadsheetApp.getActiveSpreadsheet();
var configSeeht = ss.getSheetByName('Config');
var overviewSheet = ss.getSheetByName('Overview');
var sheet = ss.getSheetByName('Records');
var orderSheet = ss.getSheetByName('Orders');
var keys = {
  apikey: configSeeht.getRange('C3').getValue(),
  apisecret: configSeeht.getRange('C4').getValue()
}
var subaccount = configSeeht.getRange('C5').getValue();
var principalAmount = overviewSheet.getRange('C7').getValue();

var startDateStr = overviewSheet.getRange('E5').getValue();
var startHHStr = overviewSheet.getRange('G5').getValue();
var startMMStr = overviewSheet.getRange('H5').getValue();
var startDate = new Date(startDateStr);
startDate.setHours(startHHStr);
startDate.setMinutes(startMMStr);

var lineToken = configSeeht.getRange('C9').getValue();
var discordWebhook = configSeeht.getRange('C10').getValue();

var binance = {
  apikey: configSeeht.getRange('C14').getValue(),
  apisecret: configSeeht.getRange('C15').getValue()
}