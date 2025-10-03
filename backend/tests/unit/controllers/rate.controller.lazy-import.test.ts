/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import * as rateController from '../../../src/controllers/rate.controller.js';
import Rate from '../../../src/models/Rate.js';
import Book from '../../../src/models/Book.js';
import { BookActionService } from '../../../src/services/book-action.service.js';

vi.mock('../../../src/models/Rate.js', () => ({
    default: { findOne: vi.fn(), create: vi.fn() }
}));
vi.mock('../../../src/models/Book.js', () => ({
    default: { findByPk: vi.fn() }
}));
vi.mock('../../../src/services/book-action.service.js', () => ({
    BookActionService: vi.fn().mockImplementation(() => ({
        prepareBookForAction: vi.fn()
    }))
}));

describe('Rate Controller - lazy import', () => {
    let req: any;
    let res: any;
    let next: any;
    let mockPreparation: any;
    const mockUser = { id_user: 7 };
    const mockTempBook = {
        id_book: 501,
        import_status: 'temporary',
        update: vi.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
        req = { user: mockUser, body: {}, params: {}, query: {} };
        res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
        next = vi.fn();
        vi.clearAllMocks();
        (Rate.findOne as MockedFunction<any>).mockResolvedValue(null);
        mockPreparation = { book: mockTempBook, wasImported: true };
        (BookActionService as any).mockImplementation(() => ({
            prepareBookForAction: vi.fn().mockResolvedValue(mockPreparation)
        }));
    });

    it('imports and confirms a book then creates a rate', async () => {
        req.body = { open_library_key: '/works/OL555W', rating: 4 };
        (Book.findByPk as MockedFunction<any>).mockResolvedValue(mockTempBook);
        const createdRate = { id_rate: 1, id_book: 501, id_user: 7, rating: 4 };
        (Rate.create as MockedFunction<any>).mockResolvedValue(createdRate);

        await rateController.createRate(req, res, next);

        expect(BookActionService).toHaveBeenCalled();
        const svcInstance = (BookActionService as any).mock.results[0].value;
        // New standardized actionType 'add_rate' (formerly 'rate_book')
        expect(svcInstance.prepareBookForAction).toHaveBeenCalledWith('/works/OL555W', 7, 'add_rate');
        expect(mockTempBook.update).toHaveBeenCalledWith({ import_status: 'confirmed', imported_reason: 'library' });
        expect(Rate.create).toHaveBeenCalledWith({ id_book: 501, id_user: 7, rating: 4 });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 if no book identifier', async () => {
        req.body = { rating: 5 }; // missing
        await rateController.createRate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 if import fails', async () => {
        req.body = { open_library_key: '/works/FAIL', rating: 3 };
        (BookActionService as any).mockImplementation(() => ({
            prepareBookForAction: vi.fn().mockRejectedValue(new Error('fail'))
        }));
        await rateController.createRate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
