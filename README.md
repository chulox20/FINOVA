# 💎 FINOVA — Toma el control de tu dinero

> **Aplicación Full Stack de Finanzas Personales**  
> Diseñada para ofrecer claridad, control, estabilidad y modernidad en la gestión integral de finanzas individuales.

---

## 🏛️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────┐
│                   React + Vite (Frontend)                │
│       Tailwind CSS • Recharts • Framer Motion • Zod      │
└────────────────────────────┬─────────────────────────────┘
                             │  HTTP / REST (JSON)
                             │  Authorization: Bearer <JWT>
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Node.js + Express (Backend REST API)        │
│     JWT • bcryptjs • Zod • express-rate-limit • RBAC     │
└────────────────────────────┬─────────────────────────────┘
                             │  Pool de Conexión 'pg'
                             │  Transacciones Atómicas (ACID)
                             ▼
┌──────────────────────────────────────────────────────────┐
│               PostgreSQL Database Engine                 │
│         Esquema Relacional + Índices de Rendimiento      │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Características y Módulos Desarrollados

### 1. 🏠 Landing Page (`/`)
- Hero moderno e interactivo con el eslogan *"Tu dinero. Más claro que nunca"*.
- **Live Preview interactivo** mostrando balances, ingresos (+$4,250.00), gastos (-$2,130.00) y ahorro neto ($2,120.00).
- 6 pilares de valor: Control Total, Presupuestos Inteligentes, Metas de Ahorro, Gráficos Financieros, Multi-moneda y Seguridad Estricta.
- Sección de Garantías de Privacidad y llamadas a la acción (*CTA*).

### 2. 🔐 Autenticación & Seguridad (`/login`, `/register`, `/forgot-password`)
- Inicio de sesión con Email, Contraseña, Recordarme y Google.
- **Botones de Acceso Rápido 1-Click (Modo Demo):**
  - 👤 **Jesús (Usuario):** Acceso directo con datos financieros precargados.
  - 🛡️ **Admin Finova:** Acceso directo al panel de control y métricas globales.
- Registro con validación Zod y asignación obligatoria del rol `user` en backend.
- Recuperación de contraseña por correo.
- **Protección contra ataques de fuerza bruta**: Rate limiter de 10 intentos cada 15 minutos en rutas de autenticación.

### 3. 📊 Dashboard Principal (`/dashboard`)
- Saludo personalizado dinámico (*"Hola, Jesús 👋"*).
- Selector de período en tiempo real: **Este mes**, **Últimos 3 meses**, **Este año**.
- **Hero de Balance**: Muestra el Patrimonio Neto Consolidado con accesos rápidos para registrar movimientos o hacer transferencias.
- **4 Tarjetas KPI con variación porcentual vs mes anterior:**
  1. 📈 **Ingresos:** `+$4,250.00` (`+8.2%`)
  2. 📉 **Gastos:** `-$2,130.00` (`-4.3%`)
  3. 💰 **Ahorro Neto:** `$2,120.00` (`+12.7%`)
  4. 🥧 **Presupuesto Utilizado:** `68%` con barra de progreso reactiva.
- **Gráfica Principal (Recharts AreaChart):** Comparativa mensual de Ingresos vs Gastos con gradiente y área de ahorro sombreada.
- **Gráfica de Distribución (Recharts Donut):** Desglose porcentual de gastos por categoría (Vivienda, Alimentación, Transporte, etc.).
- **Tabla de Últimos Movimientos:** Indicadores visuales por tipo, badges coloreados y montos con formato según la moneda del usuario.
- **Banner de Alertas de Presupuesto:** Detección automática al alcanzar el 80% o superar el 100% de un límite.

### 4. 💳 Cuentas Financieras (`/accounts`)
- Gestión de cuentas de múltiples tipos:
  - 🏦 `checking` (Cuenta Corriente)
  - 🐖 `savings` (Cuenta de Ahorros)
  - 💵 `cash` (Efectivo / Billetera)
  - 💳 `credit_card` (Tarjeta de Crédito)
  - 📈 `investment` (Inversiones)
- Selector de color e icono personalizado por cuenta.
- **Modal de Transferencia Atómica entre Cuentas:** Descuenta de la cuenta de origen, suma en la cuenta de destino y crea el movimiento en una sola transacción PostgreSQL ACID.

### 5. 🔁 Movimientos & Transacciones (`/transactions`)
- Historial completo de movimientos con paginación y orden cronológico.
- **Buscador y Filtros Combinables:**
  - Búsqueda por texto en descripción o notas.
  - Filtro por tipo: Ingresos, Gastos, Transferencias o Todos.
  - Filtro por categoría.
  - Filtro por cuenta origen / destino.
  - Rango de fechas (Desde / Hasta).
  - Rango de montos (Mínimo / Máximo).
- **Exportación CSV:** Descarga el archivo estructurado `finova-movimientos.csv`.
- Modales de creación y edición con recálculo automático de balances en base de datos.

### 6. 🏷️ Categorías (`/categories`)
- **Categorías del Sistema predeterminadas:** Vivienda, Alimentación, Transporte, Salud, Educación, Entretenimiento, Compras, Viajes, Servicios, Salario, Freelance, Inversiones, etc.
- Creación de categorías personalizadas con paleta de colores y selector de iconos.

### 7. 🥧 Presupuestos (`/budgets`)
- Definición de presupuestos por categoría (ej. Alimentación $500, Transporte $250, Vivienda $900).
- Cálculo en tiempo real de lo gastado vs límite asignado vs disponible.
- **Estados visuales dinámicos:**
  - 🟢 **Normal** (`< 80%`)
  - 🟡 **Cerca del límite** (`80% - 100%`)
  - 🔴 **Excedido** (`> 100%`)
- Generación automática de notificaciones de alerta.

### 8. 🎯 Metas de Ahorro (`/goals`)
- Creación de metas con monto objetivo, fecha límite y cuenta vinculada.
- **Botón `[ + Añadir ahorro ]`**: Permite realizar aportes parciales o totales, debitando opcionalmente el balance de la cuenta bancaria en una transacción atómica.
- Historial cronológico completo de aportes por meta (`goal_contributions`).
- Días restantes calculados dinámicamente y **animación de confeti** al alcanzar el 100%.

### 9. 📈 Análisis Financiero (`/analytics`)
- **Medidor de Tasa de Ahorro**: Gráfico circular con la fórmula `(Ingresos - Gastos) / Ingresos × 100`.
- **Comparación Mensual Detallada**: Variaciones numéricas y porcentuales de Este mes vs Mes anterior.
- **Evolución 12 Meses**: Histórico anual de flujos de dinero en Recharts AreaChart.
- **Evolución del Balance Acumulado**: Progresión del patrimonio neto a través del tiempo en Recharts LineChart.
- Descarga de reportes en CSV.

### 10. 📅 Calendario Financiero (`/calendar`)
- Vista mensual interactiva en cuadrícula.
- Etiquetas de ingresos y gastos diarios (ej. `22: -$82.00`, `21: +$3,500.00`).
- **Drawer Lateral Interactivo**: Al hacer clic en cualquier día, abre el detalle de movimientos de esa fecha y permite registrar nuevas transacciones en ese día específico.

### 11. 👤 Perfil & Preferencias (`/profile`)
- Selección de avatar de usuario.
- Información personal: Nombre, email, teléfono.
- **Selector de Moneda Principal**: USD ($), EUR (€), VES (Bs.), GBP (£).
- Preferencias de formato decimal (`punto .` o `coma ,`) y primer día de la semana (`Lunes` o `Domingo`).

### 12. ⚙️ Configuración (`/settings`)
- **Selector de Apariencia**: Claro (Light), Oscuro (Dark) y Sistema (Auto).
- **Control de Notificaciones**: Toggles independientes para Alertas de Presupuesto, Metas de Ahorro y Resumen Semanal por Email.
- **Seguridad**: Solicitud de cambio de contraseña y estado de sesiones activas.
- **Copia de Seguridad**: Descarga íntegra de datos.

### 13. 🛡️ Panel de Administración (`/admin`)
- Protegido por middleware de autorización `requireRole('admin')`.
- **Métricas Reales en PostgreSQL:**
  - Total de usuarios registrados.
  - Usuarios activos en los últimos 30 días (medido con `last_seen_at`).
  - Total de transacciones procesadas en base de datos.
  - Cuentas bancarias creadas.
  - Metas de ahorro completadas al 100%.
  - Estado del servidor ("Operativo") y motor de base de datos.
- **Gestión de Categorías Predeterminadas**: Permite a los administradores crear, editar y eliminar categorías base globales (`user_id = NULL`).
- **Aislamiento Estricto de Privacidad**: El panel de administración no expone balances ni transacciones privadas individuales de los usuarios.

---

## 🗄️ Modelo de Base de Datos (PostgreSQL)

```sql
users (id, full_name, email, password_hash, avatar_url, role, currency, last_seen_at, created_at, updated_at)
  │
  ├── accounts (id, user_id, name, type, balance, currency, color, icon, created_at, updated_at)
  │     │
  │     └── transactions (id, user_id, account_id, to_account_id, category_id, type, description, amount, transaction_date, notes)
  │
  ├── categories (id, user_id, name, type, color, icon, is_default, created_at)
  │     │
  │     └── budget_categories (id, budget_id, category_id, limit_amount)
  │
  ├── budgets (id, user_id, name, period, amount, start_date, end_date, created_at)
  │     │
  │     └── budget_categories
  │
  ├── goals (id, user_id, name, target_amount, current_amount, deadline, account_id, color, icon, status)
  │     │
  │     └── goal_contributions (id, goal_id, user_id, amount, contribution_date, note, created_at)
  │
  └── notifications (id, user_id, type, title, message, is_read, created_at)
```

### Transacciones ACID Atómicas (`BEGIN ... COMMIT / ROLLBACK`):
- **Creación de Gasto/Ingreso**: Actualiza el balance de la cuenta e inserta la transacción en una sola operación atómica.
- **Transferencias entre Cuentas**: Descuenta de la cuenta origen, suma a la cuenta destino y registra el movimiento de forma atómica.
- **Edición de Movimiento**: Revierte el impacto anterior y aplica el nuevo impacto en un único bloque de transacción.
- **Eliminación de Movimiento**: Restaura el balance original y elimina la transacción de forma consistente.
- **Aportes a Metas**: Suma a la meta, descuenta de la cuenta vinculada y registra la transacción atómicamente.

---

## 🔌 Referencia de Endpoints REST API

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevo usuario (Zod + bcrypt) | Público |
| `POST` | `/api/auth/login` | Inicio de sesión y entrega de JWT (Rate Limited) | Público |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | JWT Requerido |
| `PUT` | `/api/auth/profile` | Actualiza datos y preferencias del perfil | JWT Requerido |
| `POST` | `/api/auth/change-password` | Actualiza la contraseña del usuario | JWT Requerido |
| `POST` | `/api/auth/forgot-password` | Solicita restablecimiento de contraseña | Público |
| `GET` | `/api/accounts` | Lista todas las cuentas del usuario | JWT Requerido |
| `POST` | `/api/accounts` | Crea una nueva cuenta bancaria / billetera | JWT Requerido |
| `PUT` | `/api/accounts/:id` | Actualiza nombre, tipo o color de cuenta | JWT Requerido |
| `DELETE` | `/api/accounts/:id` | Elimina una cuenta bancaria | JWT Requerido |
| `POST` | `/api/accounts/transfer` | **Transferencia atómica de fondos entre cuentas** | JWT Requerido |
| `GET` | `/api/transactions` | Lista movimientos con filtros y búsqueda | JWT Requerido |
| `POST` | `/api/transactions` | **Crea movimiento y actualiza balance atómicamente** | JWT Requerido |
| `PUT` | `/api/transactions/:id` | **Edita movimiento y recalcula saldos atómicamente** | JWT Requerido |
| `DELETE` | `/api/transactions/:id` | **Elimina movimiento y restaura saldos atómicamente** | JWT Requerido |
| `GET` | `/api/transactions/export` | Genera y descarga reporte en formato CSV | JWT Requerido |
| `GET` | `/api/categories` | Lista categorías base y personalizadas | JWT Requerido |
| `POST` | `/api/categories` | Crea una categoría personalizada | JWT Requerido |
| `PUT` | `/api/categories/:id` | Actualiza categoría personalizada | JWT Requerido |
| `DELETE` | `/api/categories/:id` | Elimina categoría personalizada | JWT Requerido |
| `GET` | `/api/budgets` | Lista presupuestos con cálculo de gasto y alertas | JWT Requerido |
| `POST` | `/api/budgets` | Crea presupuesto con límites por categoría | JWT Requerido |
| `PUT` | `/api/budgets/:id` | Actualiza presupuesto y límites | JWT Requerido |
| `DELETE` | `/api/budgets/:id` | Elimina presupuesto | JWT Requerido |
| `GET` | `/api/goals` | Lista metas con progreso e historial de aportes | JWT Requerido |
| `POST` | `/api/goals` | Crea una nueva meta de ahorro | JWT Requerido |
| `PUT` | `/api/goals/:id` | Actualiza meta de ahorro | JWT Requerido |
| `DELETE` | `/api/goals/:id` | Elimina meta de ahorro | JWT Requerido |
| `POST` | `/api/goals/:id/contribute` | **Añade aporte a meta y debita de cuenta atómicamente** | JWT Requerido |
| `GET` | `/api/analytics/summary` | KPIs financieros (Ingresos, Gastos, Ahorro, Variaciones %) | JWT Requerido |
| `GET` | `/api/analytics/evolution` | Serie de datos de 12 meses para Recharts | JWT Requerido |
| `GET` | `/api/analytics/distribution` | Agregación de gastos por categoría para Donut Chart | JWT Requerido |
| `GET` | `/api/calendar` | Agrupación diaria de movimientos para calendario mensual | JWT Requerido |
| `GET` | `/api/notifications` | Lista notificaciones y alertas | JWT Requerido |
| `PUT` | `/api/notifications/:id/read`| Marca notificación como leída | JWT Requerido |
| `PUT` | `/api/notifications/read-all` | Marca todas las notificaciones como leídas | JWT Requerido |
| `GET` | `/api/admin/metrics` | Métricas reales agregadas del sistema | Admin Requerido |
| `GET` | `/api/admin/users` | Listado de usuarios registrados | Admin Requerido |
| `GET` | `/api/admin/categories` | Categorías base del sistema (`user_id = NULL`) | Admin Requerido |
| `POST` | `/api/admin/categories` | Crea categoría base para todos los usuarios | Admin Requerido |
| `PUT` | `/api/admin/categories/:id` | Actualiza categoría base del sistema | Admin Requerido |
| `DELETE` | `/api/admin/categories/:id` | Elimina categoría base del sistema | Admin Requerido |
| `GET` | `/api/health` | Estado de operatividad del backend | Público |

---

## 🚀 Guía de Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/chulox20/FINOVA.git
cd FINOVA
```

### 2. Poner en marcha el Backend
```bash
cd backend
npm install
```

Configura tu archivo `backend/.env` (o usa los valores por defecto):
```env
PORT=4000
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/finova_db
JWT_SECRET=finova_production_jwt_super_secret_key_2026_finance_secure
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Ejecutar el servidor backend:
```bash
npm run dev
```

> **⚡ Resiliencia Cero-Configuración:**  
> Si tienes PostgreSQL corriendo en tu máquina, el backend conectará directamente y ejecutará las migraciones. Si no tienes PostgreSQL instalado o activo en el puerto 5432, el backend activará automáticamente su **motor en memoria precargado** con datos reales para que puedas probar la aplicación de inmediato sin fallas.

### 3. Poner en marcha el Frontend
En otra pestaña de la terminal:
```bash
cd ../frontend
npm install
npm run dev
```

Abre tu navegador en: **[http://localhost:5173/](http://localhost:5173/)**

---

## 👥 Credenciales de Prueba

- **👤 Usuario Estándar:**
  - **Email:** `jesus@finova.app`
  - **Contraseña:** `password123`
- **🛡️ Administrador:**
  - **Email:** `admin@finova.app`
  - **Contraseña:** `admin123`

---

## 🛠️ Scripts Útiles del Proyecto

En el directorio raíz:
- `npm run dev:backend` — Inicia el servidor de backend con Nodemon en el puerto 4000.
- `npm run dev:frontend` — Inicia el servidor de desarrollo de Vite en el puerto 5173.
- `npm run build:frontend` — Compila el frontend para producción.
- `npm run install:all` — Instala las dependencias de frontend y backend en un solo paso.

---

## 📱 Responsividad y Accesibilidad

- **🖥️ Desktop:** Barra lateral expandida, tablas completas, gráficos Recharts con tooltips personalizados y modales accesibles.
- **💻 Tablet:** Barra lateral compacta con tooltips flotantes y cuadrículas auto-ajustables.
- **📱 Mobile:** Barra de navegación inferior fija (*BottomNav*) con botón central flotante de registro rápido `(+)`.
- **🌙 Soporte Dark Mode:** Totalmente integrado con selector de temas (Claro, Oscuro, Sistema) y persistencia en `localStorage`.

---

## 📄 Licencia

Desarrollado con dedicación para el control inteligente de finanzas personales.  
**FINOVA** — *"Toma el control de tu dinero."*
