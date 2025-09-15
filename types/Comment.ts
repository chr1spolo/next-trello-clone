export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    image?: string;
  };
}