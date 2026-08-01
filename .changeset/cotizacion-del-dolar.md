---
'@coongro/indices': minor
---

feat: cotización del dólar para contratos pactados en moneda extranjera (COONG-275)

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
