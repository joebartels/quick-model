'use strict';
const { expect }  = require('chai');

const {
  serializer: { serialize },
  deserializer: { deserialize }
} = require('./string');

describe('StringTransform', function() {

  it('#serialize', function() {
    expect(serialize(123)).to.equal('123');
    expect(serialize('foo')).to.equal('foo');
    expect(serialize()).to.equal(null);
    expect(serialize('')).to.equal('');
    expect(serialize(null)).to.equal(null);
    expect(serialize(true)).to.equal('true');
    expect(serialize(false)).to.equal('false');
  });

  it('#deserialize', function() {
    expect(deserialize(123)).to.equal('123')
    expect(deserialize('foo')).to.equal('foo')
    expect(deserialize()).to.equal(null)
    expect(deserialize('')).to.equal('')
    expect(deserialize(null)).to.equal(null)
    expect(deserialize(true)).to.equal('true')
    expect(deserialize(false)).to.equal('false')
  });
});
