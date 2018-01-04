class Validator {
  constructor(model) {
    this.model = model;
  }

  // WIP
  // WIP
  // WIP
  // WIP
  // WIP
  // WIP
  validate(data, options = {}) {
    const dataType = typeof data;

    if (dataType === 'number' || dataType === 'string') {
      // ???
      // what if data is only a string or number
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.validate(item, options));
    }

    const validateAttribute = (attribute) => {
      this.validateAttribute(attribute, data, serialized);
    };

    const validateRelationship = (relationship) => {
      this.validateRelationship(relationship, data, serialized);
    };

    this.model.eachAttribute(serializeAttribute);
    this.model.eachRelationship(serializeRelationship);

    return serialized;
  }
}
