# BlaBlaBook Backend Controllers

This directory contains all the API controllers for the BlaBlaBook application.

## Overview

The controllers implement a complete REST API following the specifications in the CDC documentation. Each controller handles a specific domain of the application with proper TypeScript typing and error handling.

## Controllers

### 📝 User Controller (`user.controller.ts`)
- **GET** `/api/user/profile` - Get user profile
- **PUT** `/api/user/profile` - Update user profile
- **DELETE** `/api/user/account` - Delete user account

### 📚 Book Controller (`book.controller.ts`)
- **GET** `/api/books` - Search books with filters
- **GET** `/api/books/:id` - Get book details
- **POST** `/api/books` - Create book (Admin)
- **PUT** `/api/books/:id` - Update book (Admin)
- **DELETE** `/api/books/:id` - Delete book (Admin)

### 📖 Library Controller (`library.controller.ts`)
- **GET** `/api/libraries` - Get user libraries
- **POST** `/api/libraries` - Create library
- **GET** `/api/libraries/:id` - Get library details
- **PUT** `/api/libraries/:id` - Update library
- **DELETE** `/api/libraries/:id` - Delete library
- **POST** `/api/libraries/:id/books/:bookId` - Add book to library
- **DELETE** `/api/libraries/:id/books/:bookId` - Remove book from library

### 📋 Reading List Controller (`reading-list.controller.ts`)
- **GET** `/api/reading-lists` - Get user reading lists
- **POST** `/api/reading-lists` - Create reading list
- **GET** `/api/reading-lists/:id` - Get reading list details
- **PUT** `/api/reading-lists/:id` - Update reading list
- **DELETE** `/api/reading-lists/:id` - Delete reading list
- **POST** `/api/reading-lists/:id/books` - Add book to reading list
- **DELETE** `/api/reading-lists/:id/books/:bookId` - Remove book from reading list

### 💬 Notice Controller (`notice.controller.ts`)
- **GET** `/api/notices` - Get notices with filters
- **GET** `/api/notices/:id` - Get notice details
- **POST** `/api/notices` - Create notice
- **PUT** `/api/notices/:id` - Update notice
- **DELETE** `/api/notices/:id` - Delete notice

### ⭐ Rate Controller (`rate.controller.ts`)
- **GET** `/api/rates` - Get rates with filters
- **GET** `/api/rates/:id` - Get rate details
- **POST** `/api/rates` - Create rate (1-5 stars)
- **PUT** `/api/rates/:id` - Update rate
- **DELETE** `/api/rates/:id` - Delete rate

### 👤 Author Controller (`author.controller.ts`)
- **GET** `/api/authors` - Get authors with search
- **GET** `/api/authors/:id` - Get author details
- **POST** `/api/authors` - Create author (Admin)
- **PUT** `/api/authors/:id` - Update author (Admin)
- **DELETE** `/api/authors/:id` - Delete author (Admin)

### 🏷️ Genre Controller (`genre.controller.ts`)
- **GET** `/api/genres` - Get all genres
- **GET** `/api/genres/popular` - Get popular genres
- **GET** `/api/genres/:id` - Get genre details
- **POST** `/api/genres` - Create genre (Admin)
- **PUT** `/api/genres/:id` - Update genre (Admin)
- **DELETE** `/api/genres/:id` - Delete genre (Admin)

### 📤 Upload Controller (`upload.controller.ts`)
- **POST** `/api/upload/cover` - Upload book cover
- **POST** `/api/upload/avatar` - Upload user avatar
- **DELETE** `/api/upload/:type/:filename` - Delete uploaded file
- **GET** `/api/upload/info/:type/:filename` - Get file info

## Features

### ✅ Implemented
- Complete TypeScript type definitions
- Proper error handling with consistent API responses
- Input validation and sanitization
- File upload handling with security checks
- Mock data for immediate testing
- RESTful API design following best practices
- Pagination support for list endpoints
- Search functionality with filters

### 🔄 Ready for Integration
- Database integration (Sequelize models prepared)
- Authentication middleware integration (Better Auth)
- Permission-based access control
- Real file processing with Sharp
- Comprehensive input validation

## API Response Format

All controllers return consistent JSON responses:

```typescript
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## Development

The controllers are currently using mock data but are structured to easily integrate with:

1. **Sequelize ORM** - Database operations are commented with TODO markers
2. **Better Auth** - Authentication middleware integration points
3. **Sharp** - Image processing for uploads
4. **Winston** - Logging integration
5. **Joi** - Input validation schemas

## Testing

The server can be started in development mode:

```bash
npm run dev    # Start development server
npm run build  # Build TypeScript
npm run lint   # Check code quality
```

The API responds at `http://localhost:4000` with a health check at `/health`.

## Security

- File upload validation (type, size limits)
- User input sanitization
- Path traversal protection
- Authentication ready integration points
- Role-based access control structure