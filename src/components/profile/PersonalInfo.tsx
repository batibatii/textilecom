"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  PersonalInfoSchema,
  type PersonalInfoData,
} from "@/Types/profileValidation";
import { updateProfile } from "@/app/actions/user/updateProfile";
import { ErrorAlert } from "@/components/alert/ErrorAlert";
import { SuccessAlert } from "@/components/alert/SuccessAlert";
import { LoadingButton } from "@/components/ui/loading-button";

interface PersonalInfoProps {
  user: User;
}

export function PersonalInfo({ user }: PersonalInfoProps) {
  const { refreshUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      email: user.email,
      phoneCountryCode: user.phoneCountryCode || "+1",
      phoneNumber: user.phoneNumber || "",
      addressLine1: user.address?.line1 || "",
      addressLine2: user.address?.line2 || "",
      city: user.address?.city || "",
      postalCode: user.address?.postalCode || "",
      country: user.address?.country || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    reset({
      email: user.email,
      phoneCountryCode: user.phoneCountryCode || "+1",
      phoneNumber: user.phoneNumber || "",
      addressLine1: user.address?.line1 || "",
      addressLine2: user.address?.line2 || "",
      city: user.address?.city || "",
      postalCode: user.address?.postalCode || "",
      country: user.address?.country || "",
    });
  }, [user, reset]);

  const formData = watch();

  const onSubmit = async (data: PersonalInfoData) => {
    try {
      setError(undefined);
      const result = await updateProfile(user.id, data);

      if (result.success) {
        await refreshUser();
        setSuccess(true);
        setIsEditMode(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error?.message || "Failed to update information");
      }
    } catch (err) {
      setError("Failed to update information");
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (!isEditMode) {
      e.preventDefault();
      setIsEditMode(true);
      setError(undefined);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setError(undefined);
    reset({
      email: user.email,
      phoneCountryCode: user.phoneCountryCode || "+31",
      phoneNumber: user.phoneNumber || "",
      addressLine1: user.address?.line1 || "",
      addressLine2: user.address?.line2 || "",
      city: user.address?.city || "",
      postalCode: user.address?.postalCode || "",
      country: user.address?.country || "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 md:gap-4"
    >
      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">Email</Label>
        <p className="text-sm md:text-base py-2 text-muted-foreground W">
          {user.email}
        </p>
        <span className="text-muted-foreground text-xs">
          Email cannot be changed
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">Phone Number</Label>
        {isEditMode ? (
          <div className="flex gap-2">
            <Input
              {...register("phoneCountryCode")}
              placeholder="+31"
              className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none w-20 md:w-24"
            />
            <Input
              {...register("phoneNumber")}
              type="tel"
              placeholder="123456789"
              className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none flex-1"
            />
          </div>
        ) : (
          <p
            className={`text-sm md:text-base py-2 ${
              !formData.phoneNumber ? "text-muted-foreground" : ""
            }`}
          >
            {formData.phoneCountryCode} {formData.phoneNumber || "Not provided"}
          </p>
        )}
        {(errors.phoneCountryCode || errors.phoneNumber) && (
          <span className="text-destructive text-xs mt-1">
            {errors.phoneCountryCode?.message || errors.phoneNumber?.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">Address Line 1</Label>
        {isEditMode ? (
          <Input
            {...register("addressLine1")}
            className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
          />
        ) : (
          <p
            className={`text-sm md:text-base py-2 ${
              !formData.addressLine1 ? "text-muted-foreground" : ""
            }`}
          >
            {formData.addressLine1 || "Not provided"}
          </p>
        )}
        {errors.addressLine1 && (
          <span className="text-destructive text-xs mt-1">
            {errors.addressLine1.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">
          Address Line 2 (Optional)
        </Label>
        {isEditMode ? (
          <Input
            {...register("addressLine2")}
            className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
          />
        ) : (
          <p
            className={`text-sm md:text-base py-2 ${
              !formData.addressLine2 ? "text-muted-foreground" : ""
            }`}
          >
            {formData.addressLine2 || "Not provided"}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <Label className="text-sm md:text-base">City</Label>
          {isEditMode ? (
            <Input
              {...register("city")}
              className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
            />
          ) : (
            <p
              className={`text-sm md:text-base py-2 ${
                !formData.city ? "text-muted-foreground" : ""
              }`}
            >
              {formData.city || "Not provided"}
            </p>
          )}
          {errors.city && (
            <span className="text-destructive text-xs mt-1">
              {errors.city.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <Label className="text-sm md:text-base">Postal Code</Label>
          {isEditMode ? (
            <Input
              {...register("postalCode")}
              className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
            />
          ) : (
            <p
              className={`text-sm md:text-base py-2 ${
                !formData.postalCode ? "text-muted-foreground" : ""
              }`}
            >
              {formData.postalCode || "Not provided"}
            </p>
          )}
          {errors.postalCode && (
            <span className="text-destructive text-xs mt-1">
              {errors.postalCode.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-sm md:text-base">Country</Label>
        {isEditMode ? (
          <Input
            {...register("country")}
            className="h-10 md:h-11 text-sm md:text-base border-b border-b-ring rounded-none"
          />
        ) : (
          <p
            className={`text-sm md:text-base py-2 ${
              !formData.country ? "text-muted-foreground" : ""
            }`}
          >
            {formData.country || "Not provided"}
          </p>
        )}
        {errors.country && (
          <span className="text-destructive text-xs mt-1">
            {errors.country.message}
          </span>
        )}
      </div>

      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="UPDATING..."
        success={success}
        successText="UPDATED!"
        onClick={handleButtonClick}
        className="w-full h-9 md:h-10 text-xs md:text-sm mt-4"
      >
        {isEditMode ? "UPDATE INFORMATION" : "EDIT"}
      </LoadingButton>

      {isEditMode && (
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="w-full h-9 md:h-10 text-xs md:text-sm border-2 shadow-xs"
        >
          CANCEL
        </Button>
      )}

      <SuccessAlert
        message={success ? "Information updated successfully!" : undefined}
        className="mt-2 rounded-none"
      />

      <ErrorAlert message={error} className="mt-2" />
    </form>
  );
}
