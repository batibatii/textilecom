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
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

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
      // Show different message based on context
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
  image?: string;
  category: string;
  stock: number;
  discount?: number;
  createdBy: string;
}) => {
  console.log("createProduct called with:", productData);
  const productsRef = collection(db, "products");

  const product: any = {
    ...productData,
    price: {
      amount: productData.price,
      currency: productData.currency,
    },
    image: productData.image || "",
    draft: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (productData.discount !== undefined && productData.discount !== null) {
    product.discount = { rate: productData.discount };
  }

  console.log("Product object before saving:", product);
  const { currency, ...productWithoutCurrency } = product;
  console.log(
    "Product object after removing currency:",
    productWithoutCurrency
  );

  try {
    const docRef = await addDoc(productsRef, productWithoutCurrency);
    console.log("Document created with ID:", docRef.id);
    return { id: docRef.id, ...productWithoutCurrency };
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};
