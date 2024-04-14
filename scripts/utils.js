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
