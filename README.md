# Registro de Horas Acumuladas

Calculadora web para el seguimiento de horas de vuelo y ciclos de motor.

## Módulos

- **01 · Sumadora acumulativa** — Añade tiempos (hh:mm o minutos) uno a uno con total acumulado en tiempo real. Cada entrada aparece como chip eliminable.
- **02 · Diferencia entre horas** — Calcula el tiempo entre una hora inicial y una final. Permite alternar entre formato hh:mm y minutos totales.
- **03 · Sumatorio total** — Matriz con las columnas HOURS AIRCRAFT, LANDING, ENG 1 HOURS, ENG 1 CYCLES, ENG 2 HOURS y ENG 2 CYCLES. Calcula automáticamente la fila TOTAL (BROUGHT FWD + DAY). La fila DAY autorellena los tiempos de motor al introducir el tiempo de aeronave, y ENG 2 CYCLES se copia de ENG 1 CYCLES; ambos valores son editables manualmente en cualquier momento.

## Estructura

```
index.html   # estructura
style.css    # estilos
app.js       # lógica
```

## Uso

Abre `index.html` en el navegador. No requiere instalación ni dependencias externas.
