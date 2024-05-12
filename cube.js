import { InitShaderProgram } from "./utils.js";
import { initBuffers } from "./init-cube-buffers.js";

import {
  aggregatedMultiplyMatrices,
  indentityMatrix,
  rotationMatrixX,
  rotationMatrixY,
  rotationMatrixZ,
  modelTranslationMatrix,
  getProjectionMatrix,
} from "./matrices.js";


// Fixed Cube parameters
var cubeScale = 0.1;
var cubeRotation = 0.5;

// State of the animation
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

    // Set cursor to grab;
    document.body.style.cursor = "grab";

    // add <span> tag to the canvas parent element displaying the current rotation change
    if (document.querySelector("#rotation-span")) {
      document.querySelector("#rotation-span").remove();
    }

    var span = document.querySelector("#rotation-span")
    if (span === null) {
      span = document.createElement("span");
      span.id = "rotation-span";
      canvas.parentElement.appendChild(span);
    }
    span.style.position = "absolute";
    console.log(e.clientY);
    span.style.top = `calc(${e.clientY}px - 50px)`;
    span.style.left = `${e.clientX - 75}px`;
    span.style.color = "white";
    span.style.fontFamily = "monospace";
    span.style.fontSize = "12px";
    span.style.backgroundColor = "black";
    span.style.padding = "5px";
    span.style.borderRadius = "5px";
    span.style.zIndex = "9999";

  });

  canvas.addEventListener("mousemove", (e) => {

    if (e.buttons === 1) {
      spaceYRotation += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;

      // update the span tag with the current rotation change
      const span = document.querySelector("#rotation-span");
      span.innerText = `spaceYRotation: ${spaceYRotation.toFixed(2)}`;
      span.style.top = `calc(${e.clientY}px - 50px)`;
      span.style.left = `${e.clientX - 75}px`;
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
      span.style.top = `calc(${e.clientY}px - 50px)`;
      span.style.left = `${e.clientX - 50}px`;
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
    span.style.top = `calc(${e.clientY}px - 50px)`;
    span.style.left = `${e.clientX - 50}px`;


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

    const zNear = 0.1;
    const zFar = 100.0;


    // Oscilación del cubo
    // sin(x) => [-1 y 1]
    // sin(x) * 0.5 => [-0.5 y 0.5]
    // sin(x) * 0.5 + 0.5 => [0 y 1]
    var delta = Math.sin(runTime) * 0.5 + 0.5;

    // Matriz de proyección ortográfica
    let projectionMatrix = getProjectionMatrix(left, right, bottom, top, zNear, zFar);

    // Escalar el cubo en los tres ejes por igual
    const scaling = [cubeScale, cubeScale, cubeScale];

    const scalingMatrix = [
      scaling[0], 0, 0, 0,
      0, scaling[1], 0, 0,
      0, 0, scaling[2], 0,
      0, 0, 0, 1
    ];


    // Puntos de control de la curva de Bezier Cubica
    let p0 = [points[0][0], points[0][1]];
    let p1 = [points[1][0], points[1][1]];
    let p2 = [points[2][0], points[2][1]];
    let p3 = [points[3][0], points[3][1]];

    // Evaluar la curva de Bezier Cubica en el tiempo delta
    let currentPoint = this.evalBezierCubic(delta, p0, p1, p2, p3);

    // Translate to current point
    var translation = [
      0, // x
      -currentPoint[0] * 20 + 10, // y
      currentPoint[1] * 10 - 10, // z
    ];

    // Translation matrix a partir de las traslaciones en x, y, z
    var translationMatrix = modelTranslationMatrix(translation);

    // Zoom matrix a partir del zoom
    var zoomMatrix = modelTranslationMatrix([0, 0, zoom]);

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

    /**
     * 
     * @param {number[]} matrix - Matriz 4x4 a transponer
     * @returns {number[]} Matriz transpuesta
     */
    function transpose(matrix) {
      return [
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
      ];
    }

    /**
     * 
     * La matriz de rotación compuesta es el resultado de multiplicar las matrices de rotación en X, Y y Z
     * 
     * @param {*} rotationX Angulo a rotar en X
     * @param {*} rotationY Angulo a rotar en Y
     * @param {*} rotationZ Angulo a rotar en Z
     * @returns {number[]} Matriz de rotación compuesta
     */
    const composedRotationMatrix = (rotationX, rotationY, rotationZ) => aggregatedMultiplyMatrices(
      [rotationMatrixX(rotationX), rotationMatrixY(rotationY), rotationMatrixZ(rotationZ)]
    );

    // Rotación del cubo sobre los tres ejes
    const cubeRotationMatrix3d = composedRotationMatrix(rotationX, rotationY, rotationZ);

    // Rotación del espacio sobre el eje Y
    const spaceRotationMatrix3d = composedRotationMatrix(0, spaceYRotation, 0);

    mvp = aggregatedMultiplyMatrices([cubeRotationMatrix3d, translationMatrix, scalingMatrix, spaceRotationMatrix3d, zoomMatrix, mvp]);
    /* 
    La Linea de arriba es equivalente a aplicar en orden las siguientes transformaciones:
      mvp = aggregatedMultiplyMatrices([zoomMatrix, mvp]);
      mvp = aggregatedMultiplyMatrices([spaceRotationMatrix3d, mvp]);
      mvp = aggregatedMultiplyMatrices([scalingMatrix, mvp]);
      mvp = aggregatedMultiplyMatrices([translationMatrix, mvp]);
      mvp = aggregatedMultiplyMatrices([cubeRotationMatrix3d, mvp]);
    */

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

  /*
   * Evaluar una curva de Bezier Cubica
   * @param {number}
   * @param {number[]} p0 - Punto de control 0
   * @param {number[]} p1 - Punto de control 1
   * @param {number[]} p2 - Punto de control 2
   * @param {number[]} p3 - Punto de control 3
   * @returns {number[]} - Punto en la curva de Bezier en el tiempo t
   * 
   */
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
        // vColor = aVertexColor;
        
        // Recolor the cube based on the position of the vertex
        // vColor = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);

        // Recolor the cube based on the position of the vertex and the aVertexColor
        // Clamp aVertexPosition to the range 0.2 to 0.8
        float lowerBound = 0.4;
        float upperBound = 1.0;
        vColor = vec4(
          clamp(aVertexColor.r * aVertexPosition.x, lowerBound, upperBound), 
          clamp(aVertexColor.g * aVertexPosition.y, lowerBound, upperBound), 
          clamp(aVertexColor.b * aVertexPosition.z, lowerBound, upperBound), 
          1.0
        );  

    }
`;

var fsSource = /*glsl*/ `
    precision mediump float;
    varying lowp vec4 vColor;

    void main(void) {
        gl_FragColor = vColor;

        // Add lighting effect
        // vec3 lightDirection = normalize(vec3(0.5, 0.2, 1.0));
        // float lightWeight = max(dot(normalize(vColor.rgb), lightDirection), 0.0);
        // gl_FragColor = vec4(vColor.rgb * lightWeight, vColor.a);

        // Phong shading
        // vec3 lightDirection = normalize(vec3(0.5, 0.2, 1.0));
        // float lightWeight = max(dot(normalize(vColor.rgb), lightDirection), 0.0);
        // vec3 ambient = vec3(0.1, 0.1, 0.1);
        // vec3 diffuse = vec3(1.0, 1.0, 1.0);
        // vec3 specular = vec3(1.0, 1.0, 1.0);
        // float shininess = 2000.0;
        // vec3 normal = normalize(vColor.rgb);
        // vec3 viewDir = normalize(-vColor.rgb);
        // vec3 reflectDir = reflect(-lightDirection, normal);
        // float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        // vec3 specularLight = specular * spec;
        // vec3 diffuseLight = diffuse * lightWeight;
        // vec3 ambientLight = ambient;
        // vec3 result = (ambientLight + diffuseLight + specularLight) * vColor.rgb;
        // gl_FragColor = vec4(result, vColor.a);
    }
`;

export { CubeDrawer };
