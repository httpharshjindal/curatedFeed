"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { categories, categoryColors } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useInterest } from "@/context/InterestContext";

export function UpdateInterest() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { getToken } = useAuth();
  const { triggerRefresh } = useInterest();

  // Fetch existing interests when dialog opens
  useEffect(() => {
    const fetchUserInterests = async () => {
      if (open) {
        try {
          setLoading(true);
          const token = await getToken();
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/interests`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch interests');
          }

          const data = await response.json();
          if (data.success) {
            setSelectedCategories(data.interests);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch interests');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserInterests();
  }, [open, getToken]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/interests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interests: selectedCategories
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update interests');
      }

      setOpen(false);
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:bg-neutral-100 dark:hover:bg-neutral-800" size="sm">Update Interests</Button>
      </DialogTrigger>
      <DialogContent className=" w-4/5 sm:max-w-[425px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Update Your Interests</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 ">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex flex-wrap gap-2 w-full">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`text-xs sm:text-sm ${categoryColors[category]} ${
                  selectedCategories.includes(category) 
                    ? 'ring-2 ring-primary' 
                    : ''
                }`}
                variant="ghost"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate} disabled={loading}>
            Update Interests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateInterest; 