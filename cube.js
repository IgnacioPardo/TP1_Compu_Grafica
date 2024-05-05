import { InitShaderProgram } from "./utils.js";
import { initBuffers } from "./init-cube-buffers.js";
import {
  multiplyMatrices,
  indentityMatrix,
  modelYRotationMatrix,
  modelTranslationMatrix,
  getProjectionMatrix,
} from "./matrices.js";


// Fixed Cube parameters
var cubeSpeed = 0.03;
var cubeScale = 0.4;
var cubeRotation = 0.5;


// State of the animation
var isOscilating = true;
var isAutoRotate = true;

// Space Parameters, alter translation and rotation of the space after the cube
var spaceYRotation = 0.0;
var zoom = 0;

// On document load, get the canvas element
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.querySelector("#canvas3d");

  // while clicking and swiping/draging on the canvas, we can rotate the space in the y axis
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("mousedown", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;

    // Set cursor: grab;
    document.body.style.cursor = "grab";

    // add <span> tag to the canvas parent element displaying the current rotation change
    if (document.querySelector("#rotation-span")) {
      document.querySelector("#rotation-span").remove();
    }

    var span = document.querySelector("#rotation-span")
    if (span === null) {
      span = document.createElement("span");
      span.id = "rotation-span";
      span.style.position = "absolute";
      span.style.top = `${e.clientY}px`;
      span.style.left = `${e.clientX}px`;
      span.style.color = "white";
      span.style.fontFamily = "monospace";
      span.style.fontSize = "12px";
      span.style.backgroundColor = "black";
      span.style.padding = "5px";
      span.style.borderRadius = "5px";
      span.style.zIndex = "9999";
      canvas.parentElement.appendChild(span);
    }

  });

  canvas.addEventListener("mousemove", (e) => {
    
    if (e.buttons === 1) {
      spaceYRotation += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;

      // update the span tag with the current rotation change
      const span = document.querySelector("#rotation-span");
      span.innerText = `spaceYRotation: ${spaceYRotation.toFixed(2)}`;
      span.style.top = `${e.clientY}px`;
      span.style.left = `${e.clientX}px`;
    }
  });

  canvas.addEventListener("mouseup", () => {

    document.body.style.cursor = "default";

    // remove the span tag when the mouse is released
    const span = document.querySelector("#rotation-span");
    span.remove();
  });

  canvas.addEventListener("touchstart", (e) => {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  });

  canvas.addEventListener("touchmove", (e) => {
    spaceYRotation += (e.touches[0].clientX - lastX) * 0.01;
    lastX = e.touches[0].clientX;
  });

  // while scrolling on the canvas, we can zoom in and out
  canvas.addEventListener("wheel", (e) => {

    // Set cursor: zoom-out;
    if (e.deltaY > 0) {
      document.body.style.cursor = "zoom-in";
    }
    // Set cursor: zoom-in;
    if (e.deltaY < 0) {
      document.body.style.cursor = "zoom-out";
    }


    zoom += e.deltaY * 0.01;

    // add <span> tag to the canvas parent element displaying the current zoom

    var span = document.querySelector("#zoom-span")

    if (span === null) {
      span = document.createElement("span");
      span.id = "zoom-span";
      span.style.position = "absolute";
      span.style.top = `${e.clientY}px`;
      span.style.left = `${e.clientX}px`;
      span.style.color = "white";
      span.style.fontFamily = "monospace";
      span.style.fontSize = "12px";
      span.style.backgroundColor = "black";
      span.style.padding = "5px";
      span.style.borderRadius = "5px";
      span.style.zIndex = "9999";
      canvas.parentElement.appendChild(span);
    }

    span.innerText = `zoom: ${zoom.toFixed(2)}`;
    span.style.top = `${e.clientY}px`;
    span.style.left = `${e.clientX}px`;


    // There is no event for scrolling stop, so we remove the span tag after 1 second of no scrolling
    setTimeout(() => {
      span.remove();
      document.body.style.cursor = "default";
    }, 1000);
  });

  // while pressing the space bar, we can toggle the auto rotation of the cube
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      isAutoRotate = !isAutoRotate;
    }

    // If R is pressed, reset the cube rotation, zoom and space rotation
    if (e.key === "r") {
      cubeRotation = 0.5;
      zoom = 0;
      spaceYRotation = 0;

      const canvas2d_container = document.getElementById("canvas2d-container");
      let canvas_container_info = canvas2d_container.getBoundingClientRect();
      let w = canvas_container_info.width;
      let h = canvas_container_info.height;
      document.getElementById("p0").setAttribute("cx", 0.1 * w);
      document.getElementById("p0").setAttribute("cy", 0.1 * h);

      document.getElementById("p1").setAttribute("cx", 0.35 * w);
      document.getElementById("p1").setAttribute("cy", 0.6 * h);

      document.getElementById("p2").setAttribute("cx", 0.55 * w);
      document.getElementById("p2").setAttribute("cy", 0.3 * h);

      document.getElementById("p3").setAttribute("cx", 0.8 * w);
      document.getElementById("p3").setAttribute("cy", 0.9 * h);

      document.getElementById("p4").setAttribute("cx", 0.1 * w);
      document.getElementById("p4").setAttribute("cy", 0.1 * h);

      // Redraw the curve on de 2d canvas
      var event = new Event("change");
      document.getElementById("p0").dispatchEvent(event);



      // Display a toast notification on the canvas
      if (!document.querySelector("#reset-span")) {
        if (document.querySelector("#rotation-span")) {
          document.querySelector("#rotation-span").remove();
        }
        if (document.querySelector("#zoom-span")) {
          document.querySelector("#zoom-span").remove();
        }
        
        var span = document.createElement("span");
        span.id = "reset-span";
        span.innerText = "Reset Transformations";
        span.style.position = "absolute";
        span.style.color = "black";
        span.style.fontFamily = "monospace";
        span.style.fontSize = "12px";
        span.style.width = "fit-content";
        // Animation
        span.style.transition = "transform 0.5s ease-in-out, opacity 1s ease-in-out";
        span.style.backgroundColor = "white";
        span.style.padding = "5px";
        span.style.borderRadius = "5px";
        span.style.zIndex = "9999";
        
        span.style.opacity = "0";
        canvas.parentElement.appendChild(span);
        span.style.top = "0%";
        span.style.left = `calc(50% - ${span.offsetWidth / 2}px)`;
        
        
        setTimeout(() => {
          span.style.transform = "translate(0, 200%)";
          span.style.opacity = "1";
          
          setTimeout(() => {
            span.style.transform = "translate(0, -100%)";
            span.style.opacity = "0";

            setTimeout(() => {
              span.remove();
            }, 500);
          }, 2000);

        }, 100);
      }
    }
  });
});

// Clase muy similar a CurveDrawer. Pueden utilizarla como modelo para resolver el TP.
class CubeDrawer {
  // Inicialización de los shaders y buffers
  constructor(gl) {
    this.gl = gl;
    // Initialize a shader program
    let prog = InitShaderProgram(vsSource, fsSource, this.gl);

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    this.programInfo = {
      program: prog,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(prog, "aVertexPosition"),
        vertexColor: this.gl.getAttribLocation(prog, "aVertexColor"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          prog,
          "uProjectionMatrix"
        ),
        mvp: this.gl.getUniformLocation(prog, "umvp"),
      },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    this.buffers = initBuffers(gl);
  }

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute() {
    const numComponents = 3; // pull out 2 values per iteration
    const type = this.gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    // Bind the buffer currently bound to gl.ARRAY_BUFFER to a generic vertex attribute of the
    // current vertex buffer object and specify its layout.
    // vertexAttribPointer(index, size, type, normalized, stride, offset)
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    // Turn on the generic vertex attribute array at the specified index into the list of
    // attribute arrays. (It is disabled by default)
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  setColorAttribute() {
    const numComponents = 4;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
  }

  // Dibujamos los segmentos de linea
  draw(runTime, points) {

    this.gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const left = -1;
    const right = 1;
    const bottom = -1;
    const top = 1;
    
    let mvp = indentityMatrix();

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect_ratio = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    // let delta = runTime * (0.5 + cubeSpeed);
    
    var delta = Math.sin(runTime) * 0.5 + 0.5;
    
    let projectionMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    // Perspective Projection
    projectionMatrix = [
      2 / (right - left), 0, 0, -(right + left) / (right - left),
      0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
      0, 0, -2 / (zFar - zNear), -(zFar + zNear) / (zFar - zNear),
      0, 0, 0, 1
    ];

    // projectionMatrix = getProjectionMatrix(left, right, bottom, top, zNear, zFar);

    // 3d scaling matrix
    var scale = 2;
    scale *= cubeScale;
    
    // Scale the cube equally in all axis
    const scaling = [scale, scale, scale];
    
    const scalingMatrix = [
      scaling[0], 0, 0, 0,
      0, scaling[1], 0, 0,
      0, 0, scaling[2], 0,
      0, 0, 0, 1
    ];

    
    // Evaluate Bezier Cubic Curve
    let p0 = [points[0][0], points[0][1]];
    let p1 = [points[1][0], points[1][1]];
    let p2 = [points[2][0], points[2][1]];
    let p3 = [points[3][0], points[3][1]];
    
    // Get current point in the curve based on delta
    let currentPoint = this.evalBezierCubic(delta, p0, p1, p2, p3);
    
    // console.log(currentPoint);

    // Translate to current point
    var translation = [
      0, // x
      -currentPoint[0] * 10 + 5, // y
      currentPoint[1] * 10 - 10, // z
    ];
    
    // 3d Translation matrix
    var translationMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      translation[0], translation[1], translation[2], 1
    ];

    var zoomMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, zoom, 1
    ];

    // Rotate by delta
    let rotationX = 0;
    let rotationY = cubeRotation;
    let rotationZ = 0;

    if (isAutoRotate) {
      rotationX = 0;
      rotationY = runTime;
      rotationZ = 0;

      cubeRotation = runTime;
    }

  
    // Functions to create rotation matrices given an angle
    const rotationMatrixX = (rotationX) => [
      1, 0, 0, 0,
      0, Math.cos(rotationX), -Math.sin(rotationX), 0,
      0, Math.sin(rotationX), Math.cos(rotationX), 0,
      0, 0, 0, 1
    ];

    const rotationMatrixY = (rotationY) => [
      Math.cos(rotationY), 0, Math.sin(rotationY), 0,
      0, 1, 0, 0,
      -Math.sin(rotationY), 0, Math.cos(rotationY), 0,
      0, 0, 0, 1
    ];

    const rotationMatrixZ = (rotationZ) => [
      Math.cos(rotationZ), -Math.sin(rotationZ), 0, 0,
      Math.sin(rotationZ), Math.cos(rotationZ), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    function matrixMultiply(matrices) {
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

    function transpose(matrix) {
      return [
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
      ];
    }

    // let cubeRotationMatrixX = rotationMatrixX(rotationX);
    // let cubeRotationMatrixY = rotationMatrixY(rotationY);
    // let cubeRotationMatrixZ = rotationMatrixZ(rotationZ);
    // const cubeRotationMatrix3d = matrixMultiply([cubeRotationMatrixZ, cubeRotationMatrixY, cubeRotationMatrixX]);
    
    const composedRotationMatrix = (rotationX, rotationY, rotationZ) => matrixMultiply([rotationMatrixX(rotationX), rotationMatrixY(rotationY), rotationMatrixZ(rotationZ)]);
    
    const cubeRotationMatrix3d = composedRotationMatrix(rotationX, rotationY, rotationZ);

    // var spaceRotationMatrixX = rotationMatrixX(0);
    // var spaceRotationMatrixY = rotationMatrixY(spaceYRotation);
    // var spaceRotationMatrixZ = rotationMatrixZ(0);
    // const spaceRotationMatrix3d = matrixMultiply([spaceRotationMatrixX, spaceRotationMatrixY, spaceRotationMatrixZ]);

    const spaceRotationMatrix3d = composedRotationMatrix(0, spaceYRotation, 0);

    // mvp = matrixMultiply([mvp, rotationMatrix3d]);
    // mvp = matrixMultiply([mvp, translationMatrix]);
    // mvp = matrixMultiply([mvp, scalingMatrix]);
    
    mvp = matrixMultiply([zoomMatrix, mvp]);
    mvp = matrixMultiply([spaceRotationMatrix3d, mvp]);
    mvp = matrixMultiply([scalingMatrix, mvp]);
    mvp = matrixMultiply([translationMatrix, mvp]);
    mvp = matrixMultiply([cubeRotationMatrix3d, mvp]);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    this.setPositionAttribute();
    this.setColorAttribute();

    // Tell WebGL which indices to use to index the vertices
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    // Seleccionamos el shader
    this.gl.useProgram(this.programInfo.program);

    this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.mvp, false, mvp);
    
    // Set the shader uniforms
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    const vertexCount = 36;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    // gl.TRIANGLES: Draws a triangle for a group of three vertices.
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);

  }

  evalBezierCubic(t, p0, p1, p2, p3) {
    let x = Math.pow(1 - t, 3) * p0[0] + 3 * Math.pow(1 - t, 2) * t * p1[0] + 3 * (1 - t) * Math.pow(t, 2) * p2[0] + Math.pow(t, 3) * p3[0];
    let y = Math.pow(1 - t, 3) * p0[1] + 3 * Math.pow(1 - t, 2) * t * p1[1] + 3 * (1 - t) * Math.pow(t, 2) * p2[1] + Math.pow(t, 3) * p3[1];
    return [x, y];
  }
}

var vsSource = /*glsl*/ `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uProjectionMatrix;

    uniform mat4 umvp;
    varying lowp vec4 vColor;

    void main(void) {
        gl_Position = uProjectionMatrix * umvp * aVertexPosition;
        vColor = aVertexColor;
    }
`;

var fsSource = /*glsl*/ `
    precision mediump float;
    varying lowp vec4 vColor;

    void main(void) {
        gl_FragColor = vColor;
    }
`;

export { CubeDrawer };
