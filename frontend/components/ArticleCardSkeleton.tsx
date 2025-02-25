import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleCardSkeleton() {
  return (
    <div className="w-4/5 mx-auto">
      <Card className="mb-4">
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-2 flex-1">
              {/* Title skeleton */}
              <Skeleton className="h-6 w-3/4" />
              {/* Icon skeleton */}
              <Skeleton className="h-4 w-4" />
            </div>
            {/* Category badge skeleton */}
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          {/* Date skeleton */}
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          {/* Snippet skeleton - Two lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
