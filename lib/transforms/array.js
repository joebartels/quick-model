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

  normalizer: {
    /**
      @method normalize
      @param value The raw value
      @param attribute Hash of details about the attribute. Defined on Model
      @return The normalized value
    */
    normalize(value /*, attribute */) {
      if (Array.isArray(value)) {
        return value;
      }

      return [];
    }
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
  }
};

function trim(str) {
  return (str || '').trim();
}
