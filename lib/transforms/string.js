'use strict';

/**
  @class Transforms.stringTransform
*/
module.exports = {
  dataType: 'string',

  serializer: {

    /**
      @method serialize
      @param deserialized The serialized value
      @param attributes
      @return The serialized value
    */
    serialize(value /*, attributes */) {
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'undefined' || value === null) {
        return null;
      }

      return String(value);
    }
  },

  normalizer: {
    /**
      @method normalize
      @param value A raw value
      @param attribute
      @return The normalized value
    */
    normalize(value, /* attribute */) {
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'undefined' || value === null) {
        return '';
      }

      return String(value);
    }
  },

  deserializer: {

    /**
      @method deserialize
      @param value The serialized value
      @param attributes
      @return The deserialized value
    */
    deserialize(value /*, options */) {
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'undefined' || value === null) {
        return null;
      }

      return String(value);
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
