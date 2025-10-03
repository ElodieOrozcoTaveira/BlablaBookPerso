import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals';
import {
    createLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
    getMyLibraries
} from '../../../src/controllers/library.controller.js';
import Library from '../../../src/models/Library.js';
import Book from '../../../src/models/Book.js';

jest.mock('../../../src/models/Library');
jest.mock('../../../src/models/Book');

describe('Library Controller', () => {
    let mockRequest: any; // Changed to any to allow user property
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any,
            end: jest.fn() as any
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('createLibrary', () => {
        it('should create a new library', async () => {
            const libraryData = {
                name: 'My Library',
                is_public: true
            };

            const mockCreatedLibrary = {
                id_library: 1,
                ...libraryData,
                id_user: 1
            };

            mockRequest.body = libraryData;
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            (Library as any).create.mockResolvedValue(mockCreatedLibrary);

            await createLibrary(mockRequest as any, mockResponse as Response, mockNext);

            expect(Library.create).toHaveBeenCalledWith({
                ...libraryData,
                id_user: 1  // Changed from '1' to 1 to match actual controller behavior
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getAllLibraries', () => {
        it('should get all public libraries', async () => {
            const mockLibraries = [
                { id_library: 1, name: 'Public Library', is_public: true }
            ];

            mockRequest.query = { page: '1', limit: '20' } as any;
            (Library as any).findAndCountAll.mockResolvedValue({
                rows: mockLibraries,
                count: 1
            });

            await getAllLibraries(mockRequest as any, mockResponse as Response, mockNext);

            expect(Library.findAndCountAll).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockLibraries
                })
            );
        });
    });

    describe('getLibraryById', () => {
        it('should get library by id with books', async () => {
            const mockLibrary = {
                id_library: 1,
                name: 'Test Library',
                Books: []
            };

            mockRequest.params = { id: '1' };
            (Library as any).findByPk.mockResolvedValue(mockLibrary);

            await getLibraryById(mockRequest as any, mockResponse as Response, mockNext);

            expect(Library.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockLibrary
            });
        });

        it('should return 404 if library not found', async () => {
            mockRequest.params = { id: '999' };
            (Library as any).findByPk.mockResolvedValue(null);

            await getLibraryById(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateLibrary', () => {
        it('should update library', async () => {
            const updateData = { name: 'Updated Library' };
            const mockLibrary = {
                id_library: 1,
                id_user: 1,
                update: jest.fn().mockReturnValue({}),
                reload: jest.fn().mockReturnValue({})
            };

            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' }; // Corrige !
            (Library as any).findByPk.mockResolvedValue(mockLibrary);

            await updateLibrary(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockLibrary.update).toHaveBeenCalledWith(updateData);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: expect.stringContaining('mise a jour')
                })
            );
        });
    });

    describe('deleteLibrary', () => {
        it('should delete library', async () => {
            const mockLibrary = {
                id_library: 1,
                id_user: 1,
                destroy: jest.fn().mockReturnValue({})
            };

            mockRequest.params = { id: '1' };
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' }; // Ajoute !
            (Library as any).findByPk.mockResolvedValue(mockLibrary);

            await deleteLibrary(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockLibrary.destroy).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(204);
        });
    });

    describe('getMyLibraries', () => {
        it('should get user libraries', async () => {
            const mockLibraries = [
                { id_library: 1, name: 'My Library', id_user: 1 }
            ];

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' } as any;
            (Library as any).findAll.mockResolvedValue(mockLibraries);

            await getMyLibraries(mockRequest as any, mockResponse as Response, mockNext);

            expect(Library.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_user: 1 }  // Changed from '1' to 1
                })
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockLibraries
            });
        });
    });
});
