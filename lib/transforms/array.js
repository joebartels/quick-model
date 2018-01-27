'use strict';

/**
  @namespace Transforms.arrayTransform
  @public
*/
module.exports = {
  dataType: 'array',

  serializer: {
    /**
      @method serializer.serialize
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

      @method deserializer.deserialize
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
  },

  validator: {
    /**
      Validates the value.
      If `true` is returned it is considered valid.
      If `false` is returned it is considered invalid.
      If a String is returned it is considered invalid and the string is used
      as the error message.

      @method validator.validate
      @param {Any} value
      @param {Object} attribute
      @return {Boolean|String}
    */
    validate(value, attribute) { // eslint-disable-line no-unused-vars
      return true;
    }
  }
};

function trim(str) {
  return (str || '').trim();
}
