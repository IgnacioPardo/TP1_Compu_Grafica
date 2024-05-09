/**
 * Esta función multiplica dos matrices de 4x4.
 * 
 * @param {number[]} matrix1 - Una matriz de 4x4.
 * @param {number[]} matrix2 - Una matriz de 4x4.
 * @returns {number[]} El resultado de multiplicar matrix1 por matrix2.
 */
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

/**
     * 
     * @param {number[][]} matrices - Array de matrices 4x4 a multiplicar
     * @returns {number[]} El resultado de multiplicar las matrices
     * 
     */
function aggregatedMultiplyMatrices(matrices) {
  return matrices.reduce((acc, matrix) => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += acc[i * 4 + k] * matrix[k * 4 + j];
        }
        result.push(sum);
      }
    }
    return result;
  }, matrices[0]);
}

/**
 * 
 * @returns {number[]} Una matriz identidad 4x4.
 */
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
  /**
   * Esta función genera una matriz de traslación dado un vector;
   * 
   * @param {number[]} displacement - Un vector de traslación. [DisplacementX, DisplacementY, DisplacementZ]
   * @returns {number[]} Una matriz de traslación 4x4.
   */
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    displacement[0], displacement[1], displacement[2], 1
  ];
}

/**
 * Esta función genera una matriz de proyección ortográfica.
 *
 * @param {number} left - El límite izquierdo del espacio de visualización.
 * @param {number} right - El límite derecho del espacio de visualización.
 * @param {number} bottom - El límite inferior del espacio de visualización.
 * @param {number} top - El límite superior del espacio de visualización.
 * @param {number} zNear - El límite cercano del espacio de visualización en el eje Z.
 * @param {number} zFar - El límite lejano del espacio de visualización en el eje Z.
 * @returns {number[]} Una matriz de proyección ortográfica 4x4.
 */
function getProjectionMatrix(left, right, bottom, top, zNear, zFar) {
  /*
  La matriz de proyección ortográfica funciona de la siguiente manera:
  2 / (right - left) -> Escala en X
  2 / (top - bottom) -> Escala en Y
  -2 / (zFar - zNear) -> Escala en Z
  -(right + left) / (right - left) -> Traslación en X
  -(top + bottom) / (top - bottom) -> Traslación en Y
  -(zFar + zNear) / (zFar - zNear) -> Traslación en Z
  */

  return [
    2 / (right - left), 0, 0, -(right + left) / (right - left),
    0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
    0, 0, -2 / (zFar - zNear), -(zFar + zNear) / (zFar - zNear),
    0, 0, 0, 1
  ]
}


/**
 * 
 * @param {*} rotationX Angulo a rotar en X
 * @returns {number[]} Matriz de rotación en X
 */
function rotationMatrixX (rotationX) {
  return [
    1, 0, 0, 0,
    0, Math.cos(rotationX), -Math.sin(rotationX), 0,
    0, Math.sin(rotationX), Math.cos(rotationX), 0,
    0, 0, 0, 1
  ];
}

/**
 * 
 * @param {*} rotationY Angulo a rotar en Y
 * @returns {number[]} Matriz de rotación en Y
 * 
 */
function rotationMatrixY (rotationY) {
  return [
    Math.cos(rotationY), 0, Math.sin(rotationY), 0,
    0, 1, 0, 0,
    -Math.sin(rotationY), 0, Math.cos(rotationY), 0,
    0, 0, 0, 1
  ];
}

/**
 * 
 * @param {*} rotationZ Angulo a rotar en Z
 * @returns {number[]} Matriz de rotación en Z
 *
*/
function rotationMatrixZ (rotationZ) {
  return [
    Math.cos(rotationZ), -Math.sin(rotationZ), 0, 0,
    Math.sin(rotationZ), Math.cos(rotationZ), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export {
  multiplyMatrices,
  aggregatedMultiplyMatrices,
  indentityMatrix,
  
  rotationMatrixX,
  rotationMatrixY,
  rotationMatrixZ,

  modelTranslationMatrix,
  getProjectionMatrix,
};
