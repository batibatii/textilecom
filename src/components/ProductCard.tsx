"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { deleteProduct } from "@/lib/firebase";
import { useAuth } from "@/app/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { EditProductDrawer } from "@/components/EditProductDrawer";

interface ProductCardProps {
  product: Product;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
  };
  return symbols[currency] || currency;
};

export function ProductCard({ product, onDelete, onUpdate }: ProductCardProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayPrice = product.discount
    ? (product.price.amount * (1 - product.discount.rate / 100)).toFixed(2)
    : product.price.amount.toFixed(2);

  const hasDiscount = product.discount && product.discount.rate > 0;
  const currencySymbol = getCurrencySymbol(product.price.currency);

  const handleDelete = async () => {
    if (!user) {
      setError("You must be logged in to delete products.");
      return;
    }

    setIsDeleting(true);
    setError(undefined);

    try {
      await deleteProduct(product.id, product.images);

      setIsDialogOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the product.";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setError(undefined);
  };

  return (
    <Card className="overflow-hidden transition-shadow shadow-none border-none p-0 pb-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-3/4 bg-muted">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw "
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="flex justify-end pr-0 -mt-4 ">
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-background text-foreground font-light text-[11px] md:text-[12px] md:font-extralight hover:bg-color-none group"
        >
          <span className="flex items-center gap-0.5 border-b-2 border-transparent  group-hover:border-current ">
            EDIT
            <ArrowRight strokeWidth={1.3} />
          </span>
        </Button>
      </div>
      <div className="">
        <CardHeader className="pt-2 pl-0 ">
          <CardTitle className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight line-clamp-2 w-100 ">
            {product.title.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pl-0 pr-0 pt-0">
          <div className="flex items-center gap-2 ">
            {hasDiscount && (
              <span className="font-light text-[11px] md:text-[12px] md:font-extralight text-muted-foreground line-through ">
                {currencySymbol}
                {product.price.amount.toFixed(2)}
              </span>
            )}
            <span className="font-light text-[11px] md:text-[12px]  md:font-extralight">
              {currencySymbol}
              {displayPrice}
            </span>
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              variant="default"
              size="sm"
              className="flex-1 rounded-none"
            >
              APPROVE
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild className="flex-1">
                <Button
                  size="sm"
                  className="flex-1 bg-background text-foreground rounded-none border border-black hover:bg-destructive hover:text-background"
                >
                  DELETE
                </Button>
              </DialogTrigger>
              <DialogContent className="min-h-40">
                <DialogHeader>
                  <DialogTitle className="mt-2">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete{" "}
                    <span className="font-semibold">&quot;{product.title}&quot;</span> and
                    remove all associated data from our servers.
                  </DialogDescription>
                </DialogHeader>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <div className="flex items-center mt-1 justify-end gap-4">
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-background text-foreground border border-ring hover:bg-destructive hover:text-primary-foreground active:translate-y-0.5 active:scale-95"
                  >
                    {isDeleting ? "Deleting..." : "Yes"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isDeleting}
                    className="bg-foreground text-background hover:text-primary-foreground active:translate-y-0.5 active:scale-95"
                  >
                    No
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </div>

      <EditProductDrawer
        product={product}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onUpdate={onUpdate}
      />
    </Card>
  );
}
