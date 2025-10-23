"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginAndSignUpSchema, LoginAndSignUpType } from "@/Types/authTypes";
import { useState } from "react";

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
          <Alert variant="destructive" className="">
            <AlertTitle className="text-[11px]">
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
          <Alert variant="destructive" className="">
            <AlertTitle className="text-[11px]">
              {errors.password.message}
            </AlertTitle>
          </Alert>
        )}
        {firebaseError && (
          <Alert variant="destructive">
            <AlertTitle className="text-[11px]">{firebaseError}</AlertTitle>
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
          <Button
            type="submit"
            disabled={signingIn || signingUp}
            className="hover:bg-primary/90 w-[97%]"
          >
            {signingIn ? "SIGNING IN..." : "SIGN IN"}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handleSignUpClick)}
            disabled={signingIn || signingUp}
            className="bg-background text-foreground/70 border-foreground border hover:text-foreground/50 w-[97%]"
          >
            {signingUp ? "CREATING ACCOUNT..." : "SIGN UP"}
          </Button>
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
