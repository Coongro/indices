---
'@coongro/indices': minor
---

El IPC se baja solo del INDEC, y el vocabulario de la pantalla deja de ser el de la base

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
