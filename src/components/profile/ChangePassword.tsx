"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  ChangePasswordSchema,
  type ChangePasswordData,
} from "@/Types/profileValidation";
import { changePassword } from "@/app/actions/user/changePassword";
import { auth } from "@/lib/firebase/config";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";

export function ChangePassword() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      setError(undefined);

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        setError("User not authenticated");
        return;
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        data.currentPassword
      );

      try {
        await reauthenticateWithCredential(currentUser, credential);
      } catch (err) {
        const firebaseError = err as { code?: string };
        if (
          firebaseError.code === "auth/wrong-password" ||
          firebaseError.code === "auth/invalid-credential"
        ) {
          setError("Current password is incorrect");
        } else {
          setError("Failed to verify current password");
        }
        return;
      }

      const result = await changePassword(authUser!.id, data);

      if (result.success) {
        setSuccess(true);
        reset();

        setTimeout(() => {
          logout();
          router.push("/user/signup");
        }, 2000);
      } else {
        setError(result.error?.message || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to change password");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 md:gap-4"
    >
      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">Current Password</Label>
        <Input
          type="password"
          {...register("currentPassword")}
          className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
        />
        {errors.currentPassword && (
          <span className="text-destructive text-xs mt-1">
            {errors.currentPassword.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">New Password</Label>
        <Input
          type="password"
          {...register("newPassword")}
          className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
        />
        {errors.newPassword && (
          <span className="text-destructive text-xs mt-1">
            {errors.newPassword.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">Confirm New Password</Label>
        <Input
          type="password"
          {...register("confirmPassword")}
          className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
        />
        {errors.confirmPassword && (
          <span className="text-destructive text-xs mt-1">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {success && (
        <Alert className="mt-2">
          <AlertTitle className="text-sm">
            Password changed successfully! Redirecting to login...
          </AlertTitle>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle className="text-sm">{error}</AlertTitle>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || success}
        className="w-full h-9 md:h-10 text-xs md:text-sm mt-4"
      >
        {isSubmitting
          ? "CHANGING..."
          : success
          ? "CHANGED!"
          : "CHANGE PASSWORD"}
      </Button>
    </form>
  );
}
