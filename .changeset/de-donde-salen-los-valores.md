---
'@coongro/indices': minor
---

«Cargarlos a mano» ahora hace lo que dice, y el dólar tiene su propia perilla

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
