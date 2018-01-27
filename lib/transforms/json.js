'use strict';

/**
  @class Transforms.jsonTransform
*/
module.exports = {
  dataType: 'json',

  serializer: {

    /**
      Server -> Serialize -> DB

      Stringifies an object

      @method serialize
      @param deserialized The serialized value
      @param attribute
      @return The serialized value
    */
    serialize(value /*, attribute */) {
      if (typeof value === 'undefined' || value === null) {
        return '{}';
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      if (typeof value === 'string') {
        try {
          return JSON.stringify(JSON.parse(value));
        } catch (err) {
          return '{}';
        }
      }

      return '{}';
    }
  },

  deserializer: {

    /**
      Client -> Server -> Deserialize -> Validate -> ...

      @method deserialize
      @param value The serialized value
      @param attribute
      @return The deserialized value
    */
    deserialize(value /*, attribute */) {
      if (value && typeof value === 'object') {
        return value;
      }

      if (value === null) {
        return {};
      }

      try {
        return JSON.parse(value);
      } catch(err) {
        return {};
      }
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
