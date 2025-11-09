"use server";

import { unstable_cache } from "next/cache";
import { adminDb } from "../admin";
import type { FirebaseError } from "../config";
import { deleteProductImages } from "@/app/actions/admin/products/deleteImages";

export const createProduct = async (productData: {
  title: string;
  description: string;
  brand: string;
  serialNumber: string;
  price: number;
  currency: string;
  taxRate: string;
  images: string[];
  category: string;
  stock: number;
  discount?: number;
  createdBy: string;
}) => {
  console.log("createProduct called with:", productData);

  if (!productData.images || productData.images.length === 0) {
    throw new Error("At least one image is required to create a product");
  }

  const productsRef = adminDb.collection("products");

  const baseProduct = {
    title: productData.title,
    description: productData.description,
    brand: productData.brand,
    serialNumber: productData.serialNumber,
    price: {
      amount: productData.price,
      currency: productData.currency,
    },
    taxRate: productData.taxRate,
    images: productData.images,
    category: productData.category,
    stock: productData.stock,
    draft: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: productData.createdBy,
  };

  const product = productData.discount !== undefined && productData.discount !== null
    ? { ...baseProduct, discount: { rate: productData.discount } }
    : baseProduct;

  console.log("Product object before saving:", product);

  try {
    const docRef = await productsRef.add(product);
    console.log("Document created with ID:", docRef.id);
    return { id: docRef.id, ...product };
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

const fetchAllProductsFromDB = async () => {
  try {
    const productsRef = adminDb.collection("products");
    const querySnapshot = await productsRef.get();

    const products = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    // Remove duplicates at the source using Map
    const uniqueProducts = Array.from(
      new Map(products.map((product) => [product.id, product])).values()
    );

    return uniqueProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getAllProducts = unstable_cache(
  fetchAllProductsFromDB,
  ['products-list'],
  {
    tags: ['products'],
    revalidate: 60, // Cache for 60 seconds
  }
);

const fetchProductsWithLimit = async (limit: number, offset: number) => {
  try {

    const allProducts = await getAllProducts();

    const approvedProducts = allProducts.filter((product) => (product as { draft?: boolean }).draft === false);

    // Randomize products using Fisher-Yates shuffle algorithm
    const shuffledProducts = [...approvedProducts];
    for (let i = shuffledProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledProducts[i], shuffledProducts[j]] = [shuffledProducts[j], shuffledProducts[i]];
    }

    const fetchedProductsWithLimit = shuffledProducts.slice(offset, offset + limit);

    return {
      products: fetchedProductsWithLimit,
      hasMore: offset + limit < shuffledProducts.length,
      total: shuffledProducts.length,
    };
  } catch (error) {
    console.error("Error fetching products with limit:", error);
    throw error;
  }
};

export const getProductsWithLimit = unstable_cache(
  async (limit: number, offset: number) => fetchProductsWithLimit(limit, offset),
  ['products-withLimit'],
  {
    tags: ['products'],
    revalidate: 60, 
  }
);

export const deleteProductFromDB = async (productId: string) => {
  try {
    const productRef = adminDb.collection("products").doc(productId);
    await productRef.delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting product from database:", error);
    const firebaseError = error as FirebaseError;
    throw {
      code: firebaseError.code || "firestore/delete-failed",
      message: firebaseError.message || "Failed to delete product from database.",
    };
  }
};

export const deleteProduct = async (productId: string, imageUrls: string[]) => {
  try {
    if (imageUrls && imageUrls.length > 0) {
      const imageDeleteResult = await deleteProductImages(imageUrls);

      if (!imageDeleteResult.success) {
        throw {
          code: imageDeleteResult.error?.code || "storage/delete-failed",
          message:
            imageDeleteResult.error?.message ||
            "Failed to delete product images.",
        };
      }
    }

    await deleteProductFromDB(productId);
    return { success: true };
  } catch (error) {
    console.error("Complete product deletion error:", error);
    const firebaseError = error as FirebaseError;
    throw {
      code: firebaseError.code || "product/delete-failed",
      message:
        firebaseError.message || "Failed to delete product. Please try again.",
    };
  }
};
