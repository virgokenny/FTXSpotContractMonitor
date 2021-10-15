function CheckSpotContractJob() {
  var ret = CheckLastHourData(); 
  if (ret != undefined) {
    NotifyLatestData();
  }
}

function CheckAllRecords() {
  CheckSheetData();
}

function DownloadOrderHistory() {
  CheckOrdersData();
  SetupLeverage();
}