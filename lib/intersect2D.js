'use strict';

// https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
module.exports = function(a, b) {
  const x1 = a[0][0];
  const y1 = a[0][1];
  const x2 = a[1][0];
  const y2 = a[1][1];
  const x3 = b[0][0];
  const y3 = b[0][1];
  const x4 = b[1][0];
  const y4 = b[1][1];

  const den = ((x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4));
  if (den === 0) {
    return null;
  }
  const px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/den;
  const py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/den;
  return [px, py];
};
