import { Router } from 'express';
import { getBookDetailsHandler, searchBooksHandler } from '../controllers/openlibrary.controller.js';

const router = Router();

router.get('/search', searchBooksHandler);
router.get('/details/:workId', getBookDetailsHandler);

export default router;
