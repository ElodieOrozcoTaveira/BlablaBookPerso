export interface Book {
  id: string;
  title: string;
  authors: string;
  cover_url: string; // ✅ URL de l'image
  publication_year: number;
  isbn?: string;
  description?: string;
  genre?: string;
  open_library_key?: string;
  rating?: string;
  read?: boolean;
}
