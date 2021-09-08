var uri = 'https://ftx.com'
var basepath = '/api'
var ss = SpreadsheetApp.getActiveSpreadsheet();
var configSeeht = ss.getSheetByName('Config');
var sheet = ss.getSheetByName('Records');
var keys = {
  apikey: configSeeht.getRange('C3').getValue(),
  apisecret: configSeeht.getRange('C4').getValue()
}
var subaccount = configSeeht.getRange('C5').getValue();