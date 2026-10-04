# @coongro/indices

## 0.4.0

### Minor Changes

- «Cargarlos a mano» ahora hace lo que dice, y el dólar tiene su propia perilla

  La setting **«Serie del ICL»** ofrecía «Cargarla a mano» con la promesa de que sirve para
  trabajar sin internet o para controlar cada número. No hacía nada: la serie se bajaba del
  BCRA igual, y los valores cargados a mano podían quedar pisados por la descarga. Ahora se
  respeta.

  Antes no se podía respetar: elegir «manual» apagaba el automatismo sin dejar ningún lugar
  donde cargar los valores. Con la pantalla de Índices esa opción pasó a ser usable, así que
  la setting dejó de ser una trampa.

  Se suma **«Cotización del dólar»**, con la misma forma y para la misma decisión. En
  automático se busca la cotización del día al emitir un cargo de un contrato en dólares; a
  mano se usa únicamente lo cargado, y un cargo sin su cotización **no se emite** en vez de
  calcularse con la de otro día — cobrar en pesos con el dólar del martes cuando corresponde
  el del viernes es plata mal cobrada y el inquilino no tiene cómo notarlo.

  Las dos se leen del lado del servidor, no de la pantalla: quien calcula una actualización
  o emite un cargo puede ser el Copilot, y ahí no hay nadie que mire la configuración por
  él. Los defaults quedan atados al manifest por un test, así que la copia del servidor no
  puede desincronizarse en silencio.

- El IPC se baja solo del INDEC, y el vocabulario de la pantalla deja de ser el de la base

  Hasta ahora **solo el ICL** se descargaba solo, del BCRA. El IPC y Casa Propia dependían
  enteramente de que alguien cargara los valores a mano, y no había pantalla para hacerlo:
  un contrato ajustado por IPC no se podía actualizar nunca.

  El IPC sí tiene fuente oficial — la API de Series de Tiempo del Estado publica el índice
  nacional del INDEC —, así que ahora se baja solo igual que el ICL. Probado de punta a
  punta: un contrato con la serie vacía calculó su actualización con los valores reales
  (+14,58 % entre febrero y agosto de 2026).

  Para eso se fue el `if (indexCode !== 'ICL')` que ataba el bloque a un índice puntual.
  Las fuentes automáticas se declaran en una tabla —índice, organismo y cuánto antes hay
  que pedir para que exista el último valor vigente—, así que sumar una es agregar una
  fila. El que no está en esa tabla sigue siendo manual, que es lo correcto para Casa
  Propia: ese coeficiente se publica como tabla, no como serie, y no tiene API.

  Y la pantalla dejó de mostrar valores crudos de la base: `USD_OFICIAL` se lee **Dólar
  oficial**, `dolarapi` se lee **Cotización del día**, `bcra` es **BCRA**. Pasaba en las
  píldoras, en los filtros —que se arman con los valores que traen los datos, así que
  cualquier código sin etiqueta salía tal cual— y en el formulario, que tiene su propia
  lista. «De dónde salió» era además un campo de texto libre: ahora es una lista con los
  tres orígenes que escribe el sistema más «Cargado a mano».

- Los índices declaran quién puede ver cotizaciones y cargar valores

  El plugin declara sus permisos (`contributes.permissions`, generados con el Coongro Builder) y trae `src/permissions/permissions.gen.ts` con las constantes para chequearlos en código. En Coongro Standalone, cada usuario ve y hace solo lo que le permiten sus roles; el dueño, todo.

  Las vistas del Builder se regeneraron: los botones que abren una pantalla o ejecutan una acción que el rol no permite ya no se muestran. Necesita un Core con `useAccess` en el plugin-sdk (Coongro/coongro-core#687).

- El bloque estrena su primera pantalla: la serie de valores, con alta y corrección

  `indices` no tenía ninguna vista. Sus escrituras existían como acciones del repositorio y
  ninguna pantalla las llamaba, así que **no había forma de cargar un valor a mano desde el
  producto** — ni humana ni por el Copilot, que las tiene excluidas a propósito. La única vía
  era SQL.

  Eso dejaba inutilizable la mitad del bloque: solo el ICL se baja solo del BCRA. El IPC y
  Casa Propia dependen enteramente de carga manual, así que **ningún contrato ajustado por
  esos índices podía actualizarse nunca**. La pantalla de actualizaciones lo decía sin
  rodeos: «No hay valores cargados del índice casa_propia... Cargalos a mano», sin decir
  dónde.

  Ahora hay un menú **Índices** con la serie completa: qué índice, de qué fecha, cuánto y de
  dónde salió cada valor —bajado del organismo o cargado a mano—, con el último valor de cada
  índice arriba para ver si la serie llegó hasta hoy antes de que un cálculo falle por eso.
  Se carga un valor con «Cargar valor» y se corrige uno mal bajado clickeando su fila.

  Las escrituras siguen fuera del catálogo del Copilot: un valor mal cargado mueve en
  silencio la plata de todos los contratos que se calculen contra esa fecha, y corregirlo no
  alcanza — hay que volver a cotizar cada ajuste que ya lo usó.

### Patch Changes

- La fuente de un valor se guarda siempre escrita igual

  La columna `source` aceptaba cualquier texto, así que la misma fuente entraba de varias
  formas —`BCRA` por un lado, `bcra` por otro— y la píldora de la pantalla sólo reconoce
  una: el resto se mostraba crudo, con el nombre de la variable a la vista.

  Ahora se normaliza **al guardar**, no al mostrar: validarlo sólo en la pantalla deja
  afuera al Copilot y a cualquier carga por API, que es justo por donde entró. Una fuente
  que el sistema no sabe nombrar se rechaza con un mensaje que dice cuáles conoce, en vez
  de llegar hasta la pantalla.

  Se suma **Ministerio de Economía** a la lista: es quien publica el coeficiente Casa
  Propia, y ya estaba en los datos sin poder nombrarse.

## 0.3.0

### Minor Changes

- c022c26: El catálogo de capacidades del plugin, declarado en código y certificado

  Las seis capacidades de series de índices —cotización, conversión y última medición— se declaran con Action Contracts junto a su handler.

## 0.2.0

### Minor Changes

- e064095: feat: cotización del dólar para contratos pactados en moneda extranjera (COONG-275)

  `indices` ya era el único que hablaba con el mundo exterior para el ICL; ahora también trae las
  cotizaciones del dólar, con la misma regla: nadie más sale a internet.
  - `indices.fx.rate` devuelve la cotización de una casa (oficial, blue, MEP, contado con liqui,
    mayorista) para una fecha, y `indices.fx.convert` además hace la cuenta.
  - Se usa el valor de **venta**: quien debe dólares y paga en pesos tiene que comprarlos.
  - Las cotizaciones se guardan en la tabla de series, como el ICL. Un cargo emitido tiene que poder
    explicarse dentro de dos años aunque la fuente cambie el valor o desaparezca.
  - Una fecha pasada se pide al histórico y no al valor de hoy: regenerar el cargo de un mes viejo
    tiene que dar el mismo importe que dio entonces.
  - Si la cotización no se puede obtener, se lanza en vez de estimar — un importe inventado cambia lo
    que se le cobra a una persona.

- e064095: feat: series de índices y cálculo del factor de actualización (COONG-275)

  Primera versión utilizable. Trae la serie del **ICL del BCRA** (API v4.0, variable 40) y calcula el
  factor entre dos fechas para actualizar un alquiler.

  Dos decisiones que valen la pena conocer:
  - **Si el índice no está disponible para esas fechas, el cálculo falla y lo dice.** No estima ni
    interpola: un aumento sin respaldo en la serie oficial es peor que no tener el aumento.
  - **El adaptador del BCRA está aislado en un solo archivo**, porque la API ya cambió de forma dos
    veces. El resto del plugin trabaja con `{ date, value }` y no se entera.
