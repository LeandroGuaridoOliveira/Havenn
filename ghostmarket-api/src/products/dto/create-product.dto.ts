export class CreateProductDto {
  name: string;
  description: string;
  details?: string;   // Opcional
  category?: string;  // Opcional
  videoUrl?: string;  // Opcional
  price: number;
  storageKey: string;
  imageUrl?: string;
}