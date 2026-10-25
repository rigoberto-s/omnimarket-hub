# OmniMarket Operations Hub

Panel de operaciones para un e-commerce: indicadores de ventas, gestión de pedidos y productos, y un tablero Kanban con arrastrar y soltar para mover pedidos entre estados.

- **Producción:** https://omnimarket-hub-one.vercel.app
- **Repositorio:** https://github.com/rigoberto-s/omnimarket-hub

## Endpoints de auditoría (`/api/test/*`)

Estos endpoints son **públicos a propósito**, por requisito de la rúbrica: el evaluador puede llamarlos sin iniciar sesión. Trabajan solo con el conjunto de datos de prueba.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/test/analytics?page=1&limit=50` | KPIs, ventas por día (últimos 30 días) y pedidos paginados, más recientes primero. Incluye `elapsedMs`. |
| `POST` | `/api/test/reset-data` | Restaura los datos de prueba: 20 productos y 300 pedidos. El pedido `id = 1` queda siempre en `pending`. |
| `GET` | `/api/test/kanban-status?orderId=1` | Estado actual de un pedido: `{ orderId, status, updatedAt }`. Sin `orderId` devuelve el conteo por estado. |

```bash
# Analítica y tiempo de respuesta
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" \
  "https://omnimarket-hub-one.vercel.app/api/test/analytics?page=1&limit=50"

# Restaurar los datos de prueba
curl -s -X POST https://omnimarket-hub-one.vercel.app/api/test/reset-data

# Estado de un pedido
curl -s "https://omnimarket-hub-one.vercel.app/api/test/kanban-status?orderId=1"
```

Parámetros inválidos (por ejemplo `limit=500`) responden `400` con `{ "error", "issues" }`. Todos los montos viajan en **centavos** (enteros).

## Funcionalidades

- **Inicio de sesión** con Google y GitHub (OAuth 2.0, Auth.js). Las páginas y la API privada exigen sesión.
- **Dashboard:** ventas totales, número de pedidos, ticket promedio, margen bruto y gráfica de ventas por día.
- **Pedidos:** tabla con filtros por estado y cliente, creación de pedidos y **edición en lote** del estado.
- **Kanban:** cuatro columnas (`pending` → `preparing` → `shipped` → `delivered`) con arrastrar y soltar y actualización optimista; si el servidor falla, el cambio se revierte.
- **Productos:** alta, edición y borrado (no se puede borrar un producto con pedidos).
- Estados de carga con *skeletons* y avisos con *toasts*.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Estilos y UI | Tailwind CSS 4, shadcn/ui, Recharts, Sonner |
| Datos en el cliente | TanStack Query, dnd-kit |
| Base de datos | PostgreSQL en Neon, Drizzle ORM |
| Autenticación | Auth.js v5 (Google y GitHub), sesión JWT |
| Validación | Zod (esquemas compartidos entre API y formularios) |
| Pruebas | Vitest (unitarias), Playwright (E2E) |
| CI/CD y hosting | GitHub Actions, Vercel |

## Correrlo en local

Requisitos: **Node.js 22.13 o superior** y una base PostgreSQL (usamos Neon).

```bash
git clone https://github.com/rigoberto-s/omnimarket-hub.git
cd omnimarket-hub
npm ci
cp .env.example .env.local   # y completa los valores
npm run db:push              # crea las tablas
npm run db:seed              # carga 20 productos y 300 pedidos
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL. En Neon, usar la *pooled* (host con `-pooler`) y `?sslmode=require`. |
| `AUTH_SECRET` | Firma las sesiones. Generar con `npx auth secret` o `openssl rand -base64 32`. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Credenciales OAuth de Google. |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Credenciales OAuth de GitHub. |
| `ENABLE_TEST_LOGIN` | `true` habilita el acceso de prueba que usan las pruebas E2E. **Nunca** activarlo en producción. |
| `NEXT_PUBLIC_USE_MOCKS` | Opcional. `true` hace que el frontend use datos de ejemplo en lugar de la API. |

`.env.local` nunca se sube a Git; `.env.example` sí, sin valores.

## Pruebas

```bash
npm run test:unit   # 12 pruebas unitarias (Vitest)
npm run test:e2e    # 3 flujos E2E (Playwright)
```

- **Unitarias** (`tests/unit/`): métricas (ticket promedio, margen bruto), formato de moneda, esquemas Zod, filtros y paginación.
- **E2E** (`tests/e2e/`): autenticación y redirección de rutas privadas, creación de un pedido, y arrastre de una tarjeta en el Kanban. Cada prueba empieza llamando a `POST /api/test/reset-data`.

Antes de la primera ejecución de E2E: `npx playwright install chromium`. Las E2E borran y recrean los datos: córrelas solo contra una base de desarrollo, nunca contra la de producción.

## CI/CD

El flujo de GitHub Actions (`.github/workflows/ci.yml`) corre en cada Pull Request y en cada push a `main`: lint, pruebas unitarias, build y pruebas E2E sobre un PostgreSQL propio del CI. El despliegue a Vercel solo se ejecuta si todas las pruebas pasan.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Crea o actualiza las tablas según `src/db/schema.ts` |
| `npm run db:seed` | Borra y recrea los datos de prueba |
| `npm run test:unit` / `npm run test:e2e` | Pruebas unitarias / E2E |

## Estructura

```
src/
  app/
    (app)/            dashboard, orders, kanban, products (requieren sesión)
    login/            pantalla de inicio de sesión
    api/              analytics, orders, products, auth, test/*
  components/         UI (shadcn/ui), layout, dashboard, pedidos
  db/                 esquema Drizzle, conexión y seed
  hooks/              hooks de TanStack Query
  lib/                schemas (Zod), metrics, format, services, api, types
  mocks/              datos de ejemplo para el frontend
scripts/seed.ts       carga los datos de prueba
tests/unit, tests/e2e
```

## Equipo

- **Rigoberto Sánchez**: base de datos, seed, núcleo compartido, endpoints de analítica y auditoría, pruebas unitarias y despliegue.
- **Alejandro**: autenticación, API de pedidos y productos, pruebas E2E y CI.
- **Ricardo**: interfaz (dashboard, pedidos, Kanban y productos).
