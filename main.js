import { LineDrawer } from "./lines.js";
import { CurveDrawer } from "./curve.js";
import { CubeDrawer } from "./cube.js";

/********** CONTROLES DE LA UI Y ACTUALIZACIÓN DE LOS COMPONENTES SVG **********/

// Arreglo con los 4 puntos de control y el punto seleccionado (click del mouse)
var pt = new Array(4);
var curPt = null;
var selPt = null;

// Función par aactualizar las lineas que conectan los puntos de control y la curva punteada objetivo (Bezier)
function UpdateLines() {
  // Son tres segmentos de linea
  var line = new Array(3);

  // En index.html ya definimos 3 segmentos de linea dentro del canvas
  // Vamos a obtenerlos y a actualziar sus coordeandas de inicio y fin
  line[0] = document.getElementById("line0");
  line[1] = document.getElementById("line1");
  line[2] = document.getElementById("line2");

  // Auxiliares para ir recorriendo los puntos de control
  var x1 = pt[0].getAttribute("cx");
  var y1 = pt[0].getAttribute("cy");

  // String con la información de los puntos de control para la curva Bezier
  var d = "M" + x1 + "," + y1 + " C";

  // Visitamos cada punto (empezando en 1)
  for (var i = 0; i < 3; ++i) {
    // Obtenemos su x e y
    var x2 = pt[i + 1].getAttribute("cx");
    var y2 = pt[i + 1].getAttribute("cy");

    // Conectamos inicio y fin de la linea recta
    line[i].setAttribute("x1", x1);
    line[i].setAttribute("y1", y1);
    line[i].setAttribute("x2", x2);
    line[i].setAttribute("y2", y2);

    // Coordenadas para el path
    d += x2 + "," + y2 + " ";

    // Avanzamos al siguiente punto
    x1 = x2;
    y1 = y2;
  }

  // Seteamos el atributo de los puntos de control en el path
  // Más detalles en https://www.w3schools.com/graphics/svg_path.asp
  var c = document.getElementById("curve");
  c.setAttribute("d", d);
}

/********** INICIALIZACIÓN DEL ENTORNO WEBGL **********/

var lineDrawer; // Objeto para condensar el comportamiento necesario para dibujar lineas (ver al final)
var curveDrawer; // Objeto para condensar el comportamiento necesario para dibujar curvas (ver ejercicio.js)
var cubeDrawer; // Objeto para condensar el comportamiento necesario para dibujar cubos (ver cube.js)

function InitWebGL(canvas_name) {
  // Inicializamos el canvas
  // Es el mismo para WebGL y para los componentes SVG
  const canvas = document.getElementById(canvas_name);
  canvas.oncontextmenu = function () {
    return false;
  };

  // Contexto GL
  const gl = canvas.getContext("webgl", { antialias: false });
  if (!gl) {
    alert(
      "No se pudo inicializar WebGL. Es probable que tu navegador no lo soporte."
    );
    return;
  }
  return gl;
}

// Inicializamos del contexto WebGL
function InitWebGLContexts() {
  let canvas2d_gl = InitWebGL("canvas2d"); // Contexto WebGL del canvas para la curva de bezier
  let canvas3d_gl = InitWebGL("canvas3d"); // Contexto WebGL del canvas para el cubo

  canvas2d_gl.clearColor(1.0, 1.0, 1.0, 0.0);
  canvas2d_gl.lineWidth(1.0);
  canvas2d_gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque
  canvas2d_gl.clearDepth(1.0); // Clear everything
  canvas2d_gl.enable(canvas2d_gl.DEPTH_TEST); // Enable depth testing
  canvas2d_gl.depthFunc(canvas2d_gl.LEQUAL); // Near things obscure far things
  
  canvas3d_gl.clearColor(0.0, 0.0, 0.0, 0.0);
  canvas3d_gl.lineWidth(1.0);

  // Clear the canvas before we start drawing on it.

  
  // Tenemos dos programas (dos conjuntos de shaders)
  // Para ambos, su comportamiento y buffers están contenidos en
  // dos clases: LineDrawer y CurveDrawer
  lineDrawer = new LineDrawer(canvas2d_gl);
  curveDrawer = new CurveDrawer(canvas2d_gl);
  cubeDrawer = new CubeDrawer(canvas3d_gl);

  // Configuramos el tamaño del canvas
  UpdateCanvas2DSize(canvas2d_gl);

  return [canvas2d_gl, canvas3d_gl];
}

// Configuración del tamaño del canvas, se ejecuta al inicilizar
// y también cada vez que se cambia el tamaño de la ventana del navegador
function UpdateCanvas2DSize(gl) {
  const canvas2d_container = document.getElementById("canvas2d-container");
  let canvas_container_info = canvas2d_container.getBoundingClientRect();
  // Obtenemos el canvas
  const canvas2d = document.getElementById("canvas2d");

  // Calculamos la resolución en base al pixelRatio
  canvas2d.style.width = "100%";
  canvas2d.style.height = "100%";
  const pixelRatio = window.devicePixelRatio || 1;
  canvas2d.width = pixelRatio * canvas_container_info.width;
  canvas2d.height = pixelRatio * canvas_container_info.height;
  const width = canvas2d.width / pixelRatio;
  const height = canvas2d.height / pixelRatio;

  // Actualizamos el tamaño del canvas2d
  canvas2d.style.width = width + "px";
  canvas2d.style.height = height + "px";

  // Actualizamos el tamaño del viewport (= al canvas2d)
  gl.viewport(0, 0, canvas2d.width, canvas2d.height);

  // Finalmente actualizamos las matrices de proyección (para los segmentos
  // y para las curvas) utilizando el nuevo tamaño del viewport
  lineDrawer.setViewport(width, height);
  curveDrawer.setViewport(width, height);
}

// Actualizamos la posición de los puntos de control
// Se llama cada vez que el usuario los mueve con el mouse (ver mousemove)
function UpdatePoints() {
  // Actualizamos los puntos de control de las lineas rectas
  lineDrawer.updatePoints(pt);

  // Actualizamos los puntos de control de la curva de bezier
  curveDrawer.updatePoints(pt);

}

// Función para dibujar la escena WebGL completa. Limpia el viewport
// y le pide a cada programa que se dibuje
function DrawScene(canvas2d_gl, canvas3d_gl, runTime, pt) {
  // Limpiamos la pantalla
  canvas2d_gl.clear(canvas2d_gl.COLOR_BUFFER_BIT);

  // Le pedimos a las lineas y a la curva bezier que se dibujen
  // (ver las definiciónes en las clases LineDrawer y CurveDrawer)
  curveDrawer.draw();
  lineDrawer.draw();
  cubeDrawer.draw(runTime, pt);

  var delta = Math.sin(runTime) * 0.5 + 0.5;
  // update curPt
  
  let currentPoint = cubeDrawer.evalBezierCubic(delta, pt[0], pt[1], pt[2], pt[3]);
  // console.log(currentPoint);
  // console.log(pt[0], pt[1], pt[2], pt[3]);
  
  // Domain is p0 to p3
  let x = currentPoint[0];
  let y = currentPoint[1];

  // // Map x, y to p3.x - p0.x, p3.y - p0.y
  let x0 = parseFloat(document.getElementById("p0").getAttribute("cx"));
  let y0 = parseFloat(document.getElementById("p0").getAttribute("cy"));
  let x3 = parseFloat(document.getElementById("p3").getAttribute("cx"));
  let y3 = parseFloat(document.getElementById("p3").getAttribute("cy"));

  // let x_mapped = x * (x3 - x0) + x0;
  // let y_mapped = y * (y3 - y0) + y0;

  // Normalizar x, y
  let x_min = Math.min(pt[0][0], pt[1][0], pt[2][0], pt[3][0]);
  let x_max = Math.max(pt[0][0], pt[1][0], pt[2][0], pt[3][0]);
  let y_min = Math.min(pt[0][1], pt[1][1], pt[2][1], pt[3][1]);
  let y_max = Math.max(pt[0][1], pt[1][1], pt[2][1], pt[3][1]);

  let x_normalized = (x - x_min) / (x_max - x_min);
  let y_normalized = (y - y_min) / (y_max - y_min);

  // Map x_normalized, y_normalized to p3.x - p0.x, p3.y - p0.y
  let x_mapped = x_normalized * (x3 - x0) + x0;
  let y_mapped = y_normalized * (y3 - y0) + y0;

  curPt.setAttribute("cx", x_mapped);
  curPt.setAttribute("cy", y_mapped);
}

function getPoints() {
  const canvas2d_container = document.getElementById("canvas2d-container");
  let canvas_container_info = canvas2d_container.getBoundingClientRect();
  let w = canvas_container_info.width;
  let h = canvas_container_info.height;

  pt[0] = document.getElementById("p0");
  pt[1] = document.getElementById("p1");
  pt[2] = document.getElementById("p2");
  pt[3] = document.getElementById("p3");

  return pt.map((p) => {
    return [p.getAttribute("cx") / w, p.getAttribute("cy") / h];
  });
}

// Cuando la página está cargada, preparo los elementos en el canvas
$(document).ready(function () {
  // Obtenemos el ancho y el alto del contenedor
  const canvas2d_container = document.getElementById("canvas2d-container");
  let canvas_container_info = canvas2d_container.getBoundingClientRect();
  let w = canvas_container_info.width;
  let h = canvas_container_info.height;

  // Obtenemos los 4 círculos del canvas (circle)
  // Estos círculos actuan como puntos de control de la curva
  pt[0] = document.getElementById("p0");
  pt[1] = document.getElementById("p1");
  pt[2] = document.getElementById("p2");
  pt[3] = document.getElementById("p3");

  curPt = document.getElementById("p4");

  // This runs when points are changed
  //var event = new Event("change");
  //document.getElementById("p0").dispatchEvent(event);

  // Listen for the event.

  document.getElementById("p0").addEventListener("change", function () {
    UpdateLines();
    UpdatePoints();
  });



  // Posiciones iniciales para los 4 puntos
  // Las elegí para que abarquen el áera de la pantalla, pero se pueden cambiar a gusto
  
  pt[0].setAttribute("cx", 0.1 * w);
  pt[0].setAttribute("cy", 0.1 * h);
  
  pt[1].setAttribute("cx", 0.35 * w);
  pt[1].setAttribute("cy", 0.6 * h);
  
  pt[2].setAttribute("cx", 0.55 * w);
  pt[2].setAttribute("cy", 0.3 * h);
  
  pt[3].setAttribute("cx", 0.8 * w);
  pt[3].setAttribute("cy", 0.9 * h);
  
  curPt.setAttribute("cx", 0.1 * w);
  curPt.setAttribute("cy", 0.1 * h);

  // ********** Sección para linkear distintos eventos ********** //

  // MOUSE-DOWN: Al apretar el botón del mouse
  $("circle").on("mousedown", function (event) {
    if (!selPt) selPt = event.target; // selecciono el punto sobre el que sucedió el evento
  });

  // MOUSE-UP: Al soltar el botón del mouse
  $("circle").on("mouseup", function (event) {
    selPt = null; // quito la selección cuando el usuario levanta el dedo del mouse
  });

  // MOUSE-LEAVE: Al salir del foco también libero la selección
  $("#canvas2d-container").on("mouseleave", function (event) {
    selPt = null; // quito la selección cuando el usuario levanta el dedo del mouse
  });

  // MOUSE-MOVE: Al mover el mouse
  $("#canvas2d-container").on("mousemove", function (event) {
    // Si hay un círuclo seleccionado...
    if (selPt){
      if (selPt === curPt) return;
      // ... actualizo la prosición de ese punto para que se mueva junto con el mouse
      const canvas2d_container = document.getElementById("canvas2d-container");
      selPt.setAttribute(
        "cx",
        event.clientX - canvas_container_info.left
      );
      selPt.setAttribute("cy", event.clientY - canvas_container_info.top);

      // También actualizo las lineas que conectan los puntos de control y la curva objetivo
      UpdateLines();

      // y finalmente actualizo la posición de los puntos y redibujo mi escena WebGL
      UpdatePoints();
    }
  });

  // RESIZE: Si me cambian el tamaño de la ventana del navegador...
  $(window).on("resize", function (event) {
    // ...también tengo que actualizar el tamaño del canvas y del viewport,
    UpdateCanvas2DSize(canvas2d_gl);

  });

  // ********** Fin de linkeo de eventos ********** //

  // 1) Actualizo las lineas que conectan los puntos de control y la curva objetivo
  UpdateLines();

  // 2) Inicializo mi ventana WebGL
  const [canvas2d_gl, canvas3d_gl] = InitWebGLContexts();

  // 3) Actualizo la posición de los puntos y redibujo mi escena WebGL
  UpdatePoints();

  // Draw the scene repeatedly
  function render(runTime) {
    runTime *= 0.001; // convert to seconds
    
    DrawScene(canvas2d_gl, canvas3d_gl, runTime, getPoints());
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
});
