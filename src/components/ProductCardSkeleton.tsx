import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden transition-shadow shadow-none border-none p-0 pb-4 w-full max-w-md mx-auto">
      <Skeleton className="relative w-full aspect-3/4" />

      <div className="flex justify-end pr-0 -mt-4">
        <Skeleton className="h-8 w-20 bg-background" />
      </div>

      <div className="">
        <CardHeader className="pt-2 pl-0">
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>

        <CardContent className="pb-4 pl-0 pr-0 pt-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex gap-2 mt-6">
            <Skeleton className="flex-1 h-9 rounded-none" />
            <Skeleton className="flex-1 h-9 rounded-none" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
