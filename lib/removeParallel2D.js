'use strict';

const intersect2D = require('./intersect2d');

// Remove intermediate parallel (in 2D) points from the polygon
module.exports = function(polygon) {
  const result = [polygon[0]];
  for (let i = 0, il = polygon.length - 2; i < il; ++i) {
    const a = polygon[i];
    const b = polygon[i + 1];
    const c = polygon[i + 2];
    const intersect = intersect2D([a, b], [b, c]);
    if (intersect !== null) {
      result.push(b);
    }
  }
  result.push(polygon[polygon.length - 1]);
  return result;
};
