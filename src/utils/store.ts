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
  price: string;
  image: string;
};

export type CartProduct = Product & {
  quantity: number;
};