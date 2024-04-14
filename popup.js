const ElementVisibility = {
  VISIBLE: "block",
  HIDDEN: "none",
};

const DEFAULT_DROPDOWN_OPTION_VALUE = "Select a key";
const DROPDOWN_OPTION_NO_DATA_VALUE = "No data found";
const DEFAULT_INNER_DROPDOWN_OPTION_VALUE = "Select field (optional)";

document.addEventListener("DOMContentLoaded", function () {
  var storageData = null;
  const dropdown = document.getElementById("keysDropdown");
  const innerKeysDropdown = document.getElementById("innerKeysDropdown");

  var currentSelectedValue = null;
  var innerField = null;
  var currentStorageType = "localStorage"; // default to localStorage

  function updateDropdown() {
    dropdown.innerHTML = ""; // clear the dropdown
    const storageKeys = Object.keys(storageData);
    if (storageKeys.length === 0) {
      const optionElement = document.createElement("option");
      optionElement.text = DROPDOWN_OPTION_NO_DATA_VALUE;
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

  function updateInnerKeysDropdown() {
    innerKeysDropdown.innerHTML = ""; // clear the dropdown
    const innerFields = Object.keys(
      JSON.parse(storageData[currentSelectedValue])
    );
    if (innerFields.length === 0) {
      const optionElement = document.createElement("option");
      optionElement.text = "No fields found";
      innerKeysDropdown.add(optionElement);
    } else {
      // Add the options to the dropdown
      const defaultOptionElement = document.createElement("option");
      defaultOptionElement.text = DEFAULT_INNER_DROPDOWN_OPTION_VALUE;
      defaultOptionElement.value = DEFAULT_INNER_DROPDOWN_OPTION_VALUE;
      innerKeysDropdown.add(defaultOptionElement);
      innerFields.forEach((key) => {
        const optionElement = document.createElement("option");
        optionElement.value = key;
        optionElement.text = key;
        innerKeysDropdown.add(optionElement);
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
    innerField = null;
    currentSelectedValue = dropdown.value;
    if (isObjectField(storageData[currentSelectedValue])) {
      setInnerKeysDropdownVisibility(ElementVisibility.VISIBLE);
      updateInnerKeysDropdown();
    } else {
      setInnerKeysDropdownVisibility(ElementVisibility.HIDDEN);
    }
  });

  innerKeysDropdown.addEventListener("change", function () {
    innerField = innerKeysDropdown.value;
    console.log(`Selected inner Value: ${innerField}`);
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
      var selectedValue = storageData[currentSelectedValue];
      console.log(
        currentSelectedValue,
        selectedValue,
        innerField,
        typeof innerField
      );
      // if (innerField && innerField !== "null") {
      if (innerField && innerField !== DEFAULT_INNER_DROPDOWN_OPTION_VALUE) {
        selectedValue = JSON.parse(selectedValue)[innerField];
      }
      console.log("final", currentSelectedValue, selectedValue, innerField);
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

  const setInnerKeysDropdownVisibility = (visibility) => {
    const elem = document.getElementById("innerKeysDropdown");
    elem.style.display = visibility;
  };
});

const isNumber = (input) => {
  typeof input !== "object" &&
    !Number.isNaN(
      +String(
        (String(input) || "").replace(/[^0-9\.\-e]/, "") !== String(input) ||
          input === ""
          ? NaN
          : input
      )
    );
};

const isObjectField = (data) => {
  return isJsonified(data) && typeof JSON.parse(data) === "object";
};

const isJsonified = (data) => {
  try {
    JSON.parse(data);
    return true;
  } catch (err) {
    return false;
  }
};
