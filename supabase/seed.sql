-- ==============================================================================
-- FINOVA — SUPABASE SEED DATA
-- Default Categories & Initialization
-- ==============================================================================

-- Default System Categories
INSERT INTO public.categories (id, user_id, name, type, color, icon, is_default)
VALUES
    -- Expense categories
    ('c0000001-0000-0000-0000-000000000001', NULL, 'Vivienda', 'expense', '#6366f1', 'home', true),
    ('c0000001-0000-0000-0000-000000000002', NULL, 'Alimentación', 'expense', '#f59e0b', 'utensils', true),
    ('c0000001-0000-0000-0000-000000000003', NULL, 'Transporte', 'expense', '#06b6d4', 'car', true),
    ('c0000001-0000-0000-0000-000000000004', NULL, 'Salud', 'expense', '#ef4444', 'heart-pulse', true),
    ('c0000001-0000-0000-0000-000000000005', NULL, 'Educación', 'expense', '#8b5cf6', 'graduation-cap', true),
    ('c0000001-0000-0000-0000-000000000006', NULL, 'Entretenimiento', 'expense', '#ec4899', 'gamepad-2', true),
    ('c0000001-0000-0000-0000-000000000007', NULL, 'Compras', 'expense', '#f97316', 'shopping-bag', true),
    ('c0000001-0000-0000-0000-000000000008', NULL, 'Viajes', 'expense', '#14b8a6', 'plane', true),
    ('c0000001-0000-0000-0000-000000000009', NULL, 'Servicios', 'expense', '#64748b', 'zap', true),
    ('c0000001-0000-0000-0000-000000000010', NULL, 'Otros Gastos', 'expense', '#94a3b8', 'more-horizontal', true),
    
    -- Income categories
    ('c0000002-0000-0000-0000-000000000001', NULL, 'Salario', 'income', '#10b981', 'briefcase', true),
    ('c0000002-0000-0000-0000-000000000002', NULL, 'Freelance / Negocio', 'income', '#3b82f6', 'laptop', true),
    ('c0000002-0000-0000-0000-000000000003', NULL, 'Inversiones', 'income', '#8b5cf6', 'trending-up', true),
    ('c0000002-0000-0000-0000-000000000004', NULL, 'Otros Ingresos', 'income', '#10b981', 'plus-circle', true)
ON CONFLICT (id) DO NOTHING;
