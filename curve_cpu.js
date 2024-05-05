import { InitShaderProgram } from "./utils.js";

// Completar la implementación de esta clase y el correspondiente vertex shader.
// No es necesario modificar el fragment shader a menos que quieran, por ejemplo, modificar el color de la curva.

class CurveDrawer {
  // Inicialización de los shaders y buffers
  constructor(gl) {
    // Creamos el programa webgl con los shaders para los segmentos de recta
    this.gl = gl;
    this.prog = InitShaderProgram(curvesVS, curvesFS, this.gl);

    // [Completar] Incialización y obtención de las ubicaciones de los atributos y variables uniformes

	  // Obtenemos la ubicación de las varibles uniformes en los shaders,
	  // en este caso, la matriz de transformación 'mvp'
	  this.mvp = gl.getUniformLocation(this.prog, "mvp");

	  // Obtenemos la ubicación de los atributos de los vértices
	  // en este caso, la posición 'pos'
	  this.vertPos = gl.getAttribLocation(this.prog, "pos");

	  // Creamos el buffer para los vértices.
	  // En este caso no tenemos triángulos, pero si segmentos
	  // definidos entre dos puntos.
	  this.buffer = gl.createBuffer();

	  // Si bien creamos el buffer, no vamos a ponerle contenido en este
	  // constructor. La actualziación de la información de los vértices
	  // la haremos dentro de updatePoints().

  }

	// Actualización del viewport (se llama al inicializar la web o al cambiar el tamaño de la pantalla)
	setViewport( width, height )
	{
		// [Completar] Matriz de transformación.
		// [Completar] Binding del programa y seteo de la variable uniforme para la matriz. 
		// Calculamos la matriz de proyección.
		// Como nos vamos a manejar únicamente en 2D, no tiene sentido utilizar perspectiva.
		// Simplemente inicializamos la matriz para que escale los elementos de la escena
		// al ancho y alto del canvas, invirtiendo la coordeanda y. La matriz está en formato
		// column-major.
		var trans = [
			2 / width,
			0,
			0,
			0,
			0,
			-2 / height,
			0,
			0,
			0,
			0,
			1,
			0,
			-1,
			1,
			0,
			1,
		];
		//var trans = [ 2/5000,0,0,0,  0,-2/5000,0,0, 0,0,1,0, -1,1,0,1 ];

		// Seteamos la matriz en la variable unforme del shader
		this.gl.useProgram(this.prog);
		this.gl.uniformMatrix4fv(this.mvp, false, trans);

	}

	updatePoints( pt )
	{
		// [Completar] Actualización de las variables uniformes para los puntos de control
		// [Completar] No se olviden de hacer el binding del programa antes de setear las variables 
		// [Completar] Pueden acceder a las coordenadas de los puntos de control consultando el arreglo pt[]:
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");

		// Armamos el arreglo
		var p = [];
		for (var i = 0; i < 4; ++i) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");

			p.push(x);
			p.push(y);
		}

		// Evaluar la curva de Bezier
		var curve = [];

		for (var i = 0; i < 100; i++) {
			var t = i / 100;
			var x = Math.pow(1 - t, 3) * p[0] + 3 * Math.pow(1 - t, 2) * t * p[2] + 3 * (1 - t) * Math.pow(t, 2) * p[4] + Math.pow(t, 3) * p[6];
			var y = Math.pow(1 - t, 3) * p[1] + 3 * Math.pow(1 - t, 2) * t * p[3] + 3 * (1 - t) * Math.pow(t, 2) * p[5] + Math.pow(t, 3) * p[7];
			curve.push(x);
			curve.push(y);
		}



		// Enviamos al buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(curve),
			this.gl.STATIC_DRAW
		);

	}

	draw()
	{
		// [Completar] Dibujamos la curva como una LINE_STRIP
		// [Completar] No se olviden de hacer el binding del programa y de habilitar los atributos de los vértices
	
		// Seleccionamos el shader
		this.gl.useProgram(this.prog);

		// Binding del buffer de posiciones
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

		// Habilitamos el atributo
		this.gl.vertexAttribPointer(this.vertPos, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.vertPos);

		// Dibujamos lineas utilizando primitivas gl.LINE_STRIP
		this.gl.drawArrays(this.gl.LINE_STRIP, 0, 100);
	}
}

// Vertex Shader
//[Completar] El vertex shader se ejecuta una vez por cada punto en mi curva (parámetro step). No confundir punto con punto de control.
// Deberán completar con la definición de una Bezier Cúbica para un punto t. Algunas consideraciones generales respecto a GLSL: si
// declarás las variables pero no las usás, no se les asigna espacio. Siempre poner ; al finalizar las sentencias. Las constantes
// en punto flotante necesitan ser expresadas como X.Y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var curvesVS = `
	attribute vec2 pos;
	uniform mat4 mvp;

	void main()
	{
		gl_Position = mvp * vec4(pos,0,1);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(0,0,1,1);
	}
`;


export { CurveDrawer };
