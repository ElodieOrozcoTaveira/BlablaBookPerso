import { Request } from 'express';

// Base interfaces
export interface IUser {
  id_user?: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IBook {
  id_book?: number;
  isbn?: string;
  title: string;
  summary?: string;
  nb_pages?: number;
  published_at?: Date;
  cover_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAuthor {
  id_author?: number;
  firstname?: string;
  lastname: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IGenre {
  id_genre?: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ILibrary {
  id_library?: number;
  id_user: number;
  name: string;
  description?: string;
  is_public?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IReadingList {
  id_reading_list?: number;
  id_user: number;
  title: string;
  description?: string;
  is_public?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface INotice {
  id_notice?: number;
  id_user: number;
  id_book: number;
  id_reading_list?: number;
  content: string;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface IRate {
  id_rate?: number;
  id_user: number;
  id_book: number;
  id_reading_list?: number;
  rate: number;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface IRole {
  id_role?: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IPermission {
  id_permission?: number;
  label: string;
  action: string;
  created_at?: Date;
  updated_at?: Date;
}

// Request interfaces extending Express Request
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  session?: any;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query interfaces
export interface SearchQuery {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookSearchQuery extends SearchQuery {
  genre?: string;
  author?: string;
  isbn?: string;
}

// DTO interfaces (Data Transfer Objects)
export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface CreateBookDTO {
  isbn?: string;
  title: string;
  summary?: string;
  nb_pages?: number;
  published_at?: Date;
  authors?: number[];
  genres?: number[];
}

export interface CreateLibraryDTO {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateReadingListDTO {
  title: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateNoticeDTO {
  id_book: number;
  id_reading_list?: number;
  content: string;
}

export interface CreateRateDTO {
  id_book: number;
  id_reading_list?: number;
  rate: number;
}