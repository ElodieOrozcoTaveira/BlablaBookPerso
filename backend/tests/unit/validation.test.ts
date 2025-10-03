import { describe, it, test, expect, afterAll } from '@jest/globals';

import { 
  createAuthorSchema, 
  updateAuthorSchema, 
  authorParamsSchema, 
  authorSearchSchema 
} from '../../src/validation/author.zod';

import { 
  createBookSchema, 
  updateBookSchema, 
  bookParamsSchema, 
  bookSearchSchema 
} from '../../src/validation/book.zod';

import { 
  createGenreSchema, 
  updateGenreSchema, 
  genreParamsSchema, 
  genreSearchSchema 
} from '../../src/validation/genre.zod';

import { 
  idParamSchema, 
  paginationSchema, 
  searchQuerySchema 
} from '../../src/validation/common.zod';

describe('Validation Zod Schemas', () => {
  
  // Tests des schemas communs
  describe('Common Schemas', () => {
    
    test('idParamSchema - should validate valid ID', () => {
      const result = idParamSchema.parse({ id: '123' });
      expect(result.id).toBe(123);
      expect(typeof result.id).toBe('number');
    });

    test('idParamSchema - should reject invalid ID', () => {
      expect(() => idParamSchema.parse({ id: 'abc' })).toThrow();
      expect(() => idParamSchema.parse({ id: '-1' })).toThrow();
      expect(() => idParamSchema.parse({ id: '12.5' })).toThrow();
    });

    test('paginationSchema - should use defaults', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    test('paginationSchema - should validate custom values', () => {
      const result = paginationSchema.parse({ page: '3', limit: '50' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
    });

    test('paginationSchema - should reject limit over 100', () => {
      expect(() => paginationSchema.parse({ limit: '101' })).toThrow('Maximum 100 elements par page');
    });

    test('searchQuerySchema - should validate search term', () => {
      const result = searchQuerySchema.parse({ query: 'tolkien' });
      expect(result.query).toBe('tolkien');
    });
  });

  // Tests des schemas Author
  describe('Author Schemas', () => {
    
    test('createAuthorSchema - should validate valid author', () => {
      const validAuthor = {
        name: 'J.R.R. Tolkien',
        bio: 'Famous fantasy writer',
        birth_date: '1892-01-03',
        death_date: '1973-09-02'
      };
      
      const result = createAuthorSchema.parse(validAuthor);
      expect(result.name).toBe('J.R.R. Tolkien');
      expect(result.birth_date).toBeInstanceOf(Date);
      expect(result.death_date).toBeInstanceOf(Date);
    });

    test('createAuthorSchema - should reject death_date before birth_date', () => {
      const invalidAuthor = {
        name: 'Test Author',
        birth_date: '1973-01-01',
        death_date: '1892-01-01'
      };
      
      expect(() => createAuthorSchema.parse(invalidAuthor)).toThrow();
    });

    test('authorSearchSchema - should merge pagination and search', () => {
      const searchParams = {
        query: 'tolkien',
        name: 'J.R.R.',
        birth_year: '1892',
        page: '2',
        limit: '10'
      };
      
      const result = authorSearchSchema.parse(searchParams);
      expect(result.query).toBe('tolkien');
      expect(result.name).toBe('J.R.R.');
      expect(result.birth_year).toBe(1892);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  // Tests des schemas Book
  describe('Book Schemas', () => {
    
    test('createBookSchema - should validate valid book', () => {
      const validBook = {
        title: 'The Lord of the Rings',
        description: 'Epic fantasy novel',
        publication_year: 1954,
        page_count: 1216,
        language: 'en',
        author_ids: [1, 2],
        genre_ids: [1]
      };
      
      const result = createBookSchema.parse(validBook);
      expect(result.title).toBe('The Lord of the Rings');
      expect(result.publication_year).toBe(1954);
      expect(result.author_ids).toEqual([1, 2]);
    });

    test('createBookSchema - should use default language', () => {
      const book = {
        title: 'Test Book',
        author_ids: [1]
      };
      
      const result = createBookSchema.parse(book);
      expect(result.language).toBe('fr');
    });

    test('bookSearchSchema - should validate search with all filters', () => {
      const searchParams = {
        query: 'lord of rings',
        isbn: '1234567890',
        author: 'tolkien',
        genre: 'fantasy',
        publication_year: '1954',
        page: '1',
        limit: '20'
      };
      
      const result = bookSearchSchema.parse(searchParams);
      expect(result.query).toBe('lord of rings');
      expect(result.publication_year).toBe(1954);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  // Tests des schemas Genre
  describe('Genre Schemas', () => {
    
    test('createGenreSchema - should validate valid genre', () => {
      const validGenre = {
        name: 'Fantasy',
        description: 'Fantasy literature'
      };
      
      const result = createGenreSchema.parse(validGenre);
      expect(result.name).toBe('Fantasy');
      expect(result.description).toBe('Fantasy literature');
    });

    test('genreSearchSchema - should merge search and pagination', () => {
      const searchParams = {
        query: 'fan',
        name: 'fantasy',
        page: '1',
        limit: '50'
      };
      
      const result = genreSearchSchema.parse(searchParams);
      expect(result.query).toBe('fan');
      expect(result.name).toBe('fantasy');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });
  });

  // Tests de coherence entre schemas
  describe('Schema Consistency', () => {
    
    test('All param schemas should use same ID validation', () => {
      const testId = { id: '456' };
      
      const authorResult = authorParamsSchema.parse(testId);
      const bookResult = bookParamsSchema.parse(testId);
      const genreResult = genreParamsSchema.parse(testId);
      
      expect(authorResult.id).toBe(456);
      expect(bookResult.id).toBe(456);
      expect(genreResult.id).toBe(456);
    });

    test('All search schemas should use same pagination defaults', () => {
      const emptySearch = {};
      
      const authorResult = authorSearchSchema.parse(emptySearch);
      const bookResult = bookSearchSchema.parse(emptySearch);
      const genreResult = genreSearchSchema.parse(emptySearch);
      
      expect(authorResult.page).toBe(1);
      expect(authorResult.limit).toBe(20);
      expect(bookResult.page).toBe(1);
      expect(bookResult.limit).toBe(20);
      expect(genreResult.page).toBe(1);
      expect(genreResult.limit).toBe(20);
    });
  });
});