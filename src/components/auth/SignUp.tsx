"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginAndSignUpSchema,
  LoginAndSignUpType,
} from "@/Types/authValidation";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";

type SignUpProps = {
  onSignUp: (data: LoginAndSignUpType) => void | Promise<void>;
  onSignIn: (data: LoginAndSignUpType) => void | Promise<void>;
  onGoogleLogin: () => void;
  firebaseError?: string;
};

export function SignUp({
  onSignUp,
  onSignIn,
  onGoogleLogin,
  firebaseError,
}: SignUpProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginAndSignUpType>({
    resolver: zodResolver(LoginAndSignUpSchema),
    mode: "onBlur",
  });

  const handleSignInClick = async (data: LoginAndSignUpType) => {
    setSigningIn(true);
    try {
      await onSignIn(data);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignUpClick = async (data: LoginAndSignUpType) => {
    setSigningUp(true);
    try {
      await onSignUp(data);
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleSignInClick)}
      className="flex flex-col w-[95%] lg:w-[60%] mx-auto lg:mx-0 lg:ml-[10%] gap-8 pl-2"
    >
      <div className="pl-1 font-light text-[14px] md:text-sm md:font-extralight mt-16 md:mt-24">
        <span className="tracking-widest">LOGIN</span>
      </div>
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
        <div className="relative pt-4">
          <Input
            id="password"
            type="password"
            placeholder=" "
            className="peer placeholder:text-transparent font-extralight"
            {...register("password")}
          />
          <Label
            htmlFor="password"
            className="absolute left-1 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/50 transition-all duration-300 ease-out pointer-events-none peer-focus:top-1 peer-focus:text-[11px] peer-focus:translate-y-0 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:translate-y-0"
          >
            PASSWORD
          </Label>
          <div className="absolute bottom-0 left-1 h-px w-[96%] bg-ring"></div>
        </div>
        {errors.password && (
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
              {errors.password.message}
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
      </div>

      <div className="flex flex-col gap-12">
        <div>
          <span className="pl-1 font-light text-[12px] md:text-sm md:font-extralight">
            Forget your password?
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <LoadingButton
            type="submit"
            loading={signingIn}
            loadingText="SIGNING IN..."
            disabled={signingUp}
            className="hover:bg-primary/90 w-[97%]"
          >
            SIGN IN
          </LoadingButton>
          <LoadingButton
            type="button"
            onClick={handleSubmit(handleSignUpClick)}
            loading={signingUp}
            loadingText="CREATING ACCOUNT..."
            disabled={signingIn}
            className="bg-background text-foreground/70 border-foreground border hover:bg-background hover:font-bold w-[97%]"
          >
            SIGN UP
          </LoadingButton>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-[45%] border-t" />
        <span className="text-sm uppercase text-foreground">or</span>
        <div className="w-[45%] border-t" />
      </div>

      <Button
        type="button"
        onClick={onGoogleLogin}
        className="bg-background text-foreground/70 border-foreground border hover:text-foreground/50 w-[97%]"
      >
        <Image
          src="/images/googleIconSmall.svg"
          alt="Google"
          width={25}
          height={25}
        />
        SIGN IN WITH GOOGLE
      </Button>
    </form>
  );
}
