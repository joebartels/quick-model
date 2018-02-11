module.exports = function nullifyUndefinedValue(value) {
  if (typeof value === 'undefined') {
    return null;
  }
  return value;
};
