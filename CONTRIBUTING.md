# Contribuir a QuantVibe

¡Gracias por el interés! Reglas cortas para mantener el proyecto sano.

## Cómo reportar

- **Bugs**: abre un issue con la plantilla de bug (comando, salida completa, entorno).
- **Ideas**: plantilla de funcionalidad; explica el problema antes que la solución.
- **Vulnerabilidades**: NUNCA en issues públicos — ver [SECURITY.md](SECURITY.md).

## Antes de proponer código

1. Haz fork y crea una rama descriptiva: `git checkout -b fix/nombre-del-arreglo`.
2. Asegúrate de pasar en local lo mismo que exige la CI:

   ```powershell
   pip install ruff pandas numpy coverage
   ruff check .
   coverage run --include="*/bridge/signal_store.py,*/bridge/track_record.py,*/qlib_side/evaluate.py" -m unittest discover -s tests
   ```

3. Los mensajes de commit en español, imperativo: `agrega X`, `corrige Y`.
4. Si tocas el contrato de señales (`bridge/signal_store.py`), suma tests nuevos;
   es la pieza más sensible del sistema.
5. Código nuevo sin comentarios innecesarios: los nombres deben explicarse solos.

## Convenciones del repo

- Documentación y mensajes al usuario: español.
- Identificadores y claves JSON de datos: inglés (contrato legible por máquinas).
- Todo cambio visible va al `CHANGELOG.md`.

## El guardiaíla sagrado

Cualquier cambio que facilite enviar órdenes reales debe mantener las DOS barreras
(`--submit` + `VIBE_ALLOW_ORDERS=1`). Un PR que las debilite se rechaza por diseño.
