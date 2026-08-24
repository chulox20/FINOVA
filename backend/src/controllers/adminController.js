import { adminService } from '../services/adminService.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators.js';

export const adminController = {
  async getMetrics(req, res, next) {
    try {
      const metrics = await adminService.getGlobalMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req, res, next) {
    try {
      const users = await adminService.listUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSystemCategories(req, res, next) {
    try {
      const categories = await adminService.getSystemCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async createSystemCategory(req, res, next) {
    try {
      const validated = createCategorySchema.parse(req.body);
      const created = await adminService.createSystemCategory(validated);
      res.status(201).json({
        success: true,
        message: 'Categoría predeterminada creada con éxito',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSystemCategory(req, res, next) {
    try {
      const validated = updateCategorySchema.parse(req.body);
      const updated = await adminService.updateSystemCategory(req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Categoría del sistema actualizada',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSystemCategory(req, res, next) {
    try {
      const result = await adminService.deleteSystemCategory(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Categoría del sistema eliminada',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
};
