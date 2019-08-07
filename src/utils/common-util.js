const checkEmptyObj = ob =>
  Object.entries(ob).length === 0 && ob.constructor === Object;

const checkForInteger = val => Number.isInteger(val);

const checkForPositiveInt = val => {
  if (isNaN(val)) {
    return false;
  } else {
    val = +val;
    return Number.isInteger(val) && val > 0;
  }
};

module.exports = {
  checkEmptyObj: checkEmptyObj,
  checkForInteger: checkForInteger,
  checkForPositiveInt: checkForPositiveInt
};
