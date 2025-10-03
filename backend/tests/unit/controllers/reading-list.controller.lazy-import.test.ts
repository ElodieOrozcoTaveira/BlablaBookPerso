/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import * as readingListController from '../../../src/controllers/reading-list.controller.js';
import ReadingList from '../../../src/models/ReadingList.js';
import Book from '../../../src/models/Book.js';
import Library from '../../../src/models/Library.js';
import { BookActionService } from '../../../src/services/book-action.service.js';

vi.mock('../../../src/models/ReadingList.js', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
        findByPk: vi.fn(),
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
vi.mock('../../../src/services/book-action.service.js', () => ({
    BookActionService: vi.fn().mockImplementation(() => ({
        prepareBookForAction: vi.fn(),
    })),
}));

describe('Reading List Controller - lazy import', () => {
    let req: any;
    let res: any;
    let next: any;
    let mockPreparation: any;
    const mockUser = { id_user: 42 };
    const mockLibrary = { id_library: 10, id_user: 42 };
    const mockTempBook = {
        id_book: 777,
        import_status: 'temporary',
        update: vi.fn().mockResolvedValue(true),
    };
    const mockConfirmedBook = {
        id_book: 888,
        import_status: 'confirmed',
        update: vi.fn(),
    };

    beforeEach(() => {
        req = { user: mockUser, body: {}, params: {}, query: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
        next = vi.fn();
        vi.clearAllMocks();
        (Library.findByPk as MockedFunction<any>).mockResolvedValue(mockLibrary);
        (ReadingList.findOne as MockedFunction<any>).mockResolvedValue(null);
        mockPreparation = { book: mockTempBook, wasImported: true };
        (BookActionService as any).mockImplementation(() => ({
            prepareBookForAction: vi.fn().mockResolvedValue(mockPreparation),
        }));
    });

    it('imports and confirms automatically a book via open_library_key', async () => {
        req.body = {
            id_library: 10,
            open_library_key: '/works/OL123W',
            reading_status: 'to_read',
        };
        (Book.findByPk as MockedFunction<any>).mockResolvedValue(mockTempBook);
        const createdEntry = {
            id_reading_list: 1,
            id_library: 10,
            id_book: 777,
            reading_status: 'to_read',
            added_at: new Date(),
        };
        (ReadingList.create as MockedFunction<any>).mockResolvedValue(createdEntry);

        await readingListController.addBookToReadingList(req, res, next);

        expect(BookActionService).toHaveBeenCalled();
        const svcInstance = (BookActionService as any).mock.results[0].value;
        expect(svcInstance.prepareBookForAction).toHaveBeenCalledWith(
            '/works/OL123W',
            42,
            'add_to_reading_list'
        );
        expect(mockTempBook.update).toHaveBeenCalledWith({
            import_status: 'confirmed',
            imported_reason: 'library',
        });
        expect(ReadingList.create).toHaveBeenCalledWith(
            expect.objectContaining({ id_book: 777 })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 if no identifier resolved', async () => {
        req.body = {
            id_library: 10,
            reading_status: 'to_read',
        }; // no id_book or open_library_key
        await readingListController.addBookToReadingList(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 if OpenLibrary import fails', async () => {
        req.body = {
            id_library: 10,
            open_library_key: '/works/FAIL',
            reading_status: 'to_read',
        };
        (BookActionService as any).mockImplementation(() => ({
            prepareBookForAction: vi.fn().mockRejectedValue(new Error('fail')),
        }));
        await readingListController.addBookToReadingList(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
