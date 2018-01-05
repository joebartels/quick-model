/**
  @method mapCompact
  @param {Array} array
  @param {Function} fn map function
  @param {...Mixed} additional args to pass to map function
*/
function mapCompact(array, mapFn) {
  if (!Array.isArray(array)) {
    return [];
  }

  let length = array.length;
  let list = [];
  let item;

  for (let i = 0; i < length; i++) {
    item = mapFn(array[i]);

    if (item) {
      list.push(item);
    }
  }

  return list;
}

module.exports = mapCompact;
