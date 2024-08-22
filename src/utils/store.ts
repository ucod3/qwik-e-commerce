export type Store = {
  cart: Cart;
};

type Cart = {
  products: CartProduct[];
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  slug: string;
};
export type CartProduct = Product & {
  quantity: number;
};