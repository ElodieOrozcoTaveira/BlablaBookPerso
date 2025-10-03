import { Response } from 'express';
import { AuthenticatedRequest, IUser, UpdateUserDTO, ApiResponse } from '../types';

/**
 * User Controller
 * Handles user profile management
 * Routes: GET/PUT /api/user/profile, DELETE /api/user/account
 */
export class UserController {
  
  /**
   * Get user profile
   * GET /api/user/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      // Remove sensitive data before returning
      const { password, ...userProfile } = req.user as any;

      res.json({
        success: true,
        data: userProfile,
        message: 'User profile retrieved successfully'
      } as ApiResponse<IUser>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const updateData: UpdateUserDTO = req.body;
      const allowedFields = ['firstname', 'lastname', 'username', 'email'];
      
      // Filter only allowed fields
      const filteredUpdateData: Partial<UpdateUserDTO> = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          (filteredUpdateData as any)[key] = (updateData as any)[key];
        }
      });

      if (Object.keys(filteredUpdateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        } as ApiResponse);
        return;
      }

      // TODO: Update user in database using Sequelize
      // const updatedUser = await User.update(filteredUpdateData, {
      //   where: { id_user: req.user.id_user },
      //   returning: true
      // });

      // For now, return mock response
      const updatedUser = { ...req.user, ...filteredUpdateData };
      const { password, ...userProfile } = updatedUser as any;

      res.json({
        success: true,
        data: userProfile,
        message: 'User profile updated successfully'
      } as ApiResponse<IUser>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete user account (soft delete)
   * DELETE /api/user/account
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      // TODO: Soft delete user account using Sequelize
      // await User.update(
      //   { deleted_at: new Date() },
      //   { where: { id_user: req.user.id_user } }
      // );

      res.json({
        success: true,
        message: 'User account deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user account',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new UserController();