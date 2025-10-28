"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SignUp } from "@/components/SignUp";
import { LoginAndSignUpType } from "@/Types/authTypes";
import { useAuth } from "@/app/AuthProvider";
import { getUIErrorFromFirebaseError, FirebaseError } from "@/lib/firebase";

export default function SignUpPage() {
  const router = useRouter();
  const { register, login, loginWithGoogle } = useAuth();
  const [firebaseError, setFirebaseError] = useState<string | undefined>();

  const handleSignUp = async (data: LoginAndSignUpType) => {
    try {
      setFirebaseError(undefined);
      await register(data.email, data.password);
      router.push("/");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getUIErrorFromFirebaseError(firebaseError.code);
      setFirebaseError(errorMessage);
    }
  };

  const handleSignIn = async (data: LoginAndSignUpType) => {
    try {
      setFirebaseError(undefined);
      await login(data.email, data.password);
      router.push("/");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getUIErrorFromFirebaseError(firebaseError.code, "login");
      setFirebaseError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setFirebaseError(undefined);
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getUIErrorFromFirebaseError(firebaseError.code);
      setFirebaseError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      <div className="lg:w-1/2 flex flex-col">
        <div className="text-start mt-12 w-[95%] lg:w-[60%] mx-auto lg:mx-0 lg:ml-[10%] pl-2">
          <Link href={"/"}>
            <h1 className="font-bold tracking-wider text-2xl antialiased md:text-3xl ">
              TEXTILECOM
            </h1>
          </Link>
        </div>
        <main className="pt-10 flex-1">
          <SignUp
            onSignUp={handleSignUp}
            onSignIn={handleSignIn}
            onGoogleLogin={handleGoogleLogin}
            firebaseError={firebaseError}
          />
        </main>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/loginPage.jpeg"
          alt="Fashion"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
