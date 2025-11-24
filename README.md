# Laboratorio - Escalamiento en Azure con Azure Functions

## Escuela Colombiana de Ingeniería

### Arquitecturas de Software - ARSW

### Autores:

1. María Paula Sánchez Macías

2. Juan Esteban Medina Rivas

---

## Parte 1: Creación de Function App

> Creamos una Function App desde el portal de Azure con las siguientes configuraciones:

<img src="images/1.config1.png">

<img src="images/1.config2.png">

**Configuración utilizada:**

- **Suscripción:** Azure for Students
- **Grupo de recursos:** SCALABILITY_LAB_II
- **Nombre:** FunctionProjectFibonacci
- **Región:** Canada Central
- **Runtime stack:** Node.js
- **Versión:** 22 LTS
- **Plan:** Consumption (Serverless)

---

## Parte 2 y 3 : Instalación de extensión Azure Functions y Despliegue de la función Fibonacci

> Instalamos la extensión de Azure Functions para Visual Studio Code desde el marketplace.

> Desplegamos la función Fibonacci a Azure usando Visual Studio Code. Al hacer el despliegue por primera vez, el sistema nos pidió autenticarnos.

---

## Parte 4: Pruebas de la función en Azure Portal

> Nos dirigimos al portal de Azure y probamos la función con diferentes valores:

### Prueba con nth=10

<img src="images/2.ejecucion-fibonacci=10.png">

**Resultado:**

<img src="images/2.ejecucion-fibonacci=10-res.png">

**Tiempo:** 65ms

### Prueba con nth=1000000

<img src="images/2.ejecucion-fibonacci=1000000.png">

**Resultado:**

<img src="images/2.ejecucion-fibonacci=1000000-res.png">

**Tiempo:** 6035ms

**Observación:** Para valores grandes, el tiempo de ejecución aumenta considerablemente debido a la complejidad del algoritmo iterativo.

---

## Parte 5: Pruebas de concurrencia con Newman

> Modificamos la colección de Postman con Newman para enviar 10 peticiones concurrentes.

### Configuración del archivo de prueba

<img src="images/3.fib-test.png">

### Ejecución de pruebas concurrentes

> Ejecutamos las pruebas con el comando:

```powershell
1..10 | ForEach-Object { Start-Job { newman run fib-test.json } }
```

<img src="images/3.req-concurrente.png">

### Métricas obtenidas

<img src="images/3.graficas.png">

<img src="images/3.graficas2.png">

**Resultados observados:**

- **Total de ejecuciones:** 20 peticiones
- **Ejecuciones exitosas:** 20 (100% de éxito)
- **Ejecuciones fallidas:** 0
- **HTTP 2xx:** 20 (todas las peticiones respondieron con código 200)

### Consumo de CPU

<img src="images/3.cpu-promedio.png">

<img src="images/3.cpu-promedio2.png">

**Análisis del consumo de CPU:**

- El CPU se mantuvo consistentemente **por debajo del 0.2%** durante todas las pruebas
- **CPU Máximo observado:** 0.17% (durante las pruebas de carga con Newman)
- **CPU Promedio:** ~0.1%
- El sistema cumplió ampliamente con el requisito de no superar el **70% de CPU**

**Conclusión del punto 5:**
El sistema manejó correctamente las 10 peticiones concurrentes sin problemas de rendimiento. El consumo de CPU fue extremadamente bajo (máximo 0.17%), muy por debajo del límite establecido del 70%. Esto indica que la arquitectura serverless de Azure Functions escaló adecuadamente para manejar la carga sin estrés en los recursos del sistema.

---

## Parte 6: Función con Memoization

> Creamos una nueva función llamada FibonacciMemo que implementa el cálculo de Fibonacci usando recursión con memoization.

<img src="images/4.fibonacci-fibonaccimemo.png">

<img src="images/5.run-fibonaccimemo.png">

<img src="images/5.run-fibonaccimemo2.png">

**Tiempo de ejecución:** 29ms

### Segunda ejecución (después de aproximadamente 1.5 minutos)

**Tiempo de ejecución:** 3ms

La memoization solo es efectiva dentro del ciclo de vida de una instancia
específica. Para un caché persistente y compartido, se requeriría un servicio
externo como Azure Cache for Redis.

**Análisis del comportamiento:**

La función con memoization mostró una mejora significativa en el rendimiento después de la primera ejecución (de 29ms a 3ms). El caché en memoria se mantuvo activo incluso después de 10 minutos de inactividad, lo que indica que la instancia de Azure Functions se mantuvo "caliente" (warm).

**¿Por qué la memoization funcionó en nuestro caso?**
La instancia de la función permaneció activa (warm) durante nuestras pruebas, manteniendo el caché global `memo` en memoria entre invocaciones.

**¿Cuándo puede fallar la memoization en Azure Functions?**

1. Después de aproximadamente 20 minutos de inactividad completa, Azure "enfría" la instancia y el caché se pierde por completo.

2. Múltiples instancias. Cada instancia tiene su propio caché separado que no se comparte con las demás.

3. Cualquier despliegue, actualización o fallo del sistema reinicia las instancias, perdiendo toda la memoria cache.

---

## Preguntas

### ¿Qué es un Azure Function?

Es un servicio de cómputo serverless que permite ejecutar código bajo demanda sin gestionar servidores ni infraestructura. Escala automáticamente según la carga, y se activa a través de triggers como HTTP, colas o incluso timers.

### ¿Qué es serverless?

Serverless es un modelo donde el proveedor de nube administra toda la infraestructura, incluyendo escalamiento, disponibilidad y ejecución.
El usuario solo escribe el código y paga únicamente por el tiempo real de ejecución.

### ¿Qué es el runtime y qué implica seleccionarlo al momento de crear el Function App?

El runtime es el entorno de ejecución que utiliza la Function App, como Node.js, Python, .NET o Java. Este entorno define el lenguaje permitido, las librerías disponibles, la compatibilidad con el sistema operativo, las versiones soportadas y el modo en que se ejecuta y gestiona el ciclo de vida de la función. Seleccionarlo de manera adecuada es importante porque la Function App solo puede ejecutar código que sea compatible con ese runtime.

### ¿Por qué es necesario crear un Storage Account de la mano de un Function App?

Porque Azure Functions utiliza este recurso para almacenar la configuración interna del host, manejar las operaciones internas del runtime, guardar registros y diagnósticos y, en general, asegurar el correcto funcionamiento y la sincronización del entorno. Sin un Storage Account, la Function App no puede inicializarse ni operar.

### ¿Cuáles son los tipos de planes para un Function App?, ¿En qué se diferencian?, mencione ventajas y desventajas de cada uno de ellos.

El Consumption Plan opera bajo un modelo completamente serverless. Permite el escalamiento automático y solo genera costos cuando la función se ejecuta, lo que lo convierte en la opción más eficiente para cargas de trabajo irregulares. Su principal desventaja es la presencia de cold start y el límite de tiempo por ejecución.

El Premium Plan elimina el cold start gracias a que mantiene instancias siempre activas. Además, ofrece mayor capacidad de memoria y tiempos de ejecución ilimitados, lo que permite manejar cargas más exigentes. Su desventaja es que tiene un costo más elevado, incluso en momentos en los que no existen solicitudes.

El Dedicated (App Service Plan) resulta útil cuando se desea combinar Functions con aplicaciones web dentro del mismo App Service. Tampoco presenta cold start y permite un control más estable de los recursos. No obstante, se factura independientemente del uso, por lo que no es la opción más eficiente para funciones que se ejecutan esporádicamente.

### ¿Por qué la memoization falla o no funciona de forma correcta?

La memoization puede fallar en Azure Functions porque el entorno no garantiza que la memoria en RAM permanezca disponible. Las instancias pueden reciclarse cuando Azure “enfría” la Function tras un periodo sin actividad, lo que elimina cualquier dato almacenado en memoria. Además, durante el escalamiento horizontal, cada instancia creada mantiene su propio caché independiente, sin sincronización entre ellas, lo que provoca resultados inconsistentes. También eventos como despliegues, errores o reinicios del host borran por completo el contenido en memoria, impidiendo que la memoization sea confiable en escenarios donde la infraestructura es dinámica.

### ¿Cómo funciona el sistema de facturación de las Function App?

_Consumption Plan_\
En este modelo se cobra únicamente por el uso real de la Function App. La facturación se basa en la cantidad de ejecuciones y en el tiempo de ejecución medido en GB-segundos. Además, incluye un nivel gratuito mensual que ofrece 400.000 GB-segundos y un millón de ejecuciones sin costo.

_Premium Plan_\
En este plan el cobro se centra en las instancias pre-calentadas que permanecen disponibles para evitar cold start. No existe nivel gratuito y el costo es mayor debido a que se paga por la capacidad reservada, independientemente del número de ejecuciones.

_Dedicated (App Service Plan)_\
Aquí la facturación corresponde a las instancias del App Service asignadas, se usen o no las funciones. El costo no depende del número de ejecuciones ni del tiempo de ejecución, sino de los recursos provisionados dentro del plan.
