export type Product = {
  id: string;
  title: string;
  description: string;
  brand: string;
  serialNumber: string;
  price: {
    amount: number;
    currency: string;
  };
  taxRate: number; // 1, 8, 18, 25
  image: string;
  category: string;
  stock: number;
  draft: boolean;
  discount?: {
    rate: number;
  };
  createdAt: Date;
  updatedAt: Date;
};


export type NewProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;

