import { accountService } from '../services/accountService.js';
import {
  createAccountSchema,
  updateAccountSchema,
  transferFundsSchema,
} from '../validators/accountValidators.js';

export const accountController = {
  async getAccounts(req, res, next) {
    try {
      const accounts = await accountService.getAccounts(req.user.id);
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAccountById(req, res, next) {
    try {
      const account = await accountService.getAccountById(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  },

  async createAccount(req, res, next) {
    try {
      const validated = createAccountSchema.parse(req.body);
      const created = await accountService.createAccount(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Cuenta creada con éxito',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAccount(req, res, next) {
    try {
      const validated = updateAccountSchema.parse(req.body);
      const updated = await accountService.updateAccount(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Cuenta actualizada',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      const result = await accountService.deleteAccount(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Cuenta eliminada con éxito',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async transferFunds(req, res, next) {
    try {
      const validated = transferFundsSchema.parse(req.body);
      const result = await accountService.transferFunds(req.user.id, validated);
      res.status(200).json({
        success: true,
        message: 'Transferencia realizada con éxito',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
};
