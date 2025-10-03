/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import { BookActionController } from '../../../src/controllers/book-action.controller.js';
import { BookActionService } from '../../../src/services/book-action.service.js';
import { AuthenticatedRequest } from '../../../src/types/express.js';

// Mock du BookActionService
vi.mock('../../../src/services/book-action.service.js', () => ({
    BookActionService: vi.fn()
}));

describe('BookAction Controller - Tests from scratch', () => {
    let mockBookActionService: any;
    let MockBookActionServiceConstructor: MockedFunction<any>;
    let bookActionController: BookActionController;
    let mockReq: any;
    let mockRes: any;
    let mockNext: NextFunction;
    let mockJson: MockedFunction<any>;
    let mockStatus: MockedFunction<any>;

    beforeEach(() => {
        // Reset des mocks
        vi.clearAllMocks();

        // Mock du service
        mockBookActionService = {
            prepareBookForAction: vi.fn(),
            commitAction: vi.fn(),
            rollbackAction: vi.fn(),
            cleanupTemporaryImports: vi.fn()
        };

        MockBookActionServiceConstructor = vi.mocked(BookActionService);
        MockBookActionServiceConstructor.mockImplementation(() => mockBookActionService);

        // Creation du controller
        bookActionController = new BookActionController();

        // Mock de la response Express
        mockJson = vi.fn();
        mockStatus = vi.fn().mockReturnValue({ json: mockJson });
        mockRes = {
            json: mockJson,
            status: mockStatus
        } as unknown as Response;

        // Mock du next
        mockNext = vi.fn();

        // Mock de la requete authentifiee
        mockReq = {
            body: {},
            user: {
                id_user: 1,
                email: 'test@example.com',
                username: 'testuser'
            },
            session: {
                userId: 1,
                email: 'test@example.com',
                username: 'testuser'
            },
            sessionID: 'test-session-id'
        } as AuthenticatedRequest;
    });

    describe('prepareBookAction', () => {
        it('devrait retourner une erreur si open_library_key manque', async () => {
            mockReq.body = { action_type: 'rate' };

            await bookActionController.prepareBookAction(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.stringContaining('open_library_key')
                })
            );
        });

        it('devrait retourner une erreur si action_type manque', async () => {
            mockReq.body = { open_library_key: '/works/OL123456W' };

            await bookActionController.prepareBookAction(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.stringContaining('action_type')
                })
            );
        });

        it('devrait retourner une erreur si utilisateur non authentifie', async () => {
            mockReq.user = undefined;
            mockReq.body = { open_library_key: '/works/OL123456W', action_type: 'rate' };

            await bookActionController.prepareBookAction(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Authentification requise'
                })
            );
        });
    });

    describe('commitBookAction', () => {
        it('devrait retourner une erreur si aucune action en attente', async () => {
            mockReq.body = { action: 'rate', rating: 5 };
            mockReq.session.pendingBookAction = undefined;

            await bookActionController.commitBookAction(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.stringContaining('Aucune action en attente')
                })
            );
        });

        it('devrait retourner une erreur si utilisateur non authentifie', async () => {
            mockReq.user = undefined;
            mockReq.body = { action: 'rate', rating: 5 };

            await bookActionController.commitBookAction(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Authentification requise'
                })
            );
        });
    });

    describe('rollbackBookAction', () => {
        it('devrait retourner une erreur si aucune action a annuler', async () => {
            mockReq.session.pendingBookAction = undefined;

            await bookActionController.rollbackBookAction(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.stringContaining('Aucune action a annuler')
                })
            );
        });
    });

    describe('cleanupTemporaryImports', () => {
        it('devrait appeler le service avec les bons parametres', async () => {
            mockReq.query = { olderThanMinutes: '120' };
            mockBookActionService.cleanupTemporaryImports.mockResolvedValue(5);

            await bookActionController.cleanupTemporaryImports(mockReq, mockRes);

            expect(mockBookActionService.cleanupTemporaryImports).toHaveBeenCalledWith(120);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: {
                        deletedCount: 5,
                        olderThanMinutes: 120
                    }
                })
            );
        });
    });
});