"use client";

import {
  Product,
  ProductFormSchema,
  ProductFormData,
} from "@/Types/productValidation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SEX_OPTIONS,
} from "@/Types/productValidation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { uploadImages } from "@/app/actions/admin/products/uploadImages";
import { deleteProductImages } from "@/app/actions/admin/products/deleteImages";
import { updateProduct } from "@/app/actions/admin/products/update";
import { useAuth } from "@/contexts/AuthContext";
import { convertMultiplierToTaxRate } from "@/lib/utils/taxRate";

interface EditProductDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function EditProductDrawer({
  product,
  open,
  onOpenChange,
  onUpdate,
}: EditProductDrawerProps) {
  const { user } = useAuth();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      title: "",
      description: "",
      brand: "",
      serialNumber: "",
      price: 0,
      currency: "",
      taxRate: "",
      category: undefined,
      sex: undefined,
      stock: 0,
      discount: 0,
    },
  });

  useEffect(() => {
    if (open && product) {
      reset({
        title: product.title,
        description: product.description,
        brand: product.brand,
        serialNumber: product.serialNumber,
        price: product.price.amount,
        currency: product.price.currency,
        taxRate: convertMultiplierToTaxRate(product.taxRate),
        category: product.category,
        sex: product.sex,
        stock: product.stock,
        discount: product.discount?.rate || 0,
      });

      setNewImages([]);
      setUploadError(undefined);
      setDeleteError(undefined);
      setProductImages(product.images || []);
      setCurrentImageIndex(0);
    }
  }, [open, product, reset]);

  // Track carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    onSelect(); // Set initial index

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setNewImages(Array.from(files));
      setUploadError(undefined);
    }
  };

  const handleDeleteImage = async () => {
    if (!user) {
      setDeleteError("You must be logged in to delete images.");
      return;
    }

    if (!product || productImages.length === 0) return;

    if (productImages.length === 1) {
      setDeleteError(
        "Cannot delete the last image. At least one image is required."
      );
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      const imageToDelete = productImages[currentImageIndex];

      const deleteResult = await deleteProductImages([imageToDelete]);

      if (!deleteResult.success) {
        setDeleteError(deleteResult.error.message);
        setIsDeleting(false);
        return;
      }

      const updatedImages = productImages.filter(
        (_, index) => index !== currentImageIndex
      );
      setProductImages(updatedImages);

      await updateProduct(product.id, {
        title: product.title,
        description: product.description,
        brand: product.brand,
        serialNumber: product.serialNumber,
        price: product.price,
        taxRate: product.taxRate,
        category: product.category,
        sex: product.sex,
        stock: product.stock,
        discount: product.discount || null,
        images: updatedImages,
        updatedAt: new Date().toISOString(),
      });

      // Adjust carousel index if needed
      if (
        currentImageIndex >= updatedImages.length &&
        updatedImages.length > 0
      ) {
        setCurrentImageIndex(updatedImages.length - 1);
        carouselApi?.scrollTo(updatedImages.length - 1);
      }
    } catch (error) {
      console.error("Delete image error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the image.";
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsUploading(true);
    setUploadError(undefined);

    try {
      let uploadedImageUrls: string[] = [];

      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((file) => {
          formData.append("images", file);
        });

        const uploadResult = await uploadImages(formData);

        if (!uploadResult.success) {
          setUploadError(uploadResult.error.message);
          setIsUploading(false);
          return;
        }

        uploadedImageUrls = uploadResult.urls;
      }

      const allImageUrls = [...productImages, ...uploadedImageUrls];

      if (allImageUrls.length === 0) {
        setUploadError("At least one image is required");
        setIsUploading(false);
        return;
      }

      if (!product) {
        throw new Error("Product not found");
      }

      const updatedData = {
        title: data.title,
        description: data.description,
        brand: data.brand,
        serialNumber: data.serialNumber,
        price: {
          amount: data.price,
          currency: data.currency,
        },
        taxRate: data.taxRate,
        category: data.category,
        sex: data.sex,
        stock: data.stock,
        discount:
          data.discount && data.discount > 0 ? { rate: data.discount } : null,
        images: allImageUrls,
        updatedAt: new Date().toISOString(),
      };

      await updateProduct(product.id, updatedData);

      onOpenChange(false);
      if (onUpdate) {
        onUpdate();
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while updating the product.";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (!product) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] h-[95vh]  md:max-h-[85vh] md:h-[55vh] flex flex-col">
        <DrawerHeader className="shrink-0">
          <DrawerTitle className="text-xl font-light tracking-wider">
            EDIT PRODUCT
          </DrawerTitle>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="container mx-auto px-6 pb-8 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4 lg:justify-between lg:h-full">
              <Carousel
                className="w-full max-w-md mx-auto"
                setApi={setCarouselApi}
              >
                <CarouselContent>
                  {productImages.length > 0 ? (
                    productImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative w-full h-64 lg:h-96 bg-muted">
                          <Image
                            src={image}
                            alt={`${product.title} - Image ${index + 1}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 500px"
                            loading="lazy"
                          />
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="relative w-full h-64 lg:h-96 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Image</span>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious type="button" />
                <CarouselNext type="button" />
              </Carousel>

              <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
                <div className="flex gap-15">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="h-9 text-sm cursor-pointer border-b border-b-ring rounded-none flex-2 "
                    onChange={handleFileChange}
                  />
                  <Label className="flex-1.5">
                    {" "}
                    <ArrowLeft strokeWidth={1.3} />
                    Upload New Images
                  </Label>
                </div>
                {newImages.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {newImages.length} file(s) selected
                  </span>
                )}
                {uploadError && (
                  <span className="text-destructive text-xs">
                    {uploadError}
                  </span>
                )}
                {deleteError && (
                  <span className="text-destructive text-xs">
                    {deleteError}
                  </span>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={isDeleting || productImages.length === 0}
                  className="w-full h-9 text-xs font-light rounded-none"
                >
                  {isDeleting ? "DELETING..." : "DELETE SELECTED IMAGE"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-2 flex flex-col gap-0.5">
                <Label className="text-xs">Title</Label>
                <Input
                  {...register("title")}
                  className="h-8 text-sm border-b border-b-ring rounded-none"
                />
                {errors.title && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div className="col-span-2 flex flex-col gap-0.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  {...register("description")}
                  className="resize-none text-sm min-h-16 max-h-32 overflow-y-auto border-b border-b-ring"
                />
                {errors.description && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Brand</Label>
                <Input
                  {...register("brand")}
                  className="h-8 text-sm border-b border-b-ring rounded-none"
                />
                {errors.brand && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.brand.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Product Number</Label>
                <Input
                  {...register("serialNumber")}
                  className="h-8 text-sm border-b border-b-ring rounded-none"
                />
                {errors.serialNumber && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.serialNumber.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="h-8 text-sm border-b border-b-ring rounded-none"
                />
                {errors.price && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.price.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs">Currency</Label>
                  <NativeSelect
                    defaultValue=""
                    {...register("currency")}
                    className="h-8 text-xs border border-b-ring rounded-none"
                  >
                    <NativeSelectOption value="" disabled>
                      Select
                    </NativeSelectOption>
                    <NativeSelectOption value="USD">$ (USD)</NativeSelectOption>
                    <NativeSelectOption value="EUR">€ (EUR)</NativeSelectOption>
                    <NativeSelectOption value="TRY">₺ (TRY)</NativeSelectOption>
                  </NativeSelect>
                  {errors.currency && (
                    <span className="text-destructive text-[10px] mt-1">
                      {errors.currency.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs">Gender</Label>
                  <NativeSelect
                    defaultValue=""
                    {...register("sex")}
                    className="h-8 text-xs border-b border-b-ring rounded-none"
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
                  {errors.sex && (
                    <span className="text-destructive text-[10px] mt-1">
                      {errors.sex.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Tax</Label>
                <NativeSelect
                  defaultValue=""
                  {...register("taxRate")}
                  className="h-8 text-xs border-b border-b-ring rounded-none"
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
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.taxRate.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className="h-8 text-sm border-b border-b-ring rounded-none"
                />
                {errors.stock && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.stock.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Category</Label>
                <NativeSelect
                  defaultValue=""
                  {...register("category")}
                  className="h-8 text-xs border-b border-b-ring rounded-none"
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
                {errors.category && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.category.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <Label className="text-xs">Discount (%)</Label>
                <Input
                  type="number"
                  {...register("discount", { valueAsNumber: true })}
                  className="h-8 text-sm border-b border-b-ring rounded-none"
                />
                {errors.discount && (
                  <span className="text-destructive text-[10px] mt-1">
                    {errors.discount.message}
                  </span>
                )}
              </div>

              <div className="col-span-2 flex flex-col gap-2 mt-4">
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="w-full h-9 text-xs font-light rounded-none"
                >
                  {isUploading ? "UPLOADING..." : "UPDATE PRODUCT"}
                </Button>
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isUploading}
                  variant="outline"
                  className="w-full h-9 text-xs font-light rounded-none"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
