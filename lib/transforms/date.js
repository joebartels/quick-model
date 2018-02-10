'use strict';

/**
  @class Transforms.dateTransform
*/
module.exports = {
  dataType: 'date',

  serializer: {
    /**
      convert to UTC ISO-8601 format string
      ```
      2016-12-21T22:15:04.452947Z
      ```

      @method serialize
      @param {Any} value The deserialized value
      @param {Object} attribute
      @return The serialized value
    */
    serialize(value /*, attribute */) {
      const date = Date.parse(value);

      return isNaN(date) ? null : (new Date(date)).toISOString();
    }
  },

  normalizer: {
    /**
      @method normalize
      @param value The raw value
      @param attribute Hash of details about the attribute. Defined on Model
      @return The normalized value
    */
    normalize(value /*, attribute */) {
      const type = typeof value;

      if (value instanceof Date) {
        return value;
      }

      if (type === 'string') {
        let unix = Date.parse(value);

        return isNaN(unix) ? null : new Date(unix);
      }

      if (type === 'number') { return new Date(value); }

      return null;
    }
  },

  deserializer: {
    /**
      String/Date/Number into Date Object

      @method deserialize
      @param {Any} value The serialized value
      @param {Object} attribute
      @return The deserialized value
    */
    deserialize(value, attribute) { // eslint-disable-line no-unused-vars
      const type = typeof value;

      if (value instanceof Date) {
        return value;
      }

      if (type === 'string') {
        let unix = Date.parse(value);

        return isNaN(unix) ? null : new Date(unix);
      }

      if (type === 'number') { return new Date(value); }

      return null;
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
