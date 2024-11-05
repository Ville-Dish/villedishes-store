type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: { id: string; rating: number; comment: string; author: string }[];
};
