import ReadingList from '../models/ReadingList.js'
import Library from '../models/Library.js'
import Book from '../models/Book.js'
import { BookActionService } from './book-action.service.js'
import { buildPagination } from '../utils/pagination.js'

interface AddReadingPayload { id_library: number; id_book?: number; open_library_key?: string; reading_status?: string }
interface ListReadingQuery { page: number; limit: number; reading_status?: any }

export class ReadingListService {
  private async resolveBookId(payload: AddReadingPayload, userId: number) {
    let effectiveBookId = payload.id_book
    if (!effectiveBookId && payload.open_library_key) {
      try {
        const actionSvc = new BookActionService()
        const prep = await actionSvc.prepareBookForAction(payload.open_library_key, userId, 'add_to_reading_list')
        if (prep.book && prep.book.import_status !== 'confirmed') {
          await prep.book.update({ import_status: 'confirmed', imported_reason: 'library' })
        }
        effectiveBookId = prep.book.id_book
      } catch (e: any) {
        throw new Error('OPENLIB_IMPORT_FAILED:' + (e?.message || 'unknown'))
      }
    }
    return effectiveBookId
  }

  async addEntry(payload: AddReadingPayload, userId: number) {
    const library = await Library.findByPk(payload.id_library)
    if (!library) return { error: { code: 404, message: 'Bibliotheque non trouvee', kind: 'NOT_FOUND' } }
    // Je verifie la propriete cote controleur deja, mais je double-check si besoin
    if ((library.dataValues?.id_user || library.get('id_user')) !== userId) return { error: { code: 403, message: 'Vous ne pouvez ajouter des livres qu a vos propres bibliotheques', kind: 'FORBIDDEN' } }

    const bookId = await this.resolveBookId(payload, userId)
    if (!bookId) return { error: { code: 400, message: 'Aucun identifiant de livre resolu', kind: 'VALIDATION' } }
    const book = await Book.findByPk(bookId)
    if (!book) return { error: { code: 404, message: 'Livre non trouve', kind: 'NOT_FOUND' } }
    const existing = await ReadingList.findOne({ where: { id_library: payload.id_library, id_book: bookId } })
    const reading_status = (payload.reading_status as any) || 'to_read'
    
    // Si le livre existe déjà avec status 'owned', on le met à jour vers le nouveau status
    if (existing && (existing.dataValues?.reading_status || existing.get('reading_status')) === 'owned') {
        await existing.update({ reading_status })
        return { entry: existing }
    }
    
    // Si le livre existe déjà avec un autre status, c'est un conflit
    if (existing) {
        return { error: { code: 409, message: 'Ce livre est deja dans cette liste de lecture', kind: 'CONFLICT' } }
    }
    
    // Créer une nouvelle entrée

    const entry = await ReadingList.create({
      id_library: payload.id_library,
      id_book: bookId,
      reading_status,
      added_at: new Date(),
      started_at: reading_status === 'reading' ? new Date() : undefined,
      finished_at: reading_status === 'read' ? new Date() : undefined
    })
    return { entry }
  }

  async listEntries(libraryId: number, query: ListReadingQuery) {
    const library = await Library.findByPk(libraryId)
    if (!library) return { error: { code: 404, message: 'Bibliotheque non trouvee', kind: 'NOT_FOUND' } }
    const { page = 1, limit = 20, reading_status } = query
    const where: any = { id_library: libraryId }
    if (reading_status) where.reading_status = reading_status
    const offset = ((page || 1) - 1) * (limit || 20)

    const { rows: readingList, count: total } = await ReadingList.findAndCountAll({
      where,
      attributes: [
        'id_reading_list',
        'id_book',
        'reading_status',
        'added_at',
        'started_at',
        'finished_at',
        'created_at',
        'updated_at'
      ],
      include: [{
        model: Book,
        as: 'ReadingListBelongsToBook',
        attributes: [
          'id_book',
          'title',
          'isbn',
          'publication_year',
          'description'
        ]
      }],
      limit,
      offset,
      order: [['added_at', 'DESC']]
    })
    return { readingList, pagination: buildPagination(page, limit, total) }
  }

  async removeFromCollection(libraryId: number, bookId: number, userId: number) {
    const library = await Library.findByPk(libraryId)
    if (!library) return { error: { code: 404, message: 'Bibliothèque non trouvée', kind: 'NOT_FOUND' } }
    if ((library.dataValues?.id_user || library.get('id_user')) !== userId) return { error: { code: 403, message: 'Accès refusé', kind: 'FORBIDDEN' } }
    
    const entry = await ReadingList.findOne({ where: { id_library: libraryId, id_book: bookId } })
    if (!entry) return { error: { code: 404, message: 'Livre non trouvé dans cette bibliothèque', kind: 'NOT_FOUND' } }
    
    await entry.destroy()
    return { success: true }

  }
}
