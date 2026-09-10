"use client";

import Filter from "@/components/Filter";
import ProductList from "@/components/ProductList";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { getCategories, getProducts } from "@/lib/api";
import { Category, ProductType } from "@/lib/api/types";
import { useInfiniteList } from "@/lib/hooks/useInfiniteList";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Params = {
  gender: string;
  filters?: string[];
};

export default function ProductListPage() {
  const { gender, filters } = useParams<Params>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const categorySlug = filters?.[0] === "category" ? filters[1] : undefined;
  const onSale = filters?.[0] === "sale";

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const {
    items: products,
    loading: isLoading,
    loadingMore,
    loadMoreError,
    sentinelRef,
  } = useInfiniteList(
    (page) =>
      getProducts({
        page,
        type: gender as ProductType,
        category: categorySlug,
        onSale,
      }),
    [gender, categorySlug, onSale],
  );

  const title = useMemo(() => {
    const base = gender.charAt(0).toUpperCase() + gender.slice(1);
    if (onSale) return `${base} / Sale`;
    if (categorySlug) {
      const category = categories.find((c) => c.slug === categorySlug);
      return category ? `${base} / ${category.name}` : base;
    }
    return base;
  }, [gender, onSale, categorySlug, categories]);

  return (
    <div className="md:px-6 min-h-screen">
      <div className="px-4 md:px-0 flex justify-between items-center sticky top-12 bg-white pb-2 z-10">
        <h1 className="md:text-xl capitalize">{title}</h1>

        <button
          className="text-verysmall font-semibold cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          FILTERS
        </button>
      </div>

      <Filter isOpen={isOpen} setisOpen={setIsOpen} gender={gender} />

      <ProductList data={products} loading={isLoading} />
      {!isLoading && (
        <InfiniteScrollSentinel
          sentinelRef={sentinelRef}
          loadingMore={loadingMore}
          loadMoreError={loadMoreError}
        />
      )}
    </div>
  );
}
