"use client";

import Filter from "@/components/Filter";
import ProductList from "@/components/ProductList";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Params = {
  gender: string;
  filters?: string[];
};

export default function ProductListPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const { gender, filters } = useParams<Params>();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // FETCH
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}product-list`);
      setProducts(res.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // FILTER DATA
  const filteredProducts = useMemo(() => {
    let data = products;

    // gender
    data = data.filter((p) => p.type === gender);

    if (!filters?.length) return data;

    // /products/men/apparel
    if (filters.length === 1 && filters[0] !== "sale") {
      data = data.filter((p) => p.category_parent === filters[0]);
    }

    // /products/men/category/shirt-apparel-men
    if (filters[0] === "category") {
      data = data.filter((p) => p.category_slug === filters[1]);
    }

    // /products/men/sale
    if (filters[0] === "sale") {
      data = data.filter((p) => p.discount > 0);
    }

    return data;
  }, [products, gender, filters]);

  // TITLE
  const title = useMemo(() => {
    const base = gender.charAt(0).toUpperCase() + gender.slice(1);

    if (!filters?.length) return base;

    if (filters.length === 1) {
      return `${base} / ${filters[0]}`;
    }

    if (filters[0] === "category" && filters[1]) {
      const found = products.find((p) => p.category_slug === filters[1]);
      return found ? `${base} / ${found.category_name}` : base;
    }

    return base;
  }, [gender, filters, products]);

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

      <ProductList data={filteredProducts} loading={isLoading} />
    </div>
  );
}
