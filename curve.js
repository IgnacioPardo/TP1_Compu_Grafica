import { InitShaderProgram } from "./utils.js";

class CurveDrawer {
	// Inicialización de los shaders y buffers
	constructor(gl) {
		// Creamos el programa webgl con los shaders para los segmentos de recta
		this.gl = gl;
		this.prog = InitShaderProgram(curvesVS, curvesFS, this.gl);

		// [Completar] Incialización y obtención de las ubicaciones de los atributos y variables uniformes

		this.mvp = gl.getUniformLocation(this.prog, "mvp");

		this.t = gl.getAttribLocation(this.prog, "t");

		this.p0 = gl.getUniformLocation(this.prog, "p0");
		this.p1 = gl.getUniformLocation(this.prog, "p1");
		this.p2 = gl.getUniformLocation(this.prog, "p2");
		this.p3 = gl.getUniformLocation(this.prog, "p3");

		// [Completar] Creacion del vertex buffer y seteo de contenido

		this.buffer = gl.createBuffer();

		this.steps = 100;
		var t = [];
		for (var i = 0; i < this.steps; ++i) {
			t.push(i / this.steps);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t), gl.STATIC_DRAW);

	}

	// Actualización del viewport (se llama al inicializar la web o al cambiar el tamaño de la pantalla)
	setViewport(width, height) {
		// [Completar] Matriz de transformación.
		// [Completar] Binding del programa y seteo de la variable uniforme para la matriz. 

		var trans = [
			2 / width, 0, 0, 0,
			0, -2 / height, 0, 0,
			0, 0, 1, 0,
			-1, 1, 0, 1
		];
		//var trans = [ 2/5000,0,0,0,  0,-2/5000,0,0, 0,0,1,0, -1,1,0,1 ];

		// Seteamos la matriz en la variable unforme del shader
		this.gl.useProgram(this.prog);
		this.gl.uniformMatrix4fv(this.mvp, false, trans);
	}

	updatePoints(pt) {
		// [Completar] Actualización de las variables uniformes para los puntos de control
		// [Completar] No se olviden de hacer el binding del programa antes de setear las variables 
		// [Completar] Pueden acceder a las coordenadas de los puntos de control consultando el arreglo pt[]:
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");

		this.gl.useProgram(this.prog);

		var p = [];
		for (var i = 0; i < 4; ++i) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");

			p.push(x);
			p.push(y);
		}

		this.gl.uniform2f(this.p0, pt[0].getAttribute("cx"), pt[0].getAttribute("cy"), 0, 0);
		this.gl.uniform2f(this.p1, pt[1].getAttribute("cx"), pt[1].getAttribute("cy"), 0, 0);
		this.gl.uniform2f(this.p2, pt[2].getAttribute("cx"), pt[2].getAttribute("cy"), 0, 0);
		this.gl.uniform2f(this.p3, pt[3].getAttribute("cx"), pt[3].getAttribute("cy"), 0, 0);

		// Enviamos al buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
	}

	draw() {
		// [Completar] Dibujamos la curva como una LINE_STRIP
		// [Completar] No se olviden de hacer el binding del programa y de habilitar los atributos de los vértices

		// Seleccionamos el shader
		this.gl.useProgram(this.prog);

		// Binding del buffer de posiciones
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

		// Habilitamos el atributo
		this.gl.enableVertexAttribArray(this.t);
		this.gl.vertexAttribPointer(this.t, 1, this.gl.FLOAT, false, 0, 0);

		// Dibujamos lineas utilizando primitivas gl.LINE_STRIP
		this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.steps);
	}
}

// Vertex Shader
var curvesVS = /*glsl*/ `

	uniform mat4 mvp;

	attribute float t;
	
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	vec2 evalBezierCubic(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3)
	{
		/*
		Esta función evalúa una curva de Bezier cúbica en el punto t.
		
		Parámetros:
			t -- Parámetro de la curva de Bezier cúbica.
			p0 -- Punto de control 0.
			p1 -- Punto de control 1.
			p2 -- Punto de control 2.
			p3 -- Punto de control 3.

		Retorna:
			vec2 -- Punto sobre la curva de Bezier cúbica en el punto t.
		*/

		// Calcula x e y por separado
		// float x = pow(1.0 - t, 3.0) * p0[0] + 3.0 * pow(1.0 - t, 2.0) * t * p1[0] + 3.0 * (1.0 - t) * pow(t, 2.0) * p2[0] + pow(t, 3.0) * p3[0];
		// float y = pow(1.0 - t, 3.0) * p0[1] + 3.0 * pow(1.0 - t, 2.0) * t * p1[1] + 3.0 * (1.0 - t) * pow(t, 2.0) * p2[1] + pow(t, 3.0) * p3[1];
		// return vec2(x, y);

		// Forma más compacta, se hacen las operaciones component-wise 
		return pow(1.0 - t, 3.0) * p0 + 3.0 * pow(1.0 - t, 2.0) * t * p1 + 3.0 * (1.0 - t) * pow(t, 2.0) * p2 + pow(t, 3.0) * p3;
	}

	void main()
	{ 	
		vec2 pos = evalBezierCubic(t, p0, p1, p2, p3);
		gl_Position = mvp * vec4(pos, 0, 1);

	}
`;

// Fragment Shader
var curvesFS = /*glsl*/ `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(0,0,1,1);
	}
`;


export { CurveDrawer };
