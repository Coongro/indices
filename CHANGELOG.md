# @coongro/indices

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
