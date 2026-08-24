import bcrypt from 'bcryptjs';
import { pool, withTransaction } from './pool.js';
import { runMigrations } from './migrate.js';

export async function runSeed() {
  console.log('🌱 Iniciando siembra de datos (Seed)...');
  await runMigrations();

  await withTransaction(async (client) => {
    // 1. Insert Default Global Categories
    const defaultCategories = [
      { name: 'Vivienda', type: 'expense', color: '#6366f1', icon: 'home' },
      { name: 'Alimentación', type: 'expense', color: '#f59e0b', icon: 'utensils' },
      { name: 'Transporte', type: 'expense', color: '#06b6d4', icon: 'car' },
      { name: 'Salud', type: 'expense', color: '#ef4444', icon: 'heart-pulse' },
      { name: 'Educación', type: 'expense', color: '#8b5cf6', icon: 'graduation-cap' },
      { name: 'Entretenimiento', type: 'expense', color: '#ec4899', icon: 'gamepad-2' },
      { name: 'Compras', type: 'expense', color: '#f97316', icon: 'shopping-bag' },
      { name: 'Viajes', type: 'expense', color: '#14b8a6', icon: 'plane' },
      { name: 'Servicios', type: 'expense', color: '#64748b', icon: 'zap' },
      { name: 'Otros Gastos', type: 'expense', color: '#94a3b8', icon: 'more-horizontal' },
      { name: 'Salario', type: 'income', color: '#10b981', icon: 'briefcase' },
      { name: 'Freelance / Proyectos', type: 'income', color: '#3b82f6', icon: 'laptop' },
      { name: 'Inversiones', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
      { name: 'Otros Ingresos', type: 'income', color: '#059669', icon: 'plus-circle' },
    ];

    for (const cat of defaultCategories) {
      const existing = await client.query(
        'SELECT id FROM categories WHERE name = $1 AND user_id IS NULL',
        [cat.name]
      );
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES (NULL, $1, $2, $3, $4, true)',
          [cat.name, cat.type, cat.color, cat.icon]
        );
      }
    }

    // 2. Insert Demo User (Jesús Figueroa)
    const userPassHash = await bcrypt.hash('password123', 10);
    const adminPassHash = await bcrypt.hash('admin123', 10);

    let userRes = await client.query('SELECT id FROM users WHERE email = $1', ['jesus@finova.app']);
    let userId;

    if (userRes.rows.length === 0) {
      const inserted = await client.query(
        `INSERT INTO users (full_name, email, password_hash, avatar_url, role, currency, phone, last_seen_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          'Jesús Figueroa',
          'jesus@finova.app',
          userPassHash,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          'user',
          'USD',
          '+58 412 1234567',
        ]
      );
      userId = inserted.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
    }

    // 3. Insert Demo Admin
    const adminRes = await client.query('SELECT id FROM users WHERE email = $1', ['admin@finova.app']);
    if (adminRes.rows.length === 0) {
      await client.query(
        `INSERT INTO users (full_name, email, password_hash, avatar_url, role, currency, phone, last_seen_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [
          'Administrador Finova',
          'admin@finova.app',
          adminPassHash,
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          'admin',
          'USD',
          '+1 800 555 0199',
        ]
      );
    }

    // 4. Seed Accounts for Jesús
    const accountsCount = await client.query('SELECT COUNT(*) FROM accounts WHERE user_id = $1', [userId]);
    if (parseInt(accountsCount.rows[0].count, 10) === 0) {
      const acc1 = await client.query(
        `INSERT INTO accounts (user_id, name, type, balance, currency, color, icon)
         VALUES ($1, 'Banco Nacional', 'checking', 3240.80, 'USD', '#10b981', 'landmark') RETURNING id`,
        [userId]
      );
      const acc2 = await client.query(
        `INSERT INTO accounts (user_id, name, type, balance, currency, color, icon)
         VALUES ($1, 'Banesco Ahorros', 'savings', 6800.00, 'USD', '#3b82f6', 'piggy-bank') RETURNING id`,
        [userId]
      );
      const acc3 = await client.query(
        `INSERT INTO accounts (user_id, name, type, balance, currency, color, icon)
         VALUES ($1, 'Efectivo Billetera', 'cash', 340.00, 'USD', '#14b8a6', 'banknote') RETURNING id`,
        [userId]
      );
      const acc4 = await client.query(
        `INSERT INTO accounts (user_id, name, type, balance, currency, color, icon)
         VALUES ($1, 'Tarjeta Visa Signature', 'credit_card', -420.30, 'USD', '#f59e0b', 'credit-card') RETURNING id`,
        [userId]
      );
      const acc5 = await client.query(
        `INSERT INTO accounts (user_id, name, type, balance, currency, color, icon)
         VALUES ($1, 'Inversiones Indexadas (S&P500)', 'investment', 2520.00, 'USD', '#8b5cf6', 'trending-up') RETURNING id`,
        [userId]
      );

      const mainAccId = acc1.rows[0].id;
      const savingsAccId = acc2.rows[0].id;
      const cardAccId = acc4.rows[0].id;

      // Get category IDs
      const catMapRes = await client.query('SELECT id, name FROM categories WHERE user_id IS NULL');
      const catMap = {};
      catMapRes.rows.forEach(r => { catMap[r.name] = r.id; });

      // 5. Seed Transactions
      const txs = [
        { desc: 'Supermercado Central', amount: 82.00, type: 'expense', cat: 'Alimentación', acc: mainAccId, date: '2026-08-22' },
        { desc: 'Salario Mensual Empresa Tech', amount: 3500.00, type: 'income', cat: 'Salario', acc: mainAccId, date: '2026-08-21' },
        { desc: 'Diseño Web Freelance UI/UX', amount: 750.00, type: 'income', cat: 'Freelance / Proyectos', acc: mainAccId, date: '2026-08-18' },
        { desc: 'Alquiler Apartamento', amount: 850.00, type: 'expense', cat: 'Vivienda', acc: mainAccId, date: '2026-08-05' },
        { desc: 'Gasolina y Estacionamiento', amount: 145.00, type: 'expense', cat: 'Transporte', acc: cardAccId, date: '2026-08-15' },
        { desc: 'Servicio Mantenimiento Vehículo', amount: 135.00, type: 'expense', cat: 'Transporte', acc: cardAccId, date: '2026-08-17' },
        { desc: 'Mercado Mayorista', amount: 300.00, type: 'expense', cat: 'Alimentación', acc: mainAccId, date: '2026-08-10' },
        { desc: 'Cine & Cena con Amigos', amount: 120.00, type: 'expense', cat: 'Entretenimiento', acc: cardAccId, date: '2026-08-14' },
        { desc: 'Internet Fibra Óptica', amount: 75.00, type: 'expense', cat: 'Servicios', acc: mainAccId, date: '2026-08-08' },
        { desc: 'Seguro Médico y Vitaminas', amount: 110.00, type: 'expense', cat: 'Salud', acc: mainAccId, date: '2026-08-12' },
        { desc: 'Ropa Deportiva & Calzado', amount: 140.00, type: 'expense', cat: 'Compras', acc: mainAccId, date: '2026-08-19' },
        { desc: 'Suscripciones Cloud & Herramientas', amount: 73.00, type: 'expense', cat: 'Otros Gastos', acc: mainAccId, date: '2026-08-03' },
        // Previous month
        { desc: 'Salario Mensual', amount: 3500.00, type: 'income', cat: 'Salario', acc: mainAccId, date: '2026-07-25' },
        { desc: 'Consultoría Web Frontend', amount: 428.00, type: 'income', cat: 'Freelance / Proyectos', acc: mainAccId, date: '2026-07-15' },
        { desc: 'Alquiler Apartamento', amount: 850.00, type: 'expense', cat: 'Vivienda', acc: mainAccId, date: '2026-07-05' },
        { desc: 'Supermercado & Alimentación', amount: 450.00, type: 'expense', cat: 'Alimentación', acc: mainAccId, date: '2026-07-18' },
        { desc: 'Transporte y Movilidad', amount: 210.00, type: 'expense', cat: 'Transporte', acc: mainAccId, date: '2026-07-20' },
        { desc: 'Entretenimiento & Vacaciones', amount: 480.00, type: 'expense', cat: 'Entretenimiento', acc: mainAccId, date: '2026-07-22' },
      ];

      for (const t of txs) {
        await client.query(
          `INSERT INTO transactions (user_id, account_id, category_id, type, description, amount, transaction_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, t.acc, catMap[t.cat] || null, t.type, t.desc, t.amount, t.date]
        );
      }

      // 6. Seed Budget
      const budgetRes = await client.query(
        `INSERT INTO budgets (user_id, name, period, amount, start_date, end_date)
         VALUES ($1, 'Presupuesto Mensual Agosto', 'monthly', 2500.00, '2026-08-01', '2026-08-31')
         RETURNING id`,
        [userId]
      );
      const budgetId = budgetRes.rows[0].id;

      if (catMap['Alimentación']) {
        await client.query('INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES ($1, $2, 500)', [budgetId, catMap['Alimentación']]);
      }
      if (catMap['Transporte']) {
        await client.query('INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES ($1, $2, 250)', [budgetId, catMap['Transporte']]);
      }
      if (catMap['Vivienda']) {
        await client.query('INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES ($1, $2, 900)', [budgetId, catMap['Vivienda']]);
      }
      if (catMap['Entretenimiento']) {
        await client.query('INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES ($1, $2, 150)', [budgetId, catMap['Entretenimiento']]);
      }
      if (catMap['Servicios']) {
        await client.query('INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES ($1, $2, 150)', [budgetId, catMap['Servicios']]);
      }

      // 7. Seed Goals
      const goal1 = await client.query(
        `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, account_id, color, icon, status)
         VALUES ($1, 'Viaje a Japón 🏯', 4000.00, 2750.00, '2027-04-15', $2, '#3b82f6', 'plane', 'active')
         RETURNING id`,
        [userId, savingsAccId]
      );
      const goal2 = await client.query(
        `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, account_id, color, icon, status)
         VALUES ($1, 'Fondo de Emergencia 🛡️', 10000.00, 6800.00, '2026-12-31', $2, '#10b981', 'shield-check', 'active')
         RETURNING id`,
        [userId, savingsAccId]
      );
      const goal3 = await client.query(
        `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, account_id, color, icon, status)
         VALUES ($1, 'Nueva Laptop para Trabajo 💻', 2500.00, 1850.00, '2026-11-20', $2, '#8b5cf6', 'laptop', 'active')
         RETURNING id`,
        [userId, mainAccId]
      );

      // 8. Seed Goal Contributions
      await client.query('INSERT INTO goal_contributions (goal_id, user_id, amount, contribution_date, note) VALUES ($1, $2, 500, \'2026-04-10\', \'Ahorro inicial\')', [goal1.rows[0].id, userId]);
      await client.query('INSERT INTO goal_contributions (goal_id, user_id, amount, contribution_date, note) VALUES ($1, $2, 750, \'2026-05-20\', \'Freelance adicional\')', [goal1.rows[0].id, userId]);
      await client.query('INSERT INTO goal_contributions (goal_id, user_id, amount, contribution_date, note) VALUES ($1, $2, 1500, \'2026-07-15\', \'Bono de medio año\')', [goal1.rows[0].id, userId]);

      // 9. Seed Notifications
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, is_read)
         VALUES ($1, 'budget', 'Alerta de Presupuesto', '🔴 Has superado el presupuesto de Transporte (112% gastado).', false)`,
        [userId]
      );
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, is_read)
         VALUES ($1, 'budget', 'Presupuesto cerca del límite', '⚠️ Has usado el 80% de tu presupuesto de Entretenimiento.', false)`,
        [userId]
      );
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, is_read)
         VALUES ($1, 'goal', 'Meta de ahorro cercana', '🎯 ¡Estás a solo $1,250 de completar tu meta "Viaje a Japón" (68.8%)!', true)`,
        [userId]
      );
    }
  });

  console.log('✅ Base de datos sembrada con éxito.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error en el seed:', err);
      process.exit(1);
    });
}
