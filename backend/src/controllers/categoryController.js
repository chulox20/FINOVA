import { categoryService } from '../services/categoryService.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categoryValidators.js';

export const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategories(req.user.id);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const validated = createCategorySchema.parse(req.body);
      const created = await categoryService.createCategory(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Categoría creada con éxito',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const validated = updateCategorySchema.parse(req.body);
      const updated = await categoryService.updateCategory(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Categoría actualizada',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const result = await categoryService.deleteCategory(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Categoría eliminada',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
};
