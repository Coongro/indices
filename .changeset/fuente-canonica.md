---
'@coongro/indices': patch
---

La fuente de un valor se guarda siempre escrita igual

La columna `source` aceptaba cualquier texto, así que la misma fuente entraba de varias
formas —`BCRA` por un lado, `bcra` por otro— y la píldora de la pantalla sólo reconoce
una: el resto se mostraba crudo, con el nombre de la variable a la vista.

Ahora se normaliza **al guardar**, no al mostrar: validarlo sólo en la pantalla deja
afuera al Copilot y a cualquier carga por API, que es justo por donde entró. Una fuente
que el sistema no sabe nombrar se rechaza con un mensaje que dice cuáles conoce, en vez
de llegar hasta la pantalla.

Se suma **Ministerio de Economía** a la lista: es quien publica el coeficiente Casa
Propia, y ya estaba en los datos sin poder nombrarse.
