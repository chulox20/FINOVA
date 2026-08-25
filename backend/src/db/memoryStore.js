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

  async handleQuery(text, params = []) {
    await this.init();
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. USERS
    if (lower.startsWith('select') && lower.includes('from users')) {
      if (lower.includes('where email = $1')) {
        const email = params[0]?.toLowerCase().trim();
        const user = this.users.find(u => u.email.toLowerCase() === email);
        return { rows: user ? [{ ...user }] : [] };
      }
      if (lower.includes('where id = $1')) {
        const id = params[0];
        const user = this.users.find(u => u.id === id);
        return { rows: user ? [{ ...user }] : [] };
      }
      if (lower.includes('count(*)')) {
        return { rows: [{ count: this.users.length }] };
      }
      return { rows: this.users.map(u => ({ ...u, password_hash: undefined })) };
    }

    if (lower.startsWith('insert into users')) {
      const id = crypto.randomUUID();
      const newUser = {
        id,
        full_name: params[0],
        email: params[1],
        password_hash: params[2],
        avatar_url: params[3] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'user',
        currency: params[4] || 'USD',
        phone: null,
        decimal_format: 'dot',
        week_start: 'monday',
        budget_alerts: true,
        goal_notifications: true,
        weekly_summary: false,
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.users.push(newUser);
      return { rows: [newUser] };
    }

    if (lower.startsWith('update users')) {
      const userId = params[params.length - 1];
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.updated_at = new Date().toISOString();
        if (lower.includes('last_seen_at = current_timestamp')) {
          user.last_seen_at = new Date().toISOString();
        }
        if (lower.includes('password_hash = $1')) {
          user.password_hash = params[0];
        }
        return { rows: [user] };
      }
      return { rows: [] };
    }

    // 2. ACCOUNTS
    if (lower.startsWith('select') && lower.includes('from accounts')) {
      if (lower.includes('count(*)')) {
        if (lower.includes('where user_id = $1')) {
          const count = this.accounts.filter(a => a.user_id === params[0]).length;
          return { rows: [{ count }] };
        }
        return { rows: [{ count: this.accounts.length }] };
      }
      if (lower.includes('coalesce(sum(balance)')) {
        const userId = params[0];
        const sum = this.accounts.filter(a => a.user_id === userId).reduce((acc, a) => acc + Number(a.balance), 0);
        return { rows: [{ net_worth: sum }] };
      }
      if (lower.includes('where id = $1 and user_id = $2') || lower.includes('where id = $2 and user_id = $1')) {
        const accId = lower.includes('where id = $1') ? params[0] : params[1];
        const userId = lower.includes('where id = $1') ? params[1] : params[0];
        const acc = this.accounts.find(a => a.id === accId && a.user_id === userId);
        return { rows: acc ? [acc] : [] };
      }
      if (lower.includes('where id = $1')) {
        const acc = this.accounts.find(a => a.id === params[0]);
        return { rows: acc ? [acc] : [] };
      }
      if (lower.includes('where user_id = $1')) {
        const userId = params[0];
        const accs = this.accounts.filter(a => a.user_id === userId);
        return { rows: accs };
      }
      return { rows: this.accounts };
    }

    if (lower.startsWith('insert into accounts')) {
      const id = crypto.randomUUID();
      const newAcc = {
        id,
        user_id: params[0],
        name: params[1],
        type: params[2],
        balance: Number(params[3]) || 0,
        currency: params[4] || 'USD',
        color: params[5] || '#10b981',
        icon: params[6] || 'landmark',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.accounts.push(newAcc);
      return { rows: [newAcc] };
    }

    if (lower.startsWith('update accounts')) {
      if (lower.includes('balance = balance - $1') || lower.includes('balance = balance + $1')) {
        const amt = Number(params[0]);
        const accId = params[1];
        const acc = this.accounts.find(a => a.id === accId);
        if (acc) {
          if (lower.includes('balance = balance - $1')) {
            acc.balance -= amt;
          } else {
            acc.balance += amt;
          }
          acc.updated_at = new Date().toISOString();
          return { rows: [acc] };
        }
      }
      const accId = params[0];
      const userId = params[1];
      const acc = this.accounts.find(a => a.id === accId && a.user_id === userId);
      return { rows: acc ? [acc] : [] };
    }

    if (lower.startsWith('delete from accounts')) {
      const [accId, userId] = params;
      const idx = this.accounts.findIndex(a => a.id === accId && a.user_id === userId);
      if (idx !== -1) {
        this.accounts.splice(idx, 1);
        return { rows: [{ id: accId }] };
      }
      return { rows: [] };
    }

    // 3. CATEGORIES
    if (lower.startsWith('select') && lower.includes('from categories')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: this.categories.length }] };
      }
      if (lower.includes('where is_default = true or user_id = $1')) {
        const userId = params[0];
        const cats = this.categories.filter(c => c.is_default || c.user_id === userId);
        return { rows: cats };
      }
      if (lower.includes('where is_default = true or user_id is null')) {
        return { rows: this.categories.filter(c => c.is_default || !c.user_id) };
      }
      return { rows: this.categories };
    }

    if (lower.startsWith('insert into categories')) {
      const id = crypto.randomUUID();
      const newCat = {
        id,
        user_id: params[0] || null,
        name: params[1],
        type: params[2],
        color: params[3] || '#64748b',
        icon: params[4] || 'tag',
        is_default: !params[0],
        created_at: new Date().toISOString(),
      };
      this.categories.push(newCat);
      return { rows: [newCat] };
    }

    if (lower.startsWith('delete from categories')) {
      const catId = params[0];
      const idx = this.categories.findIndex(c => c.id === catId);
      if (idx !== -1) {
        this.categories.splice(idx, 1);
        return { rows: [{ id: catId }] };
      }
      return { rows: [] };
    }

    // 4. TRANSACTIONS
    if (lower.startsWith('select') && lower.includes('from transactions')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: this.transactions.length }] };
      }
      if (lower.includes('to_char(transaction_date') && lower.includes('group by')) {
        const userId = params[0];
        const userTx = this.transactions.filter(t => t.user_id === userId);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonthIdx = new Date().getMonth();
        const res = [];
        for (let i = 5; i >= 0; i--) {
          const mIdx = (currentMonthIdx - i + 12) % 12;
          const inc = userTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) / 6;
          const exp = userTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) / 6;
          res.push({
            month_key: `2026-${String(mIdx + 1).padStart(2, '0')}`,
            month_name: months[mIdx],
            income: Number(inc.toFixed(2)),
            expense: Number(exp.toFixed(2)),
          });
        }
        return { rows: res };
      }
      if (lower.includes('coalesce(sum(case when type =') && lower.includes('from transactions')) {
        const userId = params[0];
        const userTx = this.transactions.filter(t => t.user_id === userId);
        const inc = userTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const exp = userTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { rows: [{ income: inc, expense: exp }] };
      }
      if (lower.includes('group by c.name, c.color, c.icon')) {
        const userId = params[0];
        const userTx = this.transactions.filter(t => t.user_id === userId && t.type === 'expense');
        const catMap = {};
        userTx.forEach(t => {
          const cat = this.categories.find(c => c.id === t.category_id);
          const name = cat?.name || 'Otros';
          const color = cat?.color || '#64748b';
          const icon = cat?.icon || 'tag';
          if (!catMap[name]) catMap[name] = { name, color, icon, value: 0 };
          catMap[name].value += t.amount;
        });
        return { rows: Object.values(catMap) };
      }
      if (lower.includes('transaction_date::text as date') && lower.includes('group by transaction_date')) {
        const userId = params[0];
        const userTx = this.transactions.filter(t => t.user_id === userId);
        const days = {};
        userTx.forEach(t => {
          if (!days[t.transaction_date]) days[t.transaction_date] = { date: t.transaction_date, income: 0, expense: 0, count: 0 };
          if (t.type === 'income') days[t.transaction_date].income += t.amount;
          if (t.type === 'expense') days[t.transaction_date].expense += t.amount;
          days[t.transaction_date].count++;
        });
        return { rows: Object.values(days) };
      }
      if (lower.includes('where t.id = $1')) {
        const tx = this.transactions.find(t => t.id === params[0]);
        if (!tx) return { rows: [] };
        const acc = this.accounts.find(a => a.id === tx.account_id) || null;
        const toAcc = this.accounts.find(a => a.id === tx.to_account_id) || null;
        const cat = this.categories.find(c => c.id === tx.category_id) || null;
        return { rows: [{ ...tx, account: acc, to_account: toAcc, category: cat }] };
      }
      const userId = params[0];
      const txs = this.transactions.filter(t => t.user_id === userId).map(t => {
        const acc = this.accounts.find(a => a.id === t.account_id) || null;
        const toAcc = this.accounts.find(a => a.id === t.to_account_id) || null;
        const cat = this.categories.find(c => c.id === t.category_id) || null;
        return { ...t, account: acc, to_account: toAcc, category: cat };
      });
      return { rows: txs };
    }

    if (lower.startsWith('insert into transactions')) {
      const id = crypto.randomUUID();
      const newTx = {
        id,
        user_id: params[0],
        account_id: params[1],
        to_account_id: params[2] || null,
        category_id: params[3] || null,
        type: params[4],
        description: params[5],
        amount: Number(params[6]),
        transaction_date: params[7] || new Date().toISOString().split('T')[0],
        notes: params[8] || null,
        created_at: new Date().toISOString(),
      };
      this.transactions.unshift(newTx);
      return { rows: [newTx] };
    }

    if (lower.startsWith('delete from transactions')) {
      const txId = params[0];
      const idx = this.transactions.findIndex(t => t.id === txId);
      if (idx !== -1) {
        this.transactions.splice(idx, 1);
        return { rows: [{ id: txId }] };
      }
      return { rows: [] };
    }

    // 5. BUDGETS
    if (lower.startsWith('select') && lower.includes('from budgets')) {
      const userId = params[0];
      return { rows: this.budgets.filter(b => b.user_id === userId) };
    }
    if (lower.startsWith('select') && lower.includes('from budget_categories')) {
      return {
        rows: this.budget_categories.map(bc => {
          const cat = this.categories.find(c => c.id === bc.category_id);
          return { ...bc, category: cat };
        })
      };
    }

    // 6. GOALS
    if (lower.startsWith('select') && lower.includes('from goals')) {
      if (lower.includes("status = 'completed'")) {
        return { rows: [{ count: this.goals.filter(g => g.status === 'completed').length }] };
      }
      if (lower.includes('where id = $1')) {
        const g = this.goals.find(goal => goal.id === params[0]);
        return { rows: g ? [g] : [] };
      }
      const userId = params[0];
      return {
        rows: this.goals.filter(g => g.user_id === userId).map(g => {
          const acc = this.accounts.find(a => a.id === g.account_id) || null;
          return { ...g, account: acc };
        })
      };
    }

    if (lower.startsWith('select') && lower.includes('from goal_contributions')) {
      return { rows: this.goal_contributions };
    }

    if (lower.startsWith('insert into goal_contributions')) {
      const id = crypto.randomUUID();
      const newContrib = {
        id,
        goal_id: params[0],
        user_id: params[1],
        amount: Number(params[2]),
        contribution_date: params[3],
        note: params[4],
        created_at: new Date().toISOString(),
      };
      this.goal_contributions.unshift(newContrib);
      return { rows: [newContrib] };
    }

    // 7. NOTIFICATIONS
    if (lower.startsWith('select') && lower.includes('from notifications')) {
      const userId = params[0];
      return { rows: this.notifications.filter(n => n.user_id === userId) };
    }
    if (lower.startsWith('update notifications')) {
      if (lower.includes('where id = $1')) {
        const n = this.notifications.find(notif => notif.id === params[0]);
        if (n) n.is_read = true;
        return { rows: n ? [n] : [] };
      }
      const userId = params[0];
      this.notifications.filter(n => n.user_id === userId).forEach(n => n.is_read = true);
      return { rows: [] };
    }

    // Generic fallback
    return { rows: [] };
  }
}

export const memoryStore = new MemoryStore();
