# vendor/

Código de terceros incluido en el repo para facilitar la instalación.

## dump_bin.py

Fuente: [microsoft/qlib](https://github.com/microsoft/qlib/blob/main/scripts/dump_bin.py)
(`scripts/dump_bin.py`, rama `main`, agosto 2026).

El wheel de PyPI (`pyqlib`) no incluye el paquete `qlib.scripts`, así que vendemos este
archivo para poder convertir CSVs al formato binario de Qlib sin clonar su repo.
Se ejecuta como subproceso desde `qlib_side/prepare_data.py` vía su CLI `fire`.

Licencia original: MIT (c) Microsoft Corporation — ver LICENSE en su repositorio.
