---
'@coongro/indices': minor
---

feat: series de índices y cálculo del factor de actualización (COONG-275)

Primera versión utilizable. Trae la serie del **ICL del BCRA** (API v4.0, variable 40) y calcula el
factor entre dos fechas para actualizar un alquiler.

Dos decisiones que valen la pena conocer:

- **Si el índice no está disponible para esas fechas, el cálculo falla y lo dice.** No estima ni
  interpola: un aumento sin respaldo en la serie oficial es peor que no tener el aumento.
- **El adaptador del BCRA está aislado en un solo archivo**, porque la API ya cambió de forma dos
  veces. El resto del plugin trabaja con `{ date, value }` y no se entera.
