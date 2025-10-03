import { Request, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Upload Controller
 * Handles file uploads (book covers, user avatars, etc.)
 * Routes: POST /api/upload/cover, POST /api/upload/avatar
 */
export class UploadController {

  /**
   * Upload book cover image
   * POST /api/upload/cover
   */
  async uploadBookCover(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      // TODO: Check admin permissions for uploading book covers
      // if (!hasPermission(req.user, 'UPLOAD_BOOK_COVER')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        } as ApiResponse);
        return;
      }

      const file = req.file;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (!allowedTypes.includes(file.mimetype)) {
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.'
        } as ApiResponse);
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        } as ApiResponse);
        return;
      }

      // TODO: Process image with Sharp (resize, optimize, convert to WebP)
      // import sharp from 'sharp';
      // const optimizedImagePath = await sharp(file.path)
      //   .resize(400, 600, { fit: 'cover' })
      //   .webp({ quality: 80 })
      //   .toFile(optimizedPath);

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `book-cover-${timestamp}${extension}`;
      const relativePath = `/uploads/covers/${filename}`;
      const fullPath = path.join(process.cwd(), 'public', relativePath);

      // Ensure upload directory exists
      const uploadDir = path.dirname(fullPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file to final location
      fs.renameSync(file.path, fullPath);

      res.json({
        success: true,
        data: {
          filename,
          url: relativePath,
          size: file.size,
          mimetype: file.mimetype
        },
        message: 'Book cover uploaded successfully'
      } as ApiResponse);
    } catch (error) {
      // Clean up uploaded file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading book cover',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Upload user avatar
   * POST /api/upload/avatar
   */
  async uploadUserAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        } as ApiResponse);
        return;
      }

      const file = req.file;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (!allowedTypes.includes(file.mimetype)) {
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.'
        } as ApiResponse);
        return;
      }

      // Check file size (max 2MB for avatars)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 2MB for avatars.'
        } as ApiResponse);
        return;
      }

      // TODO: Process image with Sharp (resize to square, optimize)
      // const optimizedImagePath = await sharp(file.path)
      //   .resize(200, 200, { fit: 'cover' })
      //   .webp({ quality: 85 })
      //   .toFile(optimizedPath);

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `user-avatar-${req.user.id_user}-${timestamp}${extension}`;
      const relativePath = `/uploads/avatars/${filename}`;
      const fullPath = path.join(process.cwd(), 'public', relativePath);

      // Ensure upload directory exists
      const uploadDir = path.dirname(fullPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Remove old avatar if exists
      // TODO: Get current avatar from database and delete old file
      // const user = await User.findByPk(req.user.id_user);
      // if (user.avatar_url) {
      //   const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar_url);
      //   if (fs.existsSync(oldAvatarPath)) {
      //     fs.unlinkSync(oldAvatarPath);
      //   }
      // }

      // Move file to final location
      fs.renameSync(file.path, fullPath);

      // TODO: Update user avatar in database
      // await User.update(
      //   { avatar_url: relativePath },
      //   { where: { id_user: req.user.id_user } }
      // );

      res.json({
        success: true,
        data: {
          filename,
          url: relativePath,
          size: file.size,
          mimetype: file.mimetype
        },
        message: 'Avatar uploaded successfully'
      } as ApiResponse);
    } catch (error) {
      // Clean up uploaded file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading avatar',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete uploaded file
   * DELETE /api/upload/:type/:filename
   */
  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const { type, filename } = req.params;
      const allowedTypes = ['covers', 'avatars'];

      if (!allowedTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid file type'
        } as ApiResponse);
        return;
      }

      // TODO: Check permissions (user can delete their own avatars, admins can delete covers)
      if (type === 'covers') {
        // Check admin permissions
        // if (!hasPermission(req.user, 'DELETE_BOOK_COVER')) {
        //   return res.status(403).json({
        //     success: false,
        //     message: 'Insufficient permissions'
        //   });
        // }
      } else if (type === 'avatars') {
        // Check if it's user's own avatar
        if (!filename.includes(`user-avatar-${req.user.id_user}-`)) {
          res.status(403).json({
            success: false,
            message: 'You can only delete your own avatar'
          } as ApiResponse);
          return;
        }
      }

      const filePath = path.join(process.cwd(), 'public', 'uploads', type, filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        } as ApiResponse);
        return;
      }

      // Delete file
      fs.unlinkSync(filePath);

      // TODO: Update database to remove file reference
      if (type === 'avatars') {
        // await User.update(
        //   { avatar_url: null },
        //   { where: { id_user: req.user.id_user } }
        // );
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting file',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get file info
   * GET /api/upload/info/:type/:filename
   */
  async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { type, filename } = req.params;
      const allowedTypes = ['covers', 'avatars'];

      if (!allowedTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid file type'
        } as ApiResponse);
        return;
      }

      const filePath = path.join(process.cwd(), 'public', 'uploads', type, filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        } as ApiResponse);
        return;
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filename);
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp'
      };

      res.json({
        success: true,
        data: {
          filename,
          size: stats.size,
          mimetype: mimeTypes[ext.toLowerCase()] || 'application/octet-stream',
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${type}/${filename}`
        },
        message: 'File info retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting file info',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export default new UploadController();