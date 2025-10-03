/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import * as readingListController from '../../../src/controllers/reading-list.controller.js';
import ReadingList from '../../../src/models/ReadingList.js';
import Book from '../../../src/models/Book.js';
import Library from '../../../src/models/Library.js';

// Mock des modeles Sequelize
vi.mock('../../../src/models/ReadingList.js', () => ({
    default: {
        findAll: vi.fn(),
        findByPk: vi.fn(),
        findOne: vi.fn(),
        findAndCountAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        destroy: vi.fn(),
    },
}));

vi.mock('../../../src/models/Book.js', () => ({
    default: {
        findByPk: vi.fn(),
    },
}));

vi.mock('../../../src/models/Library.js', () => ({
    default: {
        findByPk: vi.fn(),
    },
}));

describe('Reading List Controller - Tests from scratch', () => {
    let req: any;
    let res: any;
    let next: any;

    const mockUser = {
        id_user: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
    };

    const mockBook = {
        id_book: 1,
        title: 'Test Book',
        description: 'A test book',
        publication_year: 2023,
    };

    const mockLibrary = {
        id_library: 1,
        name: 'Test Library',
        description: 'A test library',
        is_public: true,
        id_user: 1,
    };

    const mockReadingList = {
        id_reading_list: 1,
        id_library: 1,
        id_book: 1,
        reading_status: 'to_read',
        added_at: new Date(),
        started_at: null,
        finished_at: null,
        created_at: new Date(),
        updated_at: new Date(),
        Book: mockBook,
        Library: mockLibrary,
    };

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: mockUser,
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
        next = vi.fn();

        // Reset all mocks
        vi.clearAllMocks();
    });

    describe('addBookToReadingList', () => {
        it('should add book to reading list successfully', async () => {
            req.body = {
                id_library: 1,
                id_book: 1,
                reading_status: 'to_read',
            };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );
            (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(
                mockBook as any,
            );
            (ReadingList.findOne as MockedFunction<typeof ReadingList.findOne>).mockResolvedValue(null);
            (ReadingList.create as MockedFunction<typeof ReadingList.create>).mockResolvedValue(
                mockReadingList as any,
            );

            await readingListController.addBookToReadingList(req, res, next);

            expect(Library.findByPk).toHaveBeenCalledWith(1);
            expect(Book.findByPk).toHaveBeenCalledWith(1);
            expect(ReadingList.findOne).toHaveBeenCalledWith({
                where: { id_library: 1, id_book: 1 },
            });
            expect(ReadingList.create).toHaveBeenCalledWith({
                id_library: 1,
                id_book: 1,
                reading_status: 'to_read',
                added_at: expect.any(Date),
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockReadingList,
                message: 'Livre ajoute a la liste de lecture avec succes',
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            req.user = undefined;

            await readingListController.addBookToReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie',
            });
        });

        it('should return 404 if library not found', async () => {
            req.body = {
                id_library: 999,
                id_book: 1,
            };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(null);

            await readingListController.addBookToReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bibliotheque non trouvee',
            });
        });

        it('should return 404 if book not found', async () => {
            req.body = {
                id_library: 1,
                id_book: 999,
            };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );
            (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(null);

            await readingListController.addBookToReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve',
            });
        });

        it('should return 409 if book already in reading list', async () => {
            req.body = {
                id_library: 1,
                id_book: 1,
            };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );
            (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(
                mockBook as any,
            );
            (ReadingList.findOne as MockedFunction<typeof ReadingList.findOne>).mockResolvedValue(
                mockReadingList as any,
            );

            await readingListController.addBookToReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Ce livre est deja dans cette liste de lecture',
            });
        });

        it('should handle database errors', async () => {
            req.body = {
                id_library: 1,
                id_book: 1,
            };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockRejectedValue(
                new Error('Database error'),
            );

            await readingListController.addBookToReadingList(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getReadingList', () => {
        it('should return reading list for library successfully', async () => {
            const mockReadingLists = [mockReadingList, { ...mockReadingList, id_reading_list: 2 }];
            req.params = { library_id: 1 };
            req.query = { page: 1, limit: 10 };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );
            (ReadingList.findAndCountAll as any).mockResolvedValue({
                rows: mockReadingLists,
                count: 2,
            });

            await readingListController.getReadingList(req, res, next);

            expect(Library.findByPk).toHaveBeenCalledWith(1);
            expect(ReadingList.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_library: 1 },
                    limit: 10,
                    offset: 0,
                    order: [['added_at', 'DESC']],
                }),
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockReadingLists,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            });
        });

        it('should filter by reading status', async () => {
            const mockReadingLists = [mockReadingList];
            req.params = { library_id: 1 };
            req.query = { page: 1, limit: 10, reading_status: 'reading' };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );
            (ReadingList.findAndCountAll as any).mockResolvedValue({
                rows: mockReadingLists,
                count: 1,
            });

            await readingListController.getReadingList(req, res, next);

            expect(ReadingList.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        id_library: 1,
                        reading_status: 'reading',
                    },
                }),
            );
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if library not found', async () => {
            req.params = { library_id: 999 };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(null);

            await readingListController.getReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bibliotheque non trouvee',
            });
        });

        it('should handle database errors', async () => {
            req.params = { library_id: 1 };

            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockRejectedValue(
                new Error('Database error'),
            );

            await readingListController.getReadingList(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('updateReadingStatus', () => {
        it('should update reading status successfully', async () => {
            req.params = { id: '1' };
            req.body = {
                reading_status: 'reading',
            };

            const mockFoundReadingList = {
                ...mockReadingList,
                update: vi.fn().mockResolvedValue(mockReadingList),
                reading_status: 'to_read',
                id_library: 1,
            };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockResolvedValue(
                mockFoundReadingList as any,
            );
            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );

            await readingListController.updateReadingStatus(req, res, next);

            expect(ReadingList.findByPk).toHaveBeenCalledWith('1');
            expect(mockFoundReadingList.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockFoundReadingList,
                message: 'Statut de lecture mis a jour avec succes',
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            req.user = undefined;
            req.params = { id: '1' };

            await readingListController.updateReadingStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie',
            });
        });

        it('should return 404 if reading list entry not found', async () => {
            req.params = { id: '999' };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockResolvedValue(null);

            await readingListController.updateReadingStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Entree de liste de lecture non trouvee',
            });
        });

        it('should update timestamps when changing to reading', async () => {
            req.params = { id: '1' };
            req.body = {
                reading_status: 'reading',
            };

            const mockFoundReadingList = {
                ...mockReadingList,
                update: vi.fn().mockResolvedValue(mockReadingList),
                reading_status: 'to_read',
                started_at: null,
                id_library: 1,
            };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockResolvedValue(
                mockFoundReadingList as any,
            );
            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );

            await readingListController.updateReadingStatus(req, res, next);

            // Verifier que update a ete appele avec les bonnes donnees incluant started_at
            expect(mockFoundReadingList.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    reading_status: 'reading',
                    started_at: expect.any(Date),
                }),
            );
            expect(res.json).toHaveBeenCalled();
        });

        it('should update timestamps when changing to read', async () => {
            req.params = { id: '1' };
            req.body = {
                reading_status: 'read',
            };

            const mockFoundReadingList = {
                ...mockReadingList,
                update: vi.fn().mockResolvedValue(mockReadingList),
                reading_status: 'reading',
                finished_at: null,
                started_at: new Date(),
                id_library: 1,
            };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockResolvedValue(
                mockFoundReadingList as any,
            );
            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );

            await readingListController.updateReadingStatus(req, res, next);

            // Verifier que update a ete appele avec finished_at
            expect(mockFoundReadingList.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    reading_status: 'read',
                    finished_at: expect.any(Date),
                }),
            );
            expect(res.json).toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            req.params = { id: '1' };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockRejectedValue(
                new Error('Database error'),
            );

            await readingListController.updateReadingStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('removeBookFromReadingList', () => {
        it('should remove book from reading list successfully', async () => {
            req.params = { id: '1' };

            const mockFoundReadingList = {
                ...mockReadingList,
                destroy: vi.fn().mockResolvedValue(true),
                id_library: 1,
            };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockResolvedValue(
                mockFoundReadingList as any,
            );
            (Library.findByPk as MockedFunction<typeof Library.findByPk>).mockResolvedValue(
                mockLibrary as any,
            );

            // Mock res.end()
            res.end = vi.fn().mockReturnThis();

            await readingListController.removeBookFromReadingList(req, res, next);

            expect(ReadingList.findByPk).toHaveBeenCalledWith('1');
            expect(mockFoundReadingList.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalled();
        });

        it('should return 401 if user is not authenticated', async () => {
            req.user = undefined;
            req.params = { id: '1' };

            await readingListController.removeBookFromReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie',
            });
        });

        it('should return 404 if reading list entry not found', async () => {
            req.params = { id: '999' };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockResolvedValue(null);

            await readingListController.removeBookFromReadingList(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Entree de liste de lecture non trouvee',
            });
        });

        it('should handle database errors', async () => {
            req.params = { id: '1' };

            (ReadingList.findByPk as MockedFunction<typeof ReadingList.findByPk>).mockRejectedValue(
                new Error('Database error'),
            );

            await readingListController.removeBookFromReadingList(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
