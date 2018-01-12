'use strict';

function trim(str) {
  return (str || '').trim();
}

/**
  @namespace Transform.array
*/
module.exports = {
  dataType: 'array',

  serializer: {

    /**
      @method serialize
      @param {Array} value
      @param {Object} attribute
      @return {Array}
    */
    serialize(value /*, attribute */) {
      return Array.isArray(value) ? value : [];
    },
  },

  deserializer: {

    /**
      Handles csv, stringified arrays, objects, and arrays

      @method deserialize
      @param {Array|String} value
      @param {Object} attribute
      @return {Array}
      @public
    */
    deserialize(value /*, attribute */) {
      if (typeof value === 'string') {
        if (trim(value) === '') {
          return [];
        }

        try {
          value = JSON.parse(value);
        } catch (err) {
          value = value.split(',').map(trim);
        }
      }

      if (value && typeof value === 'object') {
        value = Object.values(value);
      }

      return Array.isArray(value) ? value : [];
    }
  }
};
