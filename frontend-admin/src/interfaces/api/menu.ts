/**
 * Tipos para el catálogo / menú
 */

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  available?: boolean;
  category_id?: string | null;
  image_url?: string | null;
}

export interface Category {
  id: string;
  name: string;
}
