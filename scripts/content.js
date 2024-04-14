chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "getStorageData") {
    var storageData;
    if (request.storageType === "localStorage") {
      storageData = { ...localStorage };
    } else if (request.storageType === "sessionStorage") {
      storageData = { ...sessionStorage };
    }
    sendResponse({ storageData: storageData });
  }
});
