function CheckSpotContractJob() {
  var ret = CheckLastHourData(); 
  if (ret != undefined) {
    SetupLeverage();
    NotifyLatestData();
  }
}

function CheckAllRecords() {
  CheckSheetData();
}

function DownloadOrderHistory() {
  CheckOrdersData();
  SetupLeverage();
  SetupPrincipal();
}
