# 💎 FINOVA — Toma el control de tu dinero

> **Aplicación Full Stack de Finanzas Personales**  
> Diseñada para darte claridad, control, estabilidad y modernidad en tus decisiones financieras.

---

## 🏛️ Arquitectura del Sistema

```
React + Vite (Frontend)
       ↓
REST API (JSON + JWT Bearer)
       ↓
Node.js + Express
       ↓
PostgreSQL (Transacciones ACID con pool 'pg')
```

### Seguridad y Tecnologías Clave:
- **Autenticación**: JSON Web Tokens (JWT) + contraseñas cifradas con `bcryptjs`.
- **Validación**: Esquemas rigurosos y tipados con `Zod` tanto en Frontend como en Backend.
- **Protección**: `express-rate-limit` (10 intentos / 15 min en endpoints de autenticación, 200 req/min general).
- **Control de Acceso (RBAC)**: Middleware de autenticación (`requireAuth`) y roles (`requireRole('admin')`).
- **Integridad Financiera ACID**: PostgreSQL es la autoridad exclusiva de los balances. Todas las mutaciones de saldo, transferencias entre cuentas y abonos a metas se ejecutan en bloques transaccionales atómicos (`BEGIN ... COMMIT / ROLLBACK`).

---

## 📁 Estructura del Repositorio

```
FINOVA/
│
├── frontend/                     # React + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/           # UI Kit, modales, gráficos y layouts
│   │   ├── contexts/             # AuthContext (JWT), FinanceContext, ThemeContext
│   │   ├── pages/                # Home, Dashboard, Accounts, Transactions, etc.
│   │   ├── services/             # apiClient.js y conectores REST API
│   │   ├── utils/                # Cálculos financieros, formateo de monedas y fechas
│   │   └── styles/               # Directivas Tailwind y estilos globales
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express + PostgreSQL REST API
│   ├── src/
│   │   ├── config/               # Validador estricto de variables de entorno con Zod
│   │   ├── controllers/          # Controladores HTTP
│   │   ├── db/                   # Pool de conexión, schema.sql, migrate.js y seed.js
│   │   ├── middleware/           # authMiddleware, roleMiddleware, rateLimiter, errorHandler
│   │   ├── routes/               # Rutas modulares montadas en /api
│   │   ├── services/             # Lógica de negocio y transacciones PostgreSQL ACID
│   │   ├── validators/           # Validadores Zod de solicitudes
│   │   └── server.js             # Entrada del servidor Express
│   ├── package.json
│   └── .env.example
│
└── package.json                  # Scripts raíz para ejecución del monorepo
```

---

## 🗄️ Modelo de Datos (PostgreSQL)

Tablas principales definidas en `backend/src/db/schema.sql`:

1. **`users`**: `id` (UUID), `full_name`, `email` (UNIQUE), `password_hash`, `avatar_url`, `role` (`user` / `admin`), `currency` (`USD`, `EUR`, `VES`, `GBP`), `last_seen_at`, `created_at`, `updated_at`.
2. **`accounts`**: `id`, `user_id`, `name`, `type` (`checking`, `savings`, `cash`, `credit_card`, `investment`), `balance` (NUMERIC), `currency`, `color`, `icon`.
3. **`categories`**: `id`, `user_id` (NULL para categorías base del sistema), `name`, `type` (`income`, `expense`, `both`), `color`, `icon`, `is_default`.
4. **`transactions`**: `id`, `user_id`, `account_id`, `to_account_id` (transferencias), `category_id`, `type` (`income`, `expense`, `transfer`), `description`, `amount`, `transaction_date`, `notes`.
5. **`budgets`**: `id`, `user_id`, `name`, `period` (`monthly`, `weekly`, `yearly`, `custom`), `amount`, `start_date`, `end_date`.
6. **`budget_categories`**: `id`, `budget_id`, `category_id`, `limit_amount`.
7. **`goals`**: `id`, `user_id`, `name`, `target_amount`, `current_amount`, `deadline`, `account_id`, `color`, `icon`, `status` (`active`, `completed`, `cancelled`).
8. **`goal_contributions`**: `id`, `goal_id`, `user_id`, `amount`, `contribution_date`, `note`.
9. **`notifications`**: `id`, `user_id`, `type` (`budget`, `goal`, `system`, `security`), `title`, `message`, `is_read`.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/chulox20/FINOVA.git
cd FINOVA
```

### 2. Configurar el Backend
```bash
cd backend
cp .env.example .env
npm install
```

Configura tu base de datos en `backend/.env`:
```env
PORT=4000
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/finova_db
JWT_SECRET=tu_clave_secreta_jwt_minimo_16_caracteres
FRONTEND_URL=http://localhost:5173
```

Ejecutar migraciones y datos de prueba:
```bash
npm run migrate
npm run seed
```

Iniciar el servidor de backend:
```bash
npm run dev
```

### 3. Configurar el Frontend
En otra terminal:
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Usuarios de Prueba (Seed)

- **👤 Usuario Estándar**:
  - Email: `jesus@finova.app`
  - Contraseña: `password123`
- **🛡️ Administrador Finova**:
  - Email: `admin@finova.app`
  - Contraseña: `admin123`

---

## 📄 Licencia

Desarrollado con dedicación para el control inteligente de finanzas personales.
FINOVA — *"Toma el control de tu dinero."*
