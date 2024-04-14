chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == REQUEST_ACTION.GET_STORAGE_DATA) {
    var storageData;
    if (request.storageType === STORAGE_TYPE.LOCAL) {
      storageData = { ...localStorage };
    } else if (request.storageType === STORAGE_TYPE.SESSION) {
      storageData = { ...sessionStorage };
    }
    sendResponse({ storageData: storageData });
  }
});
