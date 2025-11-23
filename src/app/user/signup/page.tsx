"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { H1 } from "@/components/ui/headings";
import { SignUp } from "@/components/auth/SignUp";
import { LoginAndSignUpType } from "@/types/authValidation";
import { useAuth } from "@/contexts/AuthContext";
import { getUIErrorFromFirebaseError } from "@/lib/firebase/auth";
import type { FirebaseError } from "@/lib/firebase/config";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, login, loginWithGoogle } = useAuth();
  const [firebaseError, setFirebaseError] = useState<string | undefined>();

  // Get redirect URL from query params, default to home
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSignUp = async (data: LoginAndSignUpType) => {
    try {
      setFirebaseError(undefined);
      await register(data.email, data.password);
      router.push(redirectUrl);
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
      router.push(redirectUrl);
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getUIErrorFromFirebaseError(
        firebaseError.code,
        "login"
      );
      setFirebaseError(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setFirebaseError(undefined);
      await loginWithGoogle();
      router.push(redirectUrl);
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
            <H1 className="tracking-wider text-2xl md:text-3xl">
              TEXTILECOM
            </H1>
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
          loading="lazy"
        />
      </div>
    </div>
  );
}
