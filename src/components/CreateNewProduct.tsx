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
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductFormSchema, ProductFormData } from "@/Types/productValidation";
import { createProduct, FirebaseError } from "@/lib/firebase";
import { Alert, AlertTitle } from "./ui/alert";
import { useAuth } from "@/app/AuthProvider";

export function CreateNewProduct() {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const totalPages = 3;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      discount: 0,
    },
  });

  const productNumber = watch("serialNumber") || "";

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
    try {
      setError(undefined);
      console.log("Form data:", data);
      console.log("User ID:", user?.uid);
      const productData = {
        ...data,
        discount: data.discount || 0,
        createdBy: user?.uid || "",
      };
      console.log("Product data being sent:", productData);
      const result = await createProduct(productData);
      console.log("Product created successfully:", result);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error creating product:", err);
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message || "Failed to create product");
    }
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
          <div className="flex flex-col gap-2 md:gap-4">
            {currentPage === 1 && (
              <>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs md:text-sm">Title</Label>
                  <Input
                    {...register("title")}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                  {errors.title && (
                    <span className="text-destructive text-[10px] md:text-xs mt-2">
                      {errors.title.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs md:text-sm">Description</Label>
                  <Textarea
                    className="resize-none text-sm min-h-[60px] md:min-h-20 border-b border-b-ring "
                    {...register("description")}
                  />
                  {errors.description && (
                    <span className="text-destructive text-[10px] md:text-xs mt-2">
                      {errors.description.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs md:text-sm">Brand</Label>
                  <Input
                    {...register("brand")}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                  {errors.brand && (
                    <span className="text-destructive text-[10px] md:text-xs mt-2">
                      {errors.brand.message}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 md:gap-4">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <Label className="text-xs md:text-sm">Product Number</Label>
                    <Input
                      {...register("serialNumber")}
                      className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                    />
                    {errors.serialNumber && (
                      <span className="text-destructive text-[10px] md:text-xs mt-2">
                        {errors.serialNumber.message}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {currentPage === 2 && (
              <>
                <div className="flex gap-1.5 md:gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-xs md:text-sm">Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none w-60 sm:w-full"
                    />
                    {errors.price && (
                      <span className="text-destructive text-[10px] md:text-xs mt-2">
                        {errors.price.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 w-20 md:w-32">
                    <Label className="text-xs md:text-sm">Currency</Label>
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
                    {errors.currency && (
                      <span className="text-destructive text-[10px] md:text-xs mt-2">
                        {errors.currency.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs md:text-sm">Tax Rate</Label>
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
                    {errors.taxRate && (
                      <span className="text-destructive text-[10px] md:text-xs mt-2">
                        {errors.taxRate.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs md:text-sm">
                      Image URL (Optional)
                    </Label>
                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      {...register("image")}
                      className="h-8 md:h-9 text-sm min-w-59 sm:min-w-110 md:min-w-155 border-b border-b-ring rounded-none"
                    />
                  </div>
                </div>
              </>
            )}

            {currentPage === 3 && (
              <>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs md:text-sm">Category</Label>
                  <Input
                    {...register("category")}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                  {errors.category && (
                    <span className="text-destructive text-[10px] md:text-xs mt-2">
                      {errors.category.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs md:text-sm">Stock</Label>
                  <Input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                  {errors.stock && (
                    <span className="text-destructive text-[10px] md:text-xs mt-2">
                      {errors.stock.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs md:text-sm">
                    Discount (Optional %)
                  </Label>
                  <Input
                    type="number"
                    {...register("discount", { valueAsNumber: true })}
                    className="h-8 md:h-9 text-sm border-b border-b-ring rounded-none"
                  />
                  {errors.discount && (
                    <span className="text-destructive text-[10px] md:text-xs mt-1">
                      {errors.discount.message}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
        {success && (
          <Alert className="mx-3 mb-2 md:mx-4 md:mb-4">
            <AlertTitle className="text-xs md:text-sm">
              Product created successfully!
            </AlertTitle>
          </Alert>
        )}

        <CardFooter className="flex flex-col gap-2 md:gap-4 p-3 md:p-6">
          <Pagination>
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
          {error && (
            <Alert variant="destructive">
              <AlertTitle className="text-xs md:text-sm">{error}</AlertTitle>
            </Alert>
          )}
          {currentPage === 3 && (
            <Button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full h-8 md:h-9 text-xs md:text-sm"
              onClick={() => {
                console.log("Button clicked!");
                console.log("Form errors:", errors);
                console.log("Is submitting:", isSubmitting);
              }}
            >
              {isSubmitting ? "Creating..." : success ? "Created!" : "Create"}
            </Button>
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
