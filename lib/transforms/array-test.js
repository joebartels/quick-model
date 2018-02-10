'use strict';

const { expect } = require('chai');

const {
  serializer: { serialize },
  deserializer: { deserialize },
  normalizer: { normalize }
} = require('./array');

describe('Transforms.array', function() {

  it('#serialize', function() {
    expect(serialize()).to.deep.equal([]);
    expect(serialize('')).to.deep.equal([]);
    expect(serialize(null)).to.deep.equal([]);
    expect(serialize(false)).to.deep.equal([]);
    expect(serialize(true)).to.deep.equal([]);
    expect(serialize('string')).to.deep.equal([]);
    expect(serialize([1,2])).to.deep.equal([1,2]);
    expect(serialize({ 1:'', 2:'' })).to.deep.equal([]);
  });

  it('#deserialize', function() {
    expect(deserialize()).to.deep.equal([]);
    expect(deserialize('')).to.deep.equal([]);
    expect(deserialize(null)).to.deep.equal([]);
    expect(deserialize(false)).to.deep.equal([]);
    expect(deserialize('1, 0')).to.deep.equal(['1', '0']);
    expect(deserialize([1, 0])).to.deep.equal([1, 0]);
    expect(deserialize('["1", "0"]')).to.deep.equal(['1', '0']);
    expect(deserialize({ 1: 'a', 2: 'b' })).to.deep.equal(['a', 'b']);
  });

  it('#normalize', function() {
    expect(normalize()).to.deep.equal([]);
    expect(normalize('')).to.deep.equal([]);
    expect(normalize(null)).to.deep.equal([]);
    expect(normalize(false)).to.deep.equal([]);
    expect(normalize('1, 0')).to.deep.equal([]);
    expect(normalize([1, 0])).to.deep.equal([1, 0]);
    expect(normalize('["1", "0"]')).to.deep.equal([]);
    expect(normalize({ 1: 'a', 2: 'b' })).to.deep.equal([]);
  });
});
