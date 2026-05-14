export interface PostListItem {
  id: number;
  title: string;
  description?: string;
  date: string;
  updatedAt?: string;
  images: string[];
  isActive: boolean;
  tags: string[];
}