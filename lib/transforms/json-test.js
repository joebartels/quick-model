'use strict';

const { expect }  = require('chai');

const {
  serializer: { serialize },
  deserializer: { deserialize },
  normalizer: { normalize }
} = require('./json');

describe('JSONTransform', function() {

  it('#serialize', function() {
    expect(serialize()).to.equal('{}');
    expect(serialize(null)).to.equal('{}');
    expect(serialize(undefined)).to.equal('{}');
    expect(serialize('')).to.equal('{}');
    expect(serialize('n0†-j$0n')).to.equal('{}');
    expect(serialize({foo: 'bar'})).to.equal('{"foo":"bar"}');
    expect(serialize('{"foo":"bar"}')).to.equal('{"foo":"bar"}');
  });

  it('#deserialize', function() {
    expect(deserialize({})).to.deep.equal({});
    expect(deserialize(null)).to.deep.equal({})
    expect(deserialize(undefined)).to.deep.equal({});
    expect(deserialize('')).to.deep.equal({});
    expect(deserialize('n0†-j$0n')).to.deep.equal({});
    expect(deserialize({foo: 'bar'})).to.deep.equal({foo: 'bar'});
    expect(deserialize('{"foo":"bar"}')).to.deep.equal({foo: 'bar'});
  });

  it('#normalize', function() {
    expect(normalize({})).to.deep.equal({});
    expect(normalize(null)).to.deep.equal({})
    expect(normalize(undefined)).to.deep.equal({});
    expect(normalize('')).to.deep.equal({});
    expect(normalize('n0†-j$0n')).to.deep.equal({});
    expect(normalize({foo: 'bar'})).to.deep.equal({foo: 'bar'});
    expect(normalize('{"foo":"bar"}')).to.deep.equal({});
  });
});
