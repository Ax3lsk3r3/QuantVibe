# QuantVibe Frontend (React 19 + TypeScript + Vite + Tailwind CSS)

Panel de telemetria y centro de control cuantitativo en tiempo real para QuantVibe.

Este proyecto utiliza **pnpm** de manera estricta y exclusiva como gestor de paquetes. El uso de npm o yarn esta desactivado por configuracion y politicas de lockfile.

## Requisitos Previos

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (recomendado v11+)

Para habilitar o instalar pnpm:
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Flujo de Trabajo con pnpm

Todos los comandos deben ejecutarse dentro de este directorio (`web/frontend`):

```bash
# Instalacion determinista de dependencias
pnpm install

# Servidor de desarrollo Vite con Hot Module Replacement (HMR) en puerto 5173
pnpm dev

# Compilacion y empaquetado de produccion (genera artefactos en web/static/)
pnpm build

# Auditoria estatica de codigo y reglas de React
pnpm lint

# Servidor de previsualizacion local de la compilacion de produccion
pnpm preview
```

## Estructura

- `src/components/`: Componentes de interfaz (Alpha Studio, Bloomberg Terminal, Pipeline Console, Order Desk, Track Record).
- `src/components/landing/`: Componentes del Showcase Institucional (KineticTitle, TextSwap, ComparisonMatrix, etc.).
- `pnpm-lock.yaml`: Registro inmutable de dependencias congeladas para reproduccion exacta en entornos CI/CD y despliegue.
