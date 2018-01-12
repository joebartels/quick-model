'use strict';

const STRING_CAMELIZE_REGEXP_1 = (/(-|_|\.|\s)+(.)?/g);
const STRING_CAMELIZE_REGEXP_2 = (/(^|\/)([A-Z])/g);

const STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
const STRING_UNDERSCORE_REGEXP_2 = (/-|\s+/g);

function camelize(str) {
  return (str || '').replace(STRING_CAMELIZE_REGEXP_1, (match, separator, chr) => chr ? chr.toUpperCase() : '')
                    .replace(STRING_CAMELIZE_REGEXP_2, (match, separator, chr) => match.toLowerCase());
}

function underscore(str) {
  return (str || '').replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2')
                    .replace(STRING_UNDERSCORE_REGEXP_2, '_')
                    .toLowerCase();
}

module.exports.camelize = camelize;

module.exports.underscore = underscore;
