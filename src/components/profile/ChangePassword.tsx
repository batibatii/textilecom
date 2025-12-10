"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  ChangePasswordSchema,
  type ChangePasswordData,
} from "@/Types/profileValidation";
import { FormField } from "@/components/form/FormField";
import { ErrorAlert } from "@/components/alert/ErrorAlert";
import { SuccessAlert } from "@/components/alert/SuccessAlert";
import { LoadingButton } from "@/components/ui/loading-button";
import { changePassword } from "@/app/actions/user/changePassword";
import { auth } from "@/lib/firebase/config";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAsyncData } from "@/hooks/useAsyncData";

export function ChangePassword() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const passwordOperation = useAsyncData();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    await passwordOperation.execute(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("User not authenticated");
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
          throw new Error("Current password is incorrect");
        } else {
          throw new Error("Failed to verify current password");
        }
      }

      const result = await changePassword(authUser!.id, data);

      if (result.success) {
        reset();

        setTimeout(() => {
          logout();
          router.push("/user/signup");
        }, 2000);
      } else {
        throw new Error(result.error?.message || "Failed to change password");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 md:gap-4"
    >
      <FormField label="Current Password" error={errors.currentPassword}>
        <Input
          type="password"
          {...register("currentPassword")}
          className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
        />
      </FormField>

      <FormField label="New Password" error={errors.newPassword}>
        <Input
          type="password"
          {...register("newPassword")}
          className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
        />
      </FormField>

      <FormField label="Confirm New Password" error={errors.confirmPassword}>
        <Input
          type="password"
          {...register("confirmPassword")}
          className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
        />
      </FormField>

      <SuccessAlert
        message={
          passwordOperation.success
            ? "Password changed successfully! Redirecting to login..."
            : undefined
        }
        className="mt-2"
      />

      <ErrorAlert message={passwordOperation.error} className="mt-2" />

      <LoadingButton
        type="submit"
        loading={passwordOperation.loading}
        loadingText="CHANGING..."
        success={passwordOperation.success}
        successText="CHANGED!"
        className="w-full h-9 md:h-10 text-xs md:text-sm mt-4"
      >
        CHANGE PASSWORD
      </LoadingButton>
    </form>
  );
}
