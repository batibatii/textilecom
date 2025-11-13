"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { deleteProductWithRevalidation } from "@/app/actions/admin/products/delete";
import { approveProduct } from "@/app/actions/admin/products/approve";
import { moveToDraft } from "@/app/actions/admin/products/moveToDraft";
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
import { Badge } from "@/components/ui/badge";
import {
  getCurrencySymbol,
  getDisplayPrice,
  hasDiscount as checkHasDiscount,
  formatPrice,
} from "@/lib/productPrice";

interface AdminProductCardProps {
  product: Product;
  onDelete?: () => void;
  onUpdate?: () => void;
  priority?: boolean;
  showMoveToDraft?: boolean;
}

export function AdminProductCard({
  product,
  onDelete,
  onUpdate,
  priority = false,
  showMoveToDraft = false,
}: AdminProductCardProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isMovingToDraft, setIsMovingToDraft] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMoveToDraftDialogOpen, setIsMoveToDraftDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayPrice = getDisplayPrice(product);
  const hasDiscount = checkHasDiscount(product);
  const currencySymbol = getCurrencySymbol(product.price.currency);

  const handleDelete = async () => {
    if (!user) {
      setError("You must be logged in to delete products.");
      return;
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      setError("You must be an admin to delete products.");
      return;
    }

    setIsDeleting(true);
    setError(undefined);

    try {
      await deleteProductWithRevalidation(product.id, product.images);

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

  const handleApprove = async () => {
    if (!user) {
      setError("You must be logged in to approve products.");
      return;
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      setError("You must be an admin to approve products.");
      return;
    }

    setIsApproving(true);
    setError(undefined);

    try {
      const result = await approveProduct(product.id);

      if (!result.success) {
        setError(result.error?.message || "Failed to approve product.");
        return;
      }

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Approve error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while approving the product.";
      setError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleMoveToDraft = async () => {
    if (!user) {
      setError("You must be logged in to move products to draft.");
      return;
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      setError("You must be an admin to move products to draft.");
      return;
    }

    setIsMovingToDraft(true);
    setError(undefined);

    try {
      const result = await moveToDraft(product.id);

      if (!result.success) {
        setError(result.error?.message || "Failed to move product to draft.");
        return;
      }

      setIsMoveToDraftDialogOpen(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Move to draft error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while moving the product to draft.";
      setError(errorMessage);
    } finally {
      setIsMovingToDraft(false);
    }
  };

  const handleCancelMoveToDraft = () => {
    setIsMoveToDraftDialogOpen(false);
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
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
        <Badge
          variant={product.draft ? "secondary" : "default"}
          className="absolute top-2 left-2"
        >
          {product.draft ? "DRAFT" : "APPROVED"}
        </Badge>
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
          <CardTitle className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight w-full truncate">
            {product.title.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pl-0 pr-0 pt-0">
          <div className="flex items-center justify-between gap-2 ">
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <span className="font-light text-[11px] md:text-[12px] md:font-extralight text-muted-foreground line-through ">
                  {formatPrice(product.price.amount, product.price.currency)}
                </span>
              )}
              <span className="font-light text-[11px] md:text-[12px]  md:font-extralight">
                {currencySymbol}
                {displayPrice}
              </span>
            </div>
            {hasDiscount && (
              <span className="text-[11px] md:text-[12px] font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded">
                -{product?.discount?.rate}%
              </span>
            )}
          </div>
          {error && !isDialogOpen && !isMoveToDraftDialogOpen && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          <div className="flex gap-2 mt-6">
            <Button
              variant="default"
              size="sm"
              className="flex-1 rounded-none"
              onClick={handleApprove}
              disabled={isApproving || !product.draft}
            >
              {isApproving
                ? "APPROVING..."
                : product.draft
                ? "APPROVE"
                : "APPROVED"}
            </Button>

            {showMoveToDraft ? (
              <Dialog
                open={isMoveToDraftDialogOpen}
                onOpenChange={setIsMoveToDraftDialogOpen}
              >
                <DialogTrigger asChild className="flex-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-background text-foreground rounded-none border border-black hover:bg-amber-900 hover:text-background"
                  >
                    MOVE TO DRAFT
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-h-40">
                  <DialogHeader>
                    <DialogTitle className="mt-2">Move to Draft?</DialogTitle>
                    <DialogDescription>
                      This will move{" "}
                      <span className="font-semibold">
                        &quot;{product.title}&quot;
                      </span>{" "}
                      back to draft products. It will no longer be visible to
                      customers.
                    </DialogDescription>
                  </DialogHeader>
                  {error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTitle>{error}</AlertTitle>
                    </Alert>
                  )}
                  <div className="flex items-center mt-1 justify-end gap-4">
                    <Button
                      onClick={handleMoveToDraft}
                      disabled={isMovingToDraft}
                      className="bg-background text-foreground border border-ring  hover:bg-amber-900  hover:text-background active:translate-y-0.5 active:scale-95"
                    >
                      {isMovingToDraft ? "Moving..." : "Yes"}
                    </Button>
                    <Button
                      onClick={handleCancelMoveToDraft}
                      disabled={isMovingToDraft}
                      className="bg-foreground  hover:text-primary-foreground active:translate-y-0.5 active:scale-95"
                    >
                      No
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
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
                      <span className="font-semibold">
                        &quot;{product.title}&quot;
                      </span>{" "}
                      and remove all associated data from our servers.
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
            )}
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
