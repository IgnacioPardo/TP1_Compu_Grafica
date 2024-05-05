function multiplyMatrices(matrix1, matrix2) {
  let result = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
          for (let k = 0; k < 4; k++) {
              result[j * 4 + i] += matrix1[k * 4 + i] * matrix2[j * 4 + k];
          }
      }
  }
  return result;
}

function indentityMatrix() {
  return [1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1];
}

function modelYRotationMatrix(angle) {
  return indentityMatrix();
}

function modelTranslationMatrix (displacement) {
  return indentityMatrix();
}

function getProjectionMatrix(left, right, bottom, top, zNear, zFar) {
  return [
    2 / (right - left), 0, 0, -(right + left) / (right - left),
    0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
    0, 0, -2 / (zFar - zNear), -(zFar + zNear) / (zFar - zNear),
    0, 0, 0, 1
  ]
}

export {
  multiplyMatrices,
  indentityMatrix,
  modelYRotationMatrix,
  modelTranslationMatrix,
  getProjectionMatrix,
};
