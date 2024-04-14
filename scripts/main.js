document.addEventListener("DOMContentLoaded", function () {
  const PRIMARY_FIELD_DROPDOWN_DEFAULT_VALUE = "Select a key";
  const PRIMARY_FIELD_DROPDOWN_NO_DATA_VALUE = "No data found";
  const SECONDARY_FIELD_DROPDOWN_DEFAULT_VALUE = "Select field (optional)";
  const SECONDARY_FIELD_DROPDOWN_NO_DATA_VALUE = "No fields found";

  var storageData = null;
  var primaryFieldKey = null;
  var secondaryFieldKey = null;
  var currentStorageType = STORAGE_TYPE.LOCAL; // default to localStorage

  const primaryFieldsDropdown = document.getElementById("primaryKeysDropdown");
  const secondaryFieldsDropdown = document.getElementById(
    "secondaryKeysDropdown"
  );
  const localStorageRadio = document.getElementById("localStorageRadio");
  const sessionStorageRadio = document.getElementById("sessionStorageRadio");
  const grabValueButton = document.getElementById("grabValueButton");

  // updateStorageData();

  // Event listeners

  primaryFieldsDropdown.addEventListener("change", function () {
    secondaryFieldKey = null;
    primaryFieldKey = primaryFieldsDropdown.value;
    if (isObjectField(storageData[primaryFieldKey])) {
      setSecondaryKeysDropdownVisibility(Element_Visibility.VISIBLE);
      updateSecondaryKeysDropdown();
    } else {
      setSecondaryKeysDropdownVisibility(Element_Visibility.HIDDEN);
    }
  });

  secondaryFieldsDropdown.addEventListener("change", function () {
    secondaryFieldKey = secondaryFieldsDropdown.value;
  });

  localStorageRadio.addEventListener("change", function () {
    currentStorageType = STORAGE_TYPE.LOCAL;
    updateStorageData();
  });

  sessionStorageRadio.addEventListener("change", function () {
    currentStorageType = STORAGE_TYPE.SESSION;
    updateStorageData();
  });

  grabValueButton.addEventListener("click", function () {
    const showValueCheckbox = document.getElementById("showValueCheckbox");
    const copyToClipboardCheckbox = document.getElementById(
      "copyToClipboardCheckbox"
    );
    if (primaryFieldKey && storageData && storageData[primaryFieldKey]) {
      var selectedValue = storageData[primaryFieldKey];
      if (
        secondaryFieldKey &&
        secondaryFieldKey !== SECONDARY_FIELD_DROPDOWN_DEFAULT_VALUE
      ) {
        selectedValue = JSON.parse(selectedValue)[secondaryFieldKey];
      }
      if (copyToClipboardCheckbox.checked) {
        copyContent(selectedValue, showValueCheckbox.checked);
      }
    }
  });

  // Utility functions

  const updatePrimaryKeysDropdown = () => {
    primaryFieldsDropdown.innerHTML = ""; // clear the dropdown
    const storageKeys = Object.keys(storageData);
    if (storageKeys.length === 0) {
      const optionElement = document.createElement("option");
      optionElement.text = PRIMARY_FIELD_DROPDOWN_NO_DATA_VALUE;
      primaryFieldsDropdown.add(optionElement);
    } else {
      // Add the options to the dropdown
      const defaultOptionElement = document.createElement("option");
      defaultOptionElement.text = PRIMARY_FIELD_DROPDOWN_DEFAULT_VALUE;
      primaryFieldsDropdown.add(defaultOptionElement);
      storageKeys.forEach((key) => {
        const optionElement = document.createElement("option");
        optionElement.value = key;
        optionElement.text = key;
        primaryFieldsDropdown.add(optionElement);
      });
    }
  };

  const updateSecondaryKeysDropdown = () => {
    secondaryFieldsDropdown.innerHTML = ""; // clear the dropdown
    const innerFields = Object.keys(JSON.parse(storageData[primaryFieldKey]));
    if (innerFields.length === 0) {
      const optionElement = document.createElement("option");
      optionElement.text = SECONDARY_FIELD_DROPDOWN_NO_DATA_VALUE;
      secondaryFieldsDropdown.add(optionElement);
    } else {
      // Add the options to the dropdown
      const defaultOptionElement = document.createElement("option");
      defaultOptionElement.text = SECONDARY_FIELD_DROPDOWN_DEFAULT_VALUE;
      defaultOptionElement.value = SECONDARY_FIELD_DROPDOWN_DEFAULT_VALUE;
      secondaryFieldsDropdown.add(defaultOptionElement);
      innerFields.forEach((key) => {
        const optionElement = document.createElement("option");
        optionElement.value = key;
        optionElement.text = key;
        secondaryFieldsDropdown.add(optionElement);
      });
    }
  };

  const updateStorageData = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: REQUEST_ACTION.GET_STORAGE_DATA,
          storageType: currentStorageType,
        },
        function (response) {
          storageData = response.storageData;
          updatePrimaryKeysDropdown();
        }
      );
    });
  };

  const copyContent = (text, showAlert = false) => {
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
    } catch (err) {
      window.alert("Some error occurred!");
      console.error({ method: "copyContent", error: err });
    }
  };

  const setSecondaryKeysDropdownVisibility = (visibility) => {
    secondaryFieldsDropdown.style.display = visibility;
  };

  updateStorageData();
});
