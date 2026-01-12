"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { deleteProductWithRevalidation } from "@/app/actions/admin/products/delete";
import { approveProduct } from "@/app/actions/admin/products/approve";
import { moveToDraft } from "@/app/actions/admin/products/moveToDraft";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProductDrawer } from "@/components/admin/EditProductDrawer";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ErrorAlert } from "@/components/alert/ErrorAlert";
import { useDialogState } from "@/hooks/useDialogState";

interface AdminProductCardProps {
  product: Product;
  onDelete?: () => void;
  onUpdate?: () => void;
  priority?: boolean;
  showMoveToDraft?: boolean;
  mobileViewMode?: "grid" | "list";
}

export function AdminProductCard({
  product,
  onDelete,
  onUpdate,
  priority = false,
  showMoveToDraft = false,
  mobileViewMode = "list",
}: AdminProductCardProps) {
  const { user } = useAuth();
  const deleteOperation = useAsyncData();
  const approveOperation = useAsyncData();
  const moveToDraftOperation = useAsyncData();
  const deleteDialog = useDialogState();
  const moveToDraftDialog = useDialogState();
  const editDrawer = useDialogState();

  const handleDelete = async () => {
    if (!user) {
      deleteOperation.setError("You must be logged in to delete products.");
      return;
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      deleteOperation.setError("You must be an admin to delete products.");
      return;
    }

    await deleteOperation.execute(async () => {
      await deleteProductWithRevalidation(product.id, product.images);
      deleteDialog.closeDialog();
      if (onDelete) {
        onDelete();
      }
    });
  };

  const handleCancel = () => {
    deleteDialog.closeDialog();
    deleteOperation.setError(undefined);
  };

  const handleApprove = async () => {
    if (!user) {
      approveOperation.setError("You must be logged in to approve products.");
      return;
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      approveOperation.setError("You must be an admin to approve products.");
      return;
    }

    await approveOperation.execute(async () => {
      const result = await approveProduct(product.id);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to approve product.");
      }

      if (onUpdate) {
        onUpdate();
      }
    });
  };

  const handleMoveToDraft = async () => {
    if (!user) {
      moveToDraftOperation.setError(
        "You must be logged in to move products to draft."
      );
      return;
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      moveToDraftOperation.setError(
        "You must be an admin to move products to draft."
      );
      return;
    }

    await moveToDraftOperation.execute(async () => {
      const result = await moveToDraft(product.id);

      if (!result.success) {
        throw new Error(
          result.error?.message || "Failed to move product to draft."
        );
      }

      moveToDraftDialog.closeDialog();
      if (onUpdate) {
        onUpdate();
      }
    });
  };

  const handleCancelMoveToDraft = () => {
    moveToDraftDialog.closeDialog();
    moveToDraftOperation.setError(undefined);
  };

  return (
    <Card className="overflow-hidden transition-shadow shadow-none border-none pt-1 w-full max-w-md mx-auto flex flex-col h-full">
      <div
        className="relative w-full aspect-3/4 bg-muted cursor-pointer group"
        onClick={editDrawer.openDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            editDrawer.openDialog();
          }
        }}
      >
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-fit transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw "
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant={product.draft ? "secondary" : "default"}>
            {product.draft ? "DRAFT" : "APPROVED"}
          </Badge>
          {product.stock === 0 && (
            <Badge variant="destructive" className="font-semibold">
              OUT OF STOCK
            </Badge>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <Badge
              variant="secondary"
              className="bg-amber-500 text-white hover:bg-amber-600 font-semibold"
            >
              LOW STOCK
            </Badge>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Button
          onClick={editDrawer.openDialog}
          className="bg-background text-foreground font-light text-[11px] md:text-[12px] md:font-extralight hover:bg-color-none group"
        >
          <span className="flex items-center gap-0.5 border-b-2 border-transparent  group-hover:border-current ">
            EDIT
            <ArrowRight strokeWidth={1.3} />
          </span>
        </Button>
      </div>
      <div className="flex flex-col grow space-y-2">
        <CardHeader className="p-0">
          <CardTitle className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight w-full truncate">
            {product.title.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col grow">
          <div className="flex items-center justify-between gap-2 ">
            <div className="flex items-center gap-2">
              <PriceDisplay
                product={product}
                priceSpanClassName="font-light text-[11px] md:text-[12px] md:font-extralight"
                priceClassName="font-light text-[11px] md:text-[12px] md:font-extralight text-muted-foreground line-through"
                discountClassName="text-[11px] md:text-[12px] font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded"
              />
            </div>
          </div>
          <ErrorAlert
            message={
              (deleteOperation.error ||
                approveOperation.error ||
                moveToDraftOperation.error) &&
              !deleteDialog.open &&
              !moveToDraftDialog.open
                ? deleteOperation.error ||
                  approveOperation.error ||
                  moveToDraftOperation.error
                : undefined
            }
            className="mt-4"
          />
          <div
            className={`flex ${
              mobileViewMode === "grid" ? "flex-col sm:flex-row" : "flex-row"
            } gap-2 mt-auto pt-6`}
          >
            <LoadingButton
              size="sm"
              className={`flex-1 rounded-none ${
                mobileViewMode === "grid"
                  ? "text-[10px] sm:text-xs p-1"
                  : "text-xs"
              }`}
              onClick={handleApprove}
              disabled={!product.draft}
              loading={approveOperation.loading}
              loadingText="APPROVING..."
            >
              {product.draft ? "APPROVE" : "APPROVED"}
            </LoadingButton>

            {showMoveToDraft ? (
              <Dialog
                open={moveToDraftDialog.open}
                onOpenChange={moveToDraftDialog.setOpen}
              >
                <DialogTrigger asChild className="flex-1">
                  <Button
                    size="sm"
                    className={`flex-1 bg-background text-foreground rounded-none border border-black hover:bg-amber-900 hover:text-background ${
                      mobileViewMode === "grid"
                        ? "text-[10px] sm:text-xs p-1"
                        : "text-xs"
                    }`}
                  >
                    MOVE TO DRAFT
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-h-40 p-6">
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
                  <ErrorAlert
                    message={moveToDraftOperation.error}
                    className="mt-2"
                  />
                  <div className="flex items-center mt-1 justify-end gap-4">
                    <LoadingButton
                      onClick={handleMoveToDraft}
                      loading={moveToDraftOperation.loading}
                      loadingText="MOVING..."
                      className="bg-background text-foreground border border-ring  hover:bg-amber-900  hover:text-background active:translate-y-0.5 active:scale-95"
                    >
                      Yes
                    </LoadingButton>
                    <Button
                      onClick={handleCancelMoveToDraft}
                      disabled={moveToDraftOperation.loading}
                      className="bg-foreground  hover:text-primary-foreground active:translate-y-0.5 active:scale-95"
                    >
                      No
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog
                open={deleteDialog.open}
                onOpenChange={deleteDialog.setOpen}
              >
                <DialogTrigger asChild className="flex-1">
                  <Button
                    size="sm"
                    className={`flex-1 bg-background text-foreground rounded-none border border-black hover:bg-destructive hover:text-background ${
                      mobileViewMode === "grid"
                        ? "text-[10px] sm:text-xs"
                        : "text-xs"
                    }`}
                  >
                    DELETE
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-h-40 p-6">
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
                  <ErrorAlert
                    message={deleteOperation.error}
                    className="mt-2"
                  />
                  <div className="flex items-center mt-1 justify-end gap-4">
                    <LoadingButton
                      onClick={handleDelete}
                      loading={deleteOperation.loading}
                      loadingText="Deleting..."
                      className="bg-background text-foreground border border-ring hover:bg-destructive hover:text-primary-foreground active:translate-y-0.5 active:scale-95"
                    >
                      Yes
                    </LoadingButton>
                    <Button
                      onClick={handleCancel}
                      disabled={deleteOperation.loading}
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
        open={editDrawer.open}
        onOpenChange={editDrawer.setOpen}
        onUpdate={onUpdate}
      />
    </Card>
  );
}
