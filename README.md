# Trabajo Práctico 1 - LTD - UTDT

El objetivo del trabajo es desplazar un cubo siguiendo la trayectoria de una curva de bezier, mientras gira sobre su eje vertical También se espera que la curva se renderice usando webgl, se provee una vista previa hecha con CSS para entender si el rendering hecho a mano es correcto.

El cubo, al igual que en las clases, ocupa el espacio [-1, 1]³

Un orden posible para lograr los objetivos es el siguiente

✅ Hacer visible el cubo entero por medio de alguna matriz de proyección y desplazamiento

✅ Hacerlo girar sobre el eje vertical en función del tiempo de ejecución

✅ Dibujar la curva de bezier con shaders, construyendola con varios segmentos lineales. Las rectas que conectan los puntos de control de la curva sirven de referencia.

✅ Desplazar el cubo verticalmente según la bezier usando el tiempo de ejecución como parámetro

✅ Cambiar la proyección a una de perspectiva, para poder visualizar los desplazamientos en profundidad

✅ (Opcional) Variar la posición del cubo en el eje Z según el tiempo de ejecución para chequear que la proyección en perspectiva funcione

✅ Desplazar el cubo sobre el eje Z según la curva de bezier usando el tiempo de ejecución como parámetro

✅ Hacer que la animación rebote al final y principio de la curva, cambiando como se utiliza el tiempo de ejecución como parámetro
