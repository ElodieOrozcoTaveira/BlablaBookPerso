/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import { uploadBookCover, deleteBookCover, uploadUserAvatar, deleteUserAvatar, getUploadedImages } from '../../../src/controllers/upload.controller.js';
import Book from '../../../src/models/Book.js';
import User from '../../../src/models/User.js';
import { AuthenticatedRequest, AuthenticatedMulterRequest } from '../../../src/types/express.js';

// Mocks des modèles
vi.mock('../../../src/models/Book.js');
vi.mock('../../../src/models/User.js');

const MockedBook = vi.mocked(Book);
const MockedUser = vi.mocked(User);

// Mock du service d'images
const mockImageService = {
    validateImage: vi.fn(),
    deleteImages: vi.fn(),
    processImage: vi.fn()
};

vi.mock('../../../src/services/image.service.js', () => ({
    ImageService: vi.fn().mockImplementation(() => mockImageService)
}));

describe('Upload Controller - Tests from scratch', () => {
    let req: Partial<AuthenticatedMulterRequest<any, { book_id: number }>>;
    let res: Partial<Response>;
    let next: NextFunction;

    // Mock objects communs
    const mockUser = {
        id_user: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        username: 'johndoe'
    };

    const mockBook = {
        id_book: 1,
        title: 'Test Book',
        cover_url: null,
        get: vi.fn(),
        update: vi.fn()
    } as any;

    const mockUserModel = {
        id_user: 1,
        firstname: 'John',
        lastname: 'Doe',
        avatar_url: null,
        get: vi.fn(),
        update: vi.fn()
    } as any;

    const mockFile = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1024,
        fieldname: 'image',
        encoding: '7bit'
    } as any;

    beforeEach(() => {
        // Reset des mocks
        vi.clearAllMocks();
        
        // Setup des mocks de base
        req = {
            user: mockUser,
            params: { book_id: 1 },
            body: {},
            query: {},
            file: mockFile
        };

        res = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis()
        };

        next = vi.fn();

        // Reset des mocks des modèles
        (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockReset();
        (MockedBook.findAll as MockedFunction<typeof Book.findAll>).mockReset();
        (MockedUser.findByPk as MockedFunction<typeof User.findByPk>).mockReset();

        // Reset des mocks des objets
        mockBook.get.mockReset();
        mockBook.update.mockReset();
        mockUserModel.get.mockReset();
        mockUserModel.update.mockReset();
        
        // Reset des mocks du service d'images
        mockImageService.validateImage.mockReset();
        mockImageService.deleteImages.mockReset();
        mockImageService.processImage.mockReset();
    });

    describe('uploadBookCover', () => {
        it('should upload book cover successfully', async () => {
            // Arrange
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook);
            mockImageService.validateImage.mockResolvedValue(true);
            mockImageService.processImage.mockResolvedValue(JSON.stringify({
                small: '/uploads/covers/book1_small.jpg',
                medium: '/uploads/covers/book1_medium.jpg',
                large: '/uploads/covers/book1_large.jpg'
            }));
            mockBook.update.mockResolvedValue(mockBook);

            // Act
            await uploadBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(MockedBook.findByPk).toHaveBeenCalledWith(1);
            expect(mockImageService.validateImage).toHaveBeenCalledWith(mockFile.buffer);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        book_id: 1,
                        cover_images: expect.objectContaining({
                            small: '/uploads/covers/book1_small.jpg',
                            medium: '/uploads/covers/book1_medium.jpg',
                            large: '/uploads/covers/book1_large.jpg'
                        })
                    }),
                    message: 'Couverture uploadee et traitee avec succes'
                })
            );
        });

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            req.user = undefined;

            // Act
            await uploadBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should return 400 if no file provided', async () => {
            // Arrange
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook);
            req.file = undefined;

            // Act
            await uploadBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should return 404 if book not found', async () => {
            // Arrange
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(null);

            // Act
            await uploadBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(MockedBook.findByPk).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should handle service errors', async () => {
            // Arrange
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook);
            mockImageService.validateImage.mockRejectedValue(new Error('Format invalide'));

            // Act
            await uploadBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });
    });

    describe('deleteBookCover', () => {
        it('should delete book cover successfully', async () => {
            // Arrange
            mockBook.cover_url = JSON.stringify({
                small: '/uploads/covers/book1_small.jpg'
            });
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook);
            mockImageService.deleteImages.mockResolvedValue(true);
            mockBook.update.mockResolvedValue(mockBook);

            // Act
            await deleteBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(MockedBook.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 404 if book not found', async () => {
            // Arrange
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(null);

            // Act
            await deleteBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should handle service errors', async () => {
            // Arrange
            (MockedBook.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook);
            mockBook.get.mockReturnValue(JSON.stringify({ small: '/path/image.jpg' }));
            mockImageService.deleteImages.mockRejectedValue(new Error('Delete failed'));

            // Act
            await deleteBookCover(req as AuthenticatedRequest<any, { book_id: number }>, res as Response, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('uploadUserAvatar', () => {
        it('should upload user avatar successfully', async () => {
            // Arrange
            mockImageService.validateImage.mockResolvedValue(true);
            (MockedUser.findByPk as MockedFunction<typeof User.findByPk>).mockResolvedValue(mockUserModel);
            mockImageService.processImage.mockResolvedValue(JSON.stringify({
                small: '/uploads/avatars/user1_small.jpg'
            }));
            mockUserModel.update.mockResolvedValue(mockUserModel);

            // Act
            await uploadUserAvatar(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(MockedUser.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            req.user = undefined;

            // Act
            await uploadUserAvatar(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should handle service errors', async () => {
            // Arrange
            mockImageService.validateImage.mockRejectedValue(new Error('Invalid format'));

            // Act
            await uploadUserAvatar(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });
    });

    describe('deleteUserAvatar', () => {
        it('should delete user avatar successfully', async () => {
            // Arrange
            mockUserModel.avatar_url = JSON.stringify({
                small: '/uploads/avatars/user1_small.jpg'
            });
            (MockedUser.findByPk as MockedFunction<typeof User.findByPk>).mockResolvedValue(mockUserModel);
            mockImageService.deleteImages.mockResolvedValue(true);
            mockUserModel.update.mockResolvedValue(mockUserModel);

            // Act
            await deleteUserAvatar(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(MockedUser.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            req.user = undefined;

            // Act
            await deleteUserAvatar(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('getUploadedImages', () => {
        it('should return uploaded images successfully', async () => {
            // Arrange
            req.query = { type: 'covers', page: '1', limit: '10' };
            (MockedBook.findAll as MockedFunction<typeof Book.findAll>).mockResolvedValue([mockBook]);
            (MockedUser.findByPk as MockedFunction<typeof User.findByPk>).mockResolvedValue(mockUserModel);

            // Act
            await getUploadedImages(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        it('should handle query parameters correctly', async () => {
            // Arrange
            req.query = { type: 'avatars' };
            (MockedBook.findAll as MockedFunction<typeof Book.findAll>).mockResolvedValue([]);
            (MockedUser.findByPk as MockedFunction<typeof User.findByPk>).mockResolvedValue(mockUserModel);

            // Act
            await getUploadedImages(req as AuthenticatedRequest, res as Response, next);

            // Assert
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });
    });
});