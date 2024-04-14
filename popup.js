document.addEventListener("DOMContentLoaded", function () {
  var storageData = null;
  const dropdown = document.getElementById("keysDropdown");

  var currentSelectedValue = null;
  var currentStorageType = "localStorage"; // default to localStorage

  function updateDropdown() {
    dropdown.innerHTML = ""; // clear the dropdown
    const storageKeys = Object.keys(storageData);
    if (storageKeys.length === 0) {
      const optionElement = document.createElement("option");
      optionElement.text = "No data found";
      dropdown.add(optionElement);
    } else {
      // Add the options to the dropdown
      const defaultOptionElement = document.createElement("option");
      defaultOptionElement.text = "Select a key";
      dropdown.add(defaultOptionElement);
      storageKeys.forEach((key) => {
        const optionElement = document.createElement("option");
        optionElement.value = key;
        optionElement.text = key;
        dropdown.add(optionElement);
      });
    }
  }

  function updateStorageData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getStorageData", storageType: currentStorageType },
        function (response) {
          storageData = response.storageData;
          updateDropdown();
        }
      );
    });
  }

  updateStorageData();

  dropdown.addEventListener("change", function () {
    currentSelectedValue = dropdown.value;
    console.log(
      `Selected Value: ${currentSelectedValue}`,
      typeof storageData[currentSelectedValue],
      storageData[currentSelectedValue]
    );
    if (
      typeof storageData[currentSelectedValue] === "object" ||
      (typeof storageData[currentSelectedValue] === "string" &&
        isJsonified(storageData[currentSelectedValue]))
    ) {
      console.log("its an object");
    }
  });

  const localStorageRadio = document.getElementById("localStorageRadio");
  const sessionStorageRadio = document.getElementById("sessionStorageRadio");

  localStorageRadio.addEventListener("change", function () {
    currentStorageType = "localStorage";
    updateStorageData();
  });

  sessionStorageRadio.addEventListener("change", function () {
    currentStorageType = "sessionStorage";
    updateStorageData();
  });

  var grabValueButton = document.getElementById("grabValueButton");
  grabValueButton.addEventListener("click", function () {
    const showValueCheckbox = document.getElementById("showValueCheckbox");
    const copyToClipboardCheckbox = document.getElementById(
      "copyToClipboardCheckbox"
    );

    if (
      currentSelectedValue &&
      storageData &&
      storageData[currentSelectedValue]
    ) {
      const selectedValue = storageData[currentSelectedValue];
      if (showValueCheckbox.checked) {
        copyContent(selectedValue, true);
      }

      if (copyToClipboardCheckbox.checked) {
        copyContent(selectedValue);
      }
    }
  });

  function copyContent(text, showAlert = false) {
    try {
      text = text.toString();
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (showAlert) {
            alert(text);
          } else {
            let statusMsg = document.getElementById("statusMsg");
            statusMsg.innerHTML = "Copied to clipboard!";
            setTimeout(() => {
              statusMsg.innerHTML = "";
            }, 3000);
          }
        })
        .catch((err) => {
          alert(err);
        });
      console.log("Content copied to clipboard");
    } catch (err) {
      window.alert("Some error occurred!");
    }
  }
});

const isJsonified = (input) => {
  try {
    JSON.parse(input);
    return true;
  } catch (err) {
    return false;
  }
};
