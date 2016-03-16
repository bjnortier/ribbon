const TestController = require('./mvc/TestController');

// N-shape
new TestController([
  [0, 0, 0],
  [0, 10, 0],
  [10, 0, 0],
  [10, 10, 0],
]);

// // Small angles
// new TestController([
//   [0, 0, 0],
//   [0, 10, 0],
//   [0.2, 20, 0],
// ]);
//
//
// // Sharp angles
// new TestController([
//   [0, 0, 0],
//   [0, 10, 0],
//   [0.5, 0, 0],
// ]);
