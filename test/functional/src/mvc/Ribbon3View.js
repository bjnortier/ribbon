'use strict';

const trip3 = require('trip.three');
const THREE = trip3.THREE;

class Ribbon3View extends trip3.View {

  constructor(model, scene, options) {
    super(model, scene, options);
  }

  render() {
    console.log(this.model.ribbon);
    const geometry = new THREE.Geometry();
    this.model.ribbon.forEach((triangle) => {
      const i = geometry.vertices.push(
        new THREE.Vector3(triangle[0][0], triangle[0][1], triangle[0][2]));
      geometry.vertices.push(
        new THREE.Vector3(triangle[1][0], triangle[1][1], triangle[1][2]));
      geometry.vertices.push(
        new THREE.Vector3(triangle[2][0], triangle[2][1], triangle[2][2]));
      geometry.faces.push(new THREE.Face3(i - 1, i, i + 1));
    });
    geometry.computeFaceNormals();
    var mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide
      }));
    this.sceneObject.add(mesh);
  }

}

module.exports = Ribbon3View;
