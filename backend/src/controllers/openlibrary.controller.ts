import { NextFunction, Request, Response } from 'express';
import { getBookDetails, searchBooks } from '../services/openlibrary.service.js';

export const searchBooksHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing search query' });

    const results = await searchBooks(q as string);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const getBookDetailsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workId } = req.params;
    const details = await getBookDetails(workId);
    res.json(details);
  } catch (error) {
    next(error);
  }
};
