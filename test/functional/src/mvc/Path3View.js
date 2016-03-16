'use strict';

const trip3 = require('trip.three');
const THREE = trip3.THREE;

class Path3View extends trip3.View {

  constructor(model, scene, options) {
    super(model, scene, options);
  }

  render() {
    const geometry = new THREE.Geometry();
    geometry.vertices = this.model.path.map((p) => {
      return new THREE.Vector3(p[0], p[1], p[2]);
    });

    this.sceneObject.add(
      new THREE.Line(geometry,
      new THREE.LineBasicMaterial({
        linewidth: 2,
        color: 0xff0000
      })));
  }

}

module.exports = Path3View;
