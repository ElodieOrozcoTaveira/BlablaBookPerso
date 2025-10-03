import Rate from '../models/Rate.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { BookActionService } from './book-action.service.js';
import { buildPagination } from '../utils/pagination.js';

interface CreateRatePayload { id_book?: number; open_library_key?: string; rating: number; }
interface ListRatesQuery { page: number; limit: number; id_book?: any; id_user?: any; rating?: any; }

export class RateService {
  private async resolveBookId(payload: CreateRatePayload, userId: number): Promise<number | undefined> {
    let effectiveBookId = payload.id_book;
    if (!effectiveBookId && payload.open_library_key) {
      try {
        const actionSvc = new BookActionService();
        const preparation = await actionSvc.prepareBookForAction(payload.open_library_key, userId, 'add_rate');
        if (preparation.book && preparation.book.import_status !== 'confirmed') {
          await preparation.book.update({ import_status: 'confirmed', imported_reason: 'library' });
        }
        effectiveBookId = preparation.book.id_book;
      } catch (e: any) {
        // Marqueur d'erreur spécifique pour que le contrôleur réponde 404 sans casser les autres tests
        const msg = e?.message || 'unknown';
        throw new Error('OPENLIB_IMPORT_FAILED:' + msg);
      }
    }
    return effectiveBookId;
  }

  async createRate(payload: CreateRatePayload, userId: number) {
    const bookId = await this.resolveBookId(payload, userId);
  if (!bookId) return { error: { code: 400, message: 'Aucun identifiant de livre resolu', kind: 'VALIDATION' } };
    const book = await Book.findByPk(bookId);
  if (!book) return { error: { code: 404, message: 'Livre non trouve', kind: 'NOT_FOUND' } };
    const existingRate = await Rate.findOne({ where: { id_user: userId, id_book: bookId } });
  if (existingRate) return { error: { code: 409, message: 'Vous avez deja note ce livre. Utilisez PUT pour modifier votre note.', kind: 'CONFLICT' } };
    const rate = await Rate.create({ id_book: bookId, rating: payload.rating, id_user: userId });
    return { rate };
  }

  private buildWhere(query: Partial<ListRatesQuery>) {
    const where: Record<string, any> = {};
    if (query.id_book) where.id_book = query.id_book;
    if (query.id_user) where.id_user = query.id_user;
    if (query.rating) where.rating = query.rating;
    return where;
  }

  async listRates(query: ListRatesQuery) {
    const { page, limit } = query;
    const where = this.buildWhere(query);
    const offset = (page - 1) * limit;
    const { rows: rates, count: total } = await Rate.findAndCountAll({
      where,
      attributes: ['id_rate', 'id_user', 'id_book', 'rating', 'created_at', 'updated_at'],
      include: [
        { model: User, as: 'RateBelongsToUser', attributes: ['id_user', 'username', 'firstname', 'lastname'] },
        { model: Book, as: 'RateBelongsToBook', attributes: ['id_book', 'title', 'isbn', 'publication_year'] }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  return { rates, pagination: buildPagination(page, limit, total) };
  }
}
