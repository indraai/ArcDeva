// Copyright (c)2022 Quinn Michaels
// Arcade Deva test file

const {expect} = require('chai')
const arc = require('./index.js');

describe(arc.me.name, () => {
  beforeEach(() => {
    return arc.init()
  });
  it('Check the DEVA Object', () => {
    expect(arc).to.be.an('object');
    expect(arc).to.have.property('agent');
    expect(arc).to.have.property('vars');
    expect(arc).to.have.property('listeners');
    expect(arc).to.have.property('methods');
    expect(arc).to.have.property('modules');
  });
})
