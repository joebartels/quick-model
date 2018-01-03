'use strict';

/**
  @class Transform.Date
*/
module.exports = {
  dataType: 'date',

  serializer: {

    defaultValue() {
      return (new Date()).toISOString();
    },

    /**
      convert to UTC ISO-8601 format string
      ```
      2016-12-21T22:15:04.452947Z
      ```

      @method serialize
      @param deserialized The serialized value
      @param attribute
      @return The serialized value
    */
    serialize(value /*, attribute */) {
      const date = Date.parse(value);

      return isNaN(date) ? null : (new Date(date)).toISOString();
    }
  },

  deserializer: {

    defaultValue() {
      return new Date();
    },

    /**
      String/Date/Number into Date Object

      @method deserialize
      @param value The serialized value
      @param attribute
      @return The deserialized value
    */
    deserialize(value /*, attribute */) {
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
  }
};
