# 💎 FINOVA — Toma el control de tu dinero

> **Aplicación Full Stack de Finanzas Personales**  
> Diseñada para darte claridad, control, estabilidad y modernidad en tus decisiones financieras.

---

## 🚀 Tecnologías & Stack

- **Frontend**:
  - React 18 / 19 + Vite
  - Tailwind CSS + PostCSS + Autoprefixer
  - Lucide React (iconografía moderna y consistente)
  - Framer Motion (animaciones y micro-interacciones)
  - Recharts (gráficos responsivos: Ingresos vs Gastos, Donut de categorías, Evolución del balance)
  - React Hook Form + Zod (validación de esquemas y formularios accesibles)
  - Date-fns (cálculos y formateos de fechas en español)
  - Canvas Confetti (celebración al completar metas de ahorro)
- **Backend & Database**:
  - Supabase
  - PostgreSQL con Row Level Security (RLS)
  - Supabase Auth (Email + Contraseña, Google OAuth, Recuperación de contraseña)
  - Procedimientos almacenados y Triggers en PostgreSQL (cálculo de balances, aportes a metas y creación de perfiles)
- **Modo Demo Offline Instantáneo**:
  - Si no se configuran credenciales de Supabase en `.env`, FINOVA se ejecuta automáticamente en **Modo Demo Local**, permitiendo explorar todas las funcionalidades inmediatamente con datos iniciales ricos y realistas.

---

## 📋 Características Principales

### 1. 🏠 Landing Page (`/`)
- Hero moderno: *"Tu dinero. Más claro que nunca."*
- Vista previa interactiva con balance total ($12,480.50), ingresos (+$4,250.00), gastos (-$2,130.00) y ahorro neto ($2,120.00).
- Beneficios clave y garantía de privacidad.
- Acceso directo para registrarse o probar la demo.

### 2. 🔐 Autenticación (`/login`, `/register`, `/forgot-password`)
- Registro con Nombre, Email y Contraseña (rol por defecto: `user`).
- Inicio de sesión con Email, Contraseña, Recordarme y Google.
- **Acceso rápido con 1-Click a modo demo:**
  - 👤 **Jesús (Usuario)**
  - 🛡️ **Admin Finova**
- Recuperación de contraseña por correo.

### 3. 📊 Dashboard Principal (`/dashboard`)
- Saludo personalizado: *"Hola, Jesús 👋"*
- Balance total consolidado con selector de período: **Este mes**, **Últimos 3 meses**, **Este año**.
- **4 Tarjetas KPI con variación porcentual:**
  1. Ingresos: `+$4,250.00` (`+8.2%`)
  2. Gastos: `-$2,130.00` (`-4.3%`)
  3. Ahorro Neto: `$2,120.00` (`+12.7%`)
  4. Presupuesto utilizado: `68%` con barra de progreso interactiva.
- **Gráfica Principal (Recharts AreaChart):** Ingresos vs Gastos mensuales con área de diferencia y gradientes.
- **Gráfica de Gastos por Categoría (Recharts Donut):** Vivienda 35%, Alimentación 20%, Transporte 15%, etc.
- **Tabla de Últimos Movimientos:** con badges de tipo, píldoras de categoría y montos coloreados.
- **Alertas de presupuesto en tiempo real:** Avisos al superar el 80% o 100% de una categoría.

### 4. 💳 Cuentas Financieras (`/accounts`)
- Creación y edición de cuentas de todo tipo:
  - `checking` (Cuenta Corriente)
  - `savings` (Cuenta de Ahorros)
  - `cash` (Efectivo / Billetera)
  - `credit_card` (Tarjeta de Crédito)
  - `investment` (Inversión)
- Balance inicial, moneda, color personalizado e icono.
- Modal de **Transferencia entre Cuentas** que sincroniza ambos saldos automáticamente.

### 5. 🔁 Movimientos & Transacciones (`/transactions`)
- Listado completo de transacciones.
- **Filtros avanzados:**
  - Búsqueda por descripción o notas.
  - Filtro por tipo (Ingreso, Gasto, Transferencia).
  - Filtro por categoría.
  - Filtro por cuenta de origen/destino.
  - Rango de fechas (Desde / Hasta).
  - Rango de montos (Mín / Máx).
- **Exportación a CSV:** Genera y descarga el archivo `finova-movimientos.csv` (`fecha,descripcion,categoria,tipo,monto,notas`).
- Modal de creación y edición con validaciones Zod.

### 6. 🏷️ Categorías (`/categories`)
- Categorías predeterminadas del sistema:
  - Vivienda, Alimentación, Transporte, Salud, Educación, Entretenimiento, Compras, Viajes, Servicios, Otros Gastos, Salario, Freelance, Inversiones, Otros Ingresos.
- Creación de categorías personalizadas con paleta de colores y selector de iconos.

### 7. 🥧 Presupuestos (`/budgets`)
- Definición de presupuestos por categoría (ej. Alimentación $500, Transporte $250, Vivienda $900).
- Cálculo en tiempo real de gastado vs límite vs disponible.
- Barras de progreso visuales con estados dinámicos:
  - 🟢 **Normal** (`<80%`)
  - 🟡 **Cerca del límite** (`80% - 100%`)
  - 🔴 **Excedido** (`>100%`)
- Banner de alertas automáticas.

### 8. 🎯 Metas de Ahorro (`/goals`)
- Creación de objetivos de ahorro (ej. *Viaje a Japón $4,000*, *Fondo de emergencia $10,000*).
- Modal **[ + Añadir ahorro ]**: permite realizar abonos parciales, vincular la cuenta origen y registrar notas.
- Barra de progreso porcentual y conteo de días restantes.
- Historial completo de aportes cronológicos por meta (`goal_contributions`).
- Animación de confeti al completar una meta al 100%.

### 9. 📈 Análisis Financiero (`/analytics`)
- **Tasa de Ahorro**: Medidor circular con la fórmula `(Ingresos - Gastos) / Ingresos × 100`.
- **Comparación Mensual**: Variaciones porcentuales de Este mes vs Mes anterior.
- **Evolución 12 Meses**: Gráfico de área de ingresos vs gastos en el último año.
- **Evolución del Balance Acumulado**: Gráfico de línea de patrimonio en el tiempo.
- **Exportación de reportes CSV**.

### 10. 📅 Calendario Financiero (`/calendar`)
- Vista mensual interactiva de calendario.
- Píldoras de ingresos y gastos diarios (ej. `22: -$82`, `21: +$3,500`).
- Drawer modal al hacer clic en cualquier día con el desglose de transacciones y botón para agregar movimientos en esa fecha.

### 11. 👤 Perfil & Preferencias (`/profile`)
- Selector de foto de avatar.
- Nombre, email y teléfono.
- Selector de **Moneda Principal**: USD ($), EUR (€), VES (Bs.), GBP (£).
- Preferencias de formato decimal (`dot` o `comma`) y día de inicio de semana (`Lunes` o `Domingo`).

### 12. ⚙️ Configuración (`/settings`)
- **Apariencia**: Claro (Light), Oscuro (Dark) y Sistema (Auto).
- **Notificaciones**: Toggles para alertas de presupuesto, avisos de metas y resumen semanal.
- **Seguridad**: Solicitud de cambio de contraseña por correo y estado de sesiones activas.
- **Copia de seguridad**: Exportación completa de datos.

### 13. 🛡️ Panel de Administración (`/admin`)
- Restringido estrictamente a usuarios con rol `admin`.
- Métricas agregadas del sistema (Usuarios registrados, Usuarios activos, Transacciones totales, Salud del servidor).
- **Gestión de categorías predeterminadas**: Permite a los administradores crear, editar y eliminar categorías base para todos los usuarios.
- **Privacidad estricta**: No expone transacciones financieras privadas de los usuarios.

---

## 🗄️ Estructura de la Base de Datos (PostgreSQL)

El archivo `supabase/schema.sql` contiene la definición completa de la base de datos:

```sql
profiles
   │
   ├── accounts ────── transactions
   │
   ├── categories ──── transactions
   │         │
   │         └──────── budget_categories
   │
   ├── budgets ─────── budget_categories
   │
   ├── goals ───────── goal_contributions
   │
   └── notifications
```

### Seguridad y RLS (Row Level Security)
- Todas las tablas tienen RLS habilitado.
- Los usuarios sólo pueden consultar y mutar registros donde `auth.uid() = user_id`.
- Políticas de administrador protegidas mediante subconsulta de rol.

---

## 🛠️ Instalación y Ejecución Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/chulox20/FINOVA.git
cd FINOVA
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno (Opcional si usas Supabase en la nube):**
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

> *Si no configuras `.env`, la aplicación funcionará automáticamente en Modo Demo Local con persistencia en LocalStorage.*

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

5. **Construir para producción:**
```bash
npm run build
```

---

## 📱 Responsividad y Accesibilidad

- **Desktop**: Barra lateral expandida, tablas completas y gráficos amplios.
- **Tablet**: Barra lateral compacta con tooltips y cuadrículas optimizadas.
- **Mobile**: Barra de navegación inferior con botón flotante central de registro rápido `(+)`.
- **Accesibilidad**: Botones semánticos, contrastes verificados, compatibilidad con navegación por teclado y soporte completo de Dark Mode.

---

## 📄 Licencia

Desarrollado con dedicación para el control inteligente de finanzas personales.
FINOVA — *"Toma el control de tu dinero."*
