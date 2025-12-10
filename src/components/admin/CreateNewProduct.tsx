"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { FormField } from "@/components/form/FormField";
import { ErrorAlert } from "@/components/alert/ErrorAlert";
import { SuccessAlert } from "@/components/alert/SuccessAlert";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ProductFormSchema,
  ProductFormData,
  PRODUCT_CATEGORIES,
  PRODUCT_SEX_OPTIONS,
} from "@/Types/productValidation";
import type { FirebaseError } from "@/lib/firebase/config";
import { createProductWithRevalidation } from "@/app/actions/admin/products/create";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImages } from "@/app/actions/admin/products/uploadImages";

export function CreateNewProduct() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { user } = useAuth();
  const createOperation = useAsyncData();
  const totalPages = 3;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      discount: 0,
    },
  });

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (selectedImages.length === 0) {
      createOperation.setError("At least one image is required");
      return;
    }

    await createOperation.execute(async () => {
      createOperation.setLoading(true);
      const formData = new FormData();

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      const uploadResult = await uploadImages(formData);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error.message);
      }

      const imageUrls = uploadResult.urls;

      const productData = {
        ...data,
        images: imageUrls,
        discount: data.discount || 0,
        createdBy: user?.uid || "",
      };

      const result = await createProductWithRevalidation(productData);
      console.log("Product created successfully:", result);

      setSelectedImages([]);
      reset({
        discount: 0,
      });
      setCurrentPage(1);

      setTimeout(() => {
        createOperation.setSuccess(false);
      }, 3000);
    });
  };

  const innerCard = (
    <Card className="h-fit w-90  sm:w-150  border shadow-sm md:w-200 ">
      <CardHeader className="p-3 pb-2 md:p-6">
        <CardTitle className="text-base md:text-2xl">
          Create New Product
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Page {currentPage} of {totalPages}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col gap-3 md:gap-4">
            {currentPage === 1 && (
              <>
                <FormField label="Title" error={errors.title}>
                  <Input
                    {...register("title")}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                </FormField>
                <FormField label="Description" error={errors.description}>
                  <Textarea
                    className="resize-none text-sm min-h-[60px] md:min-h-20 max-h-32 overflow-y-auto border-b border-b-ring "
                    {...register("description")}
                  />
                </FormField>
                <FormField label="Brand" error={errors.brand}>
                  <Input
                    {...register("brand")}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                </FormField>
                <div className="flex gap-2 md:gap-4">
                  <FormField
                    label="Product Number"
                    error={errors.serialNumber}
                    className="flex-1"
                  >
                    <Input
                      {...register("serialNumber")}
                      className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                    />
                  </FormField>
                </div>
              </>
            )}

            {currentPage === 2 && (
              <>
                <div className="flex gap-2 md:gap-4">
                  <FormField
                    label="Price"
                    error={errors.price}
                    className="flex-1"
                  >
                    <Input
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none w-60 sm:w-full"
                    />
                  </FormField>
                  <FormField
                    label="Currency"
                    error={errors.currency}
                    className="w-20 md:w-32"
                  >
                    <NativeSelect
                      defaultValue=""
                      {...register("currency")}
                      className="h-8 md:h-9 text-xs md:text-sm border border-b-ring rounded-none"
                    >
                      <NativeSelectOption value="" disabled>
                        Select
                      </NativeSelectOption>
                      <NativeSelectOption value="USD">
                        $ (USD)
                      </NativeSelectOption>
                      <NativeSelectOption value="EUR">
                        € (EUR)
                      </NativeSelectOption>
                      <NativeSelectOption value="TRY">
                        ₺ (TRY)
                      </NativeSelectOption>
                    </NativeSelect>
                  </FormField>
                </div>
                <div className="flex gap-3">
                  <FormField label="Tax Rate" error={errors.taxRate}>
                    <NativeSelect
                      defaultValue=""
                      {...register("taxRate")}
                      className="h-8 md:h-9 text-xs md:text-sm border-b border-b-ring rounded-none"
                    >
                      <NativeSelectOption value="" disabled>
                        Select
                      </NativeSelectOption>
                      <NativeSelectOption value="%1">%1</NativeSelectOption>
                      <NativeSelectOption value="%8">%8</NativeSelectOption>
                      <NativeSelectOption value="%18">%18</NativeSelectOption>
                      <NativeSelectOption value="%20">%20</NativeSelectOption>
                    </NativeSelect>
                  </FormField>
                  <FormField label="Images (Required)">
                    <Input
                      type="file"
                      multiple
                      required
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          setSelectedImages(files);
                          createOperation.setError(undefined);
                        } else {
                          setSelectedImages([]);
                        }
                      }}
                      disabled={createOperation.loading || isSubmitting}
                      className="h-8 md:h-9 text-sm min-w-59 sm:min-w-110 md:min-w-155 border-b border-b-ring rounded-none cursor-pointer"
                    />
                    {selectedImages.length > 0 && (
                      <span className="text-xs text-muted-foreground mt-1">
                        Selected: {selectedImages.length} image
                        {selectedImages.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </FormField>
                </div>
              </>
            )}

            {currentPage === 3 && (
              <>
                <FormField label="Category" error={errors.category}>
                  <NativeSelect
                    defaultValue=""
                    {...register("category")}
                    className="h-8 md:h-9 text-xs md:text-sm border-b border-b-ring rounded-none"
                  >
                    <NativeSelectOption value="" disabled>
                      Select a category
                    </NativeSelectOption>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <NativeSelectOption key={category} value={category}>
                        {category}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Gender" error={errors.sex}>
                  <NativeSelect
                    defaultValue=""
                    {...register("sex")}
                    className="h-8 md:h-9 text-xs md:text-sm border-b border-b-ring rounded-none"
                  >
                    <NativeSelectOption value="" disabled>
                      Select gender
                    </NativeSelectOption>
                    {PRODUCT_SEX_OPTIONS.map((sex) => (
                      <NativeSelectOption key={sex} value={sex}>
                        {sex}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Stock" error={errors.stock}>
                  <Input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                </FormField>
                <FormField
                  label="Discount (Optional %)"
                  error={errors.discount}
                >
                  <Input
                    type="number"
                    {...register("discount", { valueAsNumber: true })}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                </FormField>
              </>
            )}
          </div>
        </CardContent>
        <SuccessAlert
          message={
            createOperation.success
              ? "Product created successfully!"
              : undefined
          }
          className="mx-3 mb-2 md:mx-4 md:mb-4 p-2 rounded-none"
        />

        <CardFooter className="flex flex-col gap-2 md:gap-4 p-3 md:p-6">
          <Pagination className="flex justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {[1, 2, 3].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <ErrorAlert message={createOperation.error} />
          {currentPage === 3 && (
            <LoadingButton
              type="submit"
              loading={createOperation.loading || isSubmitting}
              loadingText="CREATING..."
              success={createOperation.success}
              successText="CREATED!"
              className="w-full h-8 md:h-9 text-xs md:text-sm"
            >
              CREATE
            </LoadingButton>
          )}
        </CardFooter>
      </form>
    </Card>
  );

  return (
    <>
      <div className="xl:hidden">{innerCard}</div>
      <Card className="hidden xl:flex border h-250 w-450 justify-center items-center shadow-md">
        {innerCard}
      </Card>
    </>
  );
}
