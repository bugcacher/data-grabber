chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getLocalStorage") {
      // console.log("user ID" ,localStorage.getItem("user_id"))
      var localStorageData = {...localStorage}
      sendResponse({'localStorageData': localStorageData});
    }
  });
  