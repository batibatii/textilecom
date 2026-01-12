"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { H1 } from "@/components/ui/headings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { LoadingButton } from "@/components/ui/loading-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { getUIErrorFromFirebaseError } from "@/lib/firebase/auth";
import type { FirebaseError } from "@/lib/firebase/config";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [firebaseError, setFirebaseError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordType) => {
    setIsLoading(true);
    setFirebaseError(undefined);
    setSuccessMessage(undefined);

    try {
      await resetPassword(data.email);
      setSuccessMessage(
        "Password reset email sent! Please check your inbox and spam folder."
      );
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getUIErrorFromFirebaseError(firebaseError.code);
      setFirebaseError(errorMessage || firebaseError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:flex">
      <div className="lg:w-1/2 flex flex-col">
        <div className="text-start mt-12 w-[95%] lg:w-[60%] mx-auto lg:mx-0 lg:ml-[10%] pl-2">
          <Link href={"/"}>
            <H1 className="tracking-wider text-2xl md:text-3xl">TEXTILECOM</H1>
          </Link>
        </div>
        <main className="pt-10 flex-1">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-[95%] lg:w-[60%] mx-auto lg:mx-0 lg:ml-[10%] gap-8 pl-2"
          >
            <div className="pl-1 font-light text-[14px] md:text-sm md:font-extralight mt-16 md:mt-24">
              <span className="tracking-widest">RESET PASSWORD</span>
            </div>

            <p className="pl-1 text-sm text-muted-foreground/70 font-extralight">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <div className="flex flex-col gap-8">
              <div className="relative pt-4">
                <Input
                  id="email"
                  type="email"
                  placeholder=" "
                  className="peer placeholder:text-transparent font-extralight"
                  {...register("email")}
                />
                <Label
                  htmlFor="email"
                  className="absolute left-1 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/50 transition-all duration-300 ease-out pointer-events-none peer-focus:top-1 peer-focus:text-[11px] peer-focus:translate-y-0 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:translate-y-0"
                >
                  EMAIL
                </Label>
                <div className="absolute bottom-0 left-1 h-px w-[96%] bg-ring"></div>
              </div>
              {errors.email && (
                <Alert
                  variant="destructive"
                  className="gap-x-1! items-center! [&>svg]:translate-y-0!"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
                  </svg>
                  <AlertTitle className="text-[11px] font-extralight">
                    {errors.email.message}
                  </AlertTitle>
                </Alert>
              )}
              {firebaseError && (
                <Alert
                  variant="destructive"
                  className="gap-x-1! items-center! [&>svg]:translate-y-0!"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
                  </svg>
                  <AlertTitle className="text-[11px] font-extralight">
                    {firebaseError}
                  </AlertTitle>
                </Alert>
              )}
              {successMessage && (
                <Alert className="gap-x-1! items-center! [&>svg]:translate-y-0! border-green-500 bg-green-50 text-green-800 pl-0 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                  <AlertTitle className="text-[11px] font-extralight">
                    {successMessage}
                  </AlertTitle>
                </Alert>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <LoadingButton
                type="submit"
                loading={isLoading}
                loadingText="SENDING EMAIL..."
                className="hover:bg-primary/90 w-[97%]"
              >
                SEND RESET LINK
              </LoadingButton>
              <Button
                type="button"
                onClick={() => router.push("/user/signup")}
                variant="outline"
                className="bg-background text-foreground/70 border-foreground hover:bg-background hover:font-bold w-[97%]"
              >
                BACK TO LOGIN
              </Button>
            </div>
          </form>
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
