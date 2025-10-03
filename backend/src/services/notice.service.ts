import Notice from '../models/Notice.js';
import Book from '../models/Book.js';
import { BookActionService } from './book-action.service.js';
import { Op } from 'sequelize';
import { buildPagination } from '../utils/pagination.js';

interface CreateNoticePayload {
  id_book?: number; open_library_key?: string; title?: string; content: string; is_spoiler?: boolean; is_public?: boolean;
}
interface ListNoticesQuery { page: number; limit: number; query?: string; id_book?: any; id_user?: any; is_public?: any; is_spoiler?: any; }
interface ListBookPublicNoticesQuery { page: number; limit: number; is_spoiler?: any; }

export class NoticeService {
  private async resolveBookId(payload: CreateNoticePayload, userId: number) {
    let effectiveBookId = payload.id_book;
    if (!effectiveBookId && payload.open_library_key) {
      try {
        const actionSvc = new BookActionService();
        const prep = await actionSvc.prepareBookForAction(payload.open_library_key, userId, 'add_review');
        if (prep.book && prep.book.import_status !== 'confirmed') {
          await prep.book.update({ import_status: 'confirmed', imported_reason: 'library' });
        }
        effectiveBookId = prep.book.id_book;
      } catch (e: any) {
        throw new Error('OPENLIB_IMPORT_FAILED:' + (e?.message || 'unknown'));
      }
    }
    return effectiveBookId;
  }

  async createNotice(payload: CreateNoticePayload, userId: number) {
    const bookId = await this.resolveBookId(payload, userId);
  if (!bookId) return { error: { code: 400, message: 'Aucun identifiant de livre resolu', kind: 'VALIDATION' } };
    const book = await Book.findByPk(bookId);
  if (!book) return { error: { code: 404, message: 'Livre non trouve', kind: 'NOT_FOUND' } };
    const notice = await Notice.create({
      id_book: bookId,
      id_user: userId,
      title: payload.title,
      content: payload.content,
      is_spoiler: payload.is_spoiler ?? false,
      is_public: payload.is_public ?? true
    });
    return { notice };
  }

  private buildWhere(q: Partial<ListNoticesQuery>) {
    const where: any = {};
    if (q.query) {
      where[Op.or as any] = [
        { title: { [Op.iLike]: `%${q.query}%` } },
        { content: { [Op.iLike]: `%${q.query}%` } }
      ];
    }
    if (q.id_book) where.id_book = q.id_book;
    if (q.id_user) where.id_user = q.id_user;
    if (q.is_public !== undefined) where.is_public = q.is_public;
    if (q.is_spoiler !== undefined) where.is_spoiler = q.is_spoiler;
    return where;
  }

  async listNotices(query: ListNoticesQuery) {
    const { page, limit } = query;
    const where = this.buildWhere(query);
    const offset = (page - 1) * limit;
    const { rows: notices, count: total } = await Notice.findAndCountAll({
      where,
      attributes: ['id_notice','id_user','id_book','title','content','is_spoiler','is_public','created_at','updated_at'],
      limit,
      offset,
      order: [['created_at','DESC']]
    });
  return { notices, pagination: buildPagination(page, limit, total) };
  }

  async listPublicNoticesByBook(bookId: number, query: ListBookPublicNoticesQuery) {
    const { page, limit, is_spoiler } = query;
    const where: any = { id_book: bookId, is_public: true };
    if (is_spoiler !== undefined) where.is_spoiler = is_spoiler;
    const offset = (page - 1) * limit;
    const { rows: notices, count: total } = await Notice.findAndCountAll({
      where,
      attributes: ['id_notice','id_user','title','content','is_spoiler','created_at','updated_at'],
      limit,
      offset,
      order: [['created_at','DESC']]
    });
  return { notices, pagination: buildPagination(page, limit, total) };
  }
}
