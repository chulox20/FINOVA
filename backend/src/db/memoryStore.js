import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class MemoryStore {
  constructor() {
    this.users = [];
    this.accounts = [];
    this.categories = [];
    this.transactions = [];
    this.budgets = [];
    this.budget_categories = [];
    this.goals = [];
    this.goal_contributions = [];
    this.notifications = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // 1. Categories
    const defaultCats = [
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

    defaultCats.forEach(c => {
      this.categories.push({
        id: crypto.randomUUID(),
        user_id: null,
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
        is_default: true,
        created_at: new Date().toISOString(),
      });
    });

    // 2. Users
    const userPassHash = await bcrypt.hash('password123', 10);
    const adminPassHash = await bcrypt.hash('admin123', 10);

    const jesusId = crypto.randomUUID();
    const adminId = crypto.randomUUID();

    this.users.push({
      id: jesusId,
      full_name: 'Jesús Figueroa',
      email: 'jesus@finova.app',
      password_hash: userPassHash,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      currency: 'USD',
      phone: '+58 412 1234567',
      decimal_format: 'dot',
      week_start: 'monday',
      budget_alerts: true,
      goal_notifications: true,
      weekly_summary: false,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.users.push({
      id: adminId,
      full_name: 'Administrador Finova',
      email: 'admin@finova.app',
      password_hash: adminPassHash,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      currency: 'USD',
      phone: '+1 800 555 0199',
      decimal_format: 'dot',
      week_start: 'monday',
      budget_alerts: true,
      goal_notifications: true,
      weekly_summary: false,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 3. Accounts for Jesús
    const acc1Id = crypto.randomUUID();
    const acc2Id = crypto.randomUUID();
    const acc3Id = crypto.randomUUID();
    const acc4Id = crypto.randomUUID();
    const acc5Id = crypto.randomUUID();

    this.accounts.push(
      { id: acc1Id, user_id: jesusId, name: 'Banco Nacional', type: 'checking', balance: 3240.80, currency: 'USD', color: '#10b981', icon: 'landmark', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: acc2Id, user_id: jesusId, name: 'Banesco Ahorros', type: 'savings', balance: 6800.00, currency: 'USD', color: '#3b82f6', icon: 'piggy-bank', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: acc3Id, user_id: jesusId, name: 'Efectivo Billetera', type: 'cash', balance: 340.00, currency: 'USD', color: '#14b8a6', icon: 'banknote', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: acc4Id, user_id: jesusId, name: 'Tarjeta Visa Signature', type: 'credit_card', balance: -420.30, currency: 'USD', color: '#f59e0b', icon: 'credit-card', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: acc5Id, user_id: jesusId, name: 'Inversiones Indexadas (S&P500)', type: 'investment', balance: 2520.00, currency: 'USD', color: '#8b5cf6', icon: 'trending-up', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    );

    const getCatId = (name) => this.categories.find(c => c.name === name)?.id || null;

    // 4. Transactions
    const txSeed = [
      { desc: 'Supermercado Central', amount: 82.00, type: 'expense', cat: 'Alimentación', acc: acc1Id, date: '2026-08-22' },
      { desc: 'Salario Mensual Empresa Tech', amount: 3500.00, type: 'income', cat: 'Salario', acc: acc1Id, date: '2026-08-21' },
      { desc: 'Diseño Web Freelance UI/UX', amount: 750.00, type: 'income', cat: 'Freelance / Proyectos', acc: acc1Id, date: '2026-08-18' },
      { desc: 'Alquiler Apartamento', amount: 850.00, type: 'expense', cat: 'Vivienda', acc: acc1Id, date: '2026-08-05' },
      { desc: 'Gasolina y Estacionamiento', amount: 145.00, type: 'expense', cat: 'Transporte', acc: acc4Id, date: '2026-08-15' },
      { desc: 'Servicio Mantenimiento Vehículo', amount: 135.00, type: 'expense', cat: 'Transporte', acc: acc4Id, date: '2026-08-17' },
      { desc: 'Mercado Mayorista', amount: 300.00, type: 'expense', cat: 'Alimentación', acc: acc1Id, date: '2026-08-10' },
      { desc: 'Cine & Cena con Amigos', amount: 120.00, type: 'expense', cat: 'Entretenimiento', acc: acc4Id, date: '2026-08-14' },
      { desc: 'Internet Fibra Óptica', amount: 75.00, type: 'expense', cat: 'Servicios', acc: acc1Id, date: '2026-08-08' },
      { desc: 'Seguro Médico y Vitaminas', amount: 110.00, type: 'expense', cat: 'Salud', acc: acc1Id, date: '2026-08-12' },
      { desc: 'Ropa Deportiva & Calzado', amount: 140.00, type: 'expense', cat: 'Compras', acc: acc1Id, date: '2026-08-19' },
      { desc: 'Suscripciones Cloud & Herramientas', amount: 73.00, type: 'expense', cat: 'Otros Gastos', acc: acc1Id, date: '2026-08-03' },
      { desc: 'Salario Mensual', amount: 3500.00, type: 'income', cat: 'Salario', acc: acc1Id, date: '2026-07-25' },
      { desc: 'Consultoría Web Frontend', amount: 428.00, type: 'income', cat: 'Freelance / Proyectos', acc: acc1Id, date: '2026-07-15' },
      { desc: 'Alquiler Apartamento', amount: 850.00, type: 'expense', cat: 'Vivienda', acc: acc1Id, date: '2026-07-05' },
      { desc: 'Supermercado & Alimentación', amount: 450.00, type: 'expense', cat: 'Alimentación', acc: acc1Id, date: '2026-07-18' },
      { desc: 'Transporte y Movilidad', amount: 210.00, type: 'expense', cat: 'Transporte', acc: acc1Id, date: '2026-07-20' },
      { desc: 'Entretenimiento & Vacaciones', amount: 480.00, type: 'expense', cat: 'Entretenimiento', acc: acc1Id, date: '2026-07-22' },
    ];

    txSeed.forEach(t => {
      this.transactions.push({
        id: crypto.randomUUID(),
        user_id: jesusId,
        account_id: t.acc,
        to_account_id: null,
        category_id: getCatId(t.cat),
        type: t.type,
        description: t.desc,
        amount: t.amount,
        transaction_date: t.date,
        notes: null,
        created_at: new Date().toISOString(),
      });
    });

    // 5. Budgets
    const budgetId = crypto.randomUUID();
    this.budgets.push({
      id: budgetId,
      user_id: jesusId,
      name: 'Presupuesto Mensual Agosto',
      period: 'monthly',
      amount: 2500.00,
      start_date: '2026-08-01',
      end_date: '2026-08-31',
      created_at: new Date().toISOString(),
    });

    const addBc = (catName, limit) => {
      const cid = getCatId(catName);
      if (cid) {
        this.budget_categories.push({
          id: crypto.randomUUID(),
          budget_id: budgetId,
          category_id: cid,
          limit_amount: limit,
        });
      }
    };

    addBc('Alimentación', 500);
    addBc('Transporte', 250);
    addBc('Vivienda', 900);
    addBc('Entretenimiento', 150);
    addBc('Servicios', 150);

    // 6. Goals
    const goal1Id = crypto.randomUUID();
    const goal2Id = crypto.randomUUID();
    const goal3Id = crypto.randomUUID();

    this.goals.push(
      { id: goal1Id, user_id: jesusId, name: 'Viaje a Japón 🏯', target_amount: 4000.00, current_amount: 2750.00, deadline: '2027-04-15', account_id: acc2Id, color: '#3b82f6', icon: 'plane', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: goal2Id, user_id: jesusId, name: 'Fondo de Emergencia 🛡️', target_amount: 10000.00, current_amount: 6800.00, deadline: '2026-12-31', account_id: acc2Id, color: '#10b981', icon: 'shield-check', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: goal3Id, user_id: jesusId, name: 'Nueva Laptop para Trabajo 💻', target_amount: 2500.00, current_amount: 1850.00, deadline: '2026-11-20', account_id: acc1Id, color: '#8b5cf6', icon: 'laptop', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    );

    this.goal_contributions.push(
      { id: crypto.randomUUID(), goal_id: goal1Id, user_id: jesusId, amount: 500, contribution_date: '2026-04-10', note: 'Ahorro inicial', created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), goal_id: goal1Id, user_id: jesusId, amount: 750, contribution_date: '2026-05-20', note: 'Freelance adicional', created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), goal_id: goal1Id, user_id: jesusId, amount: 1500, contribution_date: '2026-07-15', note: 'Bono de medio año', created_at: new Date().toISOString() }
    );

    // 7. Notifications
    this.notifications.push(
      { id: crypto.randomUUID(), user_id: jesusId, type: 'budget', title: 'Alerta de Presupuesto', message: '🔴 Has superado el presupuesto de Transporte (112% gastado).', is_read: false, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), user_id: jesusId, type: 'budget', title: 'Presupuesto cerca del límite', message: '⚠️ Has usado el 80% de tu presupuesto de Entretenimiento.', is_read: false, created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), user_id: jesusId, type: 'goal', title: 'Meta de ahorro cercana', message: '🎯 ¡Estás a solo $1,250 de completar tu meta "Viaje a Japón" (68.8%)!', is_read: true, created_at: new Date().toISOString() }
    );

    this.initialized = true;
  }
}

export const memoryStore = new MemoryStore();
