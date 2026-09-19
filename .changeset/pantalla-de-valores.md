---
'@coongro/indices': minor
---

El bloque estrena su primera pantalla: la serie de valores, con alta y corrección

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
