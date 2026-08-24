import { authService } from '../services/authService.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from '../validators/authValidators.js';

export const authController = {
  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado con éxito',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      res.status(200).json({
        success: true,
        message: 'Sesión iniciada correctamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await authService.updateProfile(req.user.id, validated);
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(
        req.user.id,
        validated.currentPassword,
        validated.newPassword
      );
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(validated.email);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
};
