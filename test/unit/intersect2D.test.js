'use strict';

const chai = require('chai');
const assert = chai.assert;

const lib = require('../../');
const intersect2D = lib.intersect2D;

describe('intersection', () => {

  it('for 2d lines', () => {
    const a1 = [0,0];
    const a2 = [10,10];
    const b1 = [0,10];
    const b2 = [10,0];
    assert.deepEqual(intersect2D([a1, a2], [b1, b2]), [5, 5]);
  });

  it('for parallel', () => {
    const a1 = [0,0];
    const a2 = [10,10];
    const b1 = [10,10];
    const b2 = [20,20];
    assert.isNull(intersect2D([a1, a2], [b1, b2]));
  });

});
