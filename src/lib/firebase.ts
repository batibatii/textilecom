import { initializeApp } from "firebase/app";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { deleteProductImages } from "@/app/actions/admin/products/delete";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface FirebaseError {
  code: string;
  message: string;
}

export const getUIErrorFromFirebaseError = (
  firebaseErrorCode: string,
  context?: "login" | "password-change"
) => {
  switch (firebaseErrorCode) {
    case "auth/email-already-in-use":
      return "An account with this email address is already registered";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      if (context === "password-change") {
        return "Current password is incorrect";
      }
      return "Incorrect email or password";
    case "auth/weak-password":
      return "Password should be at least 8 characters";
    case "auth/requires-recent-login":
      return "Please log out and log back in before changing your password";
    default:
      return "An error occurred";
  }
};

export const createUser = async (email: string, userId: string) => {
  const userRef = doc(db, "users", userId);

  const userData = {
    id: userId,
    email: email,
    role: "customer" as const,
    address: {
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "",
    },
    billingAddress: {},
    theme: "light",
    createdAt: new Date().toISOString(),
    discounts: [],
  };

  await setDoc(userRef, userData);
  return userData;
};

export const getUserData = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};

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

  const productsRef = collection(db, "products");

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
    const docRef = await addDoc(productsRef, product);
    console.log("Document created with ID:", docRef.id);
    return { id: docRef.id, ...product };
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);

    const products = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
      };
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const deleteProductFromDB = async (productId: string) => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
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

