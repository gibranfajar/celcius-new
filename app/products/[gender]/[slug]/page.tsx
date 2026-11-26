"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Minus, Plus, Ruler } from "lucide-react";
import formatProductName from "@/lib/formatProductName";
import { formatToIdr } from "@/lib/formatToIdr";
import { getProduct, getProducts } from "@/lib/api";
import { Product, ProductSize, StoreStock } from "@/lib/api/types";
import { sortProductSizes } from "@/lib/sortProductSizes";
import RelatedProduct from "@/components/RelatedProducts";
import ProductGallery from "@/components/product/ProductGallery";
import StorePickerModal from "@/components/product/StorePickerModal";
import SkeletonImage, { Skeleton } from "@/components/SkeletonImage";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, cartStoreFrom } from "@/redux/cartSlice";
import type { RootState } from "@/redux/store";

/** Most related products shown in the "You May Also Like" row. */
const RELATED_LIMIT = 20;

type Section = "description" | "sizechart" | "care" | "details";

/**
 * Products to suggest next to this one: those sharing its first category
 * first, then topped up with other products of the same type, so the row is
 * well filled even when the category is small.
 */
async function fetchRelatedProducts(product: Product): Promise<Product[]> {
  const category = product.categories?.[0]?.slug;
  const [inCategory, sameType] = await Promise.all([
    category
      ? getProducts({ category, type: product.type }).then((page) => page.data)
      : Promise.resolve([] as Product[]),
    getProducts({ type: product.type }).then((page) => page.data),
  ]);

  const seen = new Set<number>([product.id]);

  return [...inCategory, ...sameType]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, RELATED_LIMIT);
}

function AccordionItem({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-zinc-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-xs font-semibold uppercase tracking-[0.15em]"
      >
        {title}
        {open ? <Minus size="1rem" /> : <Plus size="1rem" />}
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="seccond-font pb-5 text-sm leading-relaxed text-zinc-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const sizeChartRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [sizeMissing, setSizeMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [openSection, setOpenSection] = useState<Section | null>(
    "description",
  );

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setRelatedLoading(true);
      setRelatedProducts([]);

      try {
        const data = await getProduct(slug);
        if (cancelled) return;
        setProduct(data);
        // ?variant=<id> (from the showroom) opens on that color.
        const wanted = Number(
          new URLSearchParams(window.location.search).get("variant"),
        );
        const wantedIndex =
          data.variants?.findIndex((variant) => variant.id === wanted) ?? -1;
        setActiveVariantIndex(Math.max(wantedIndex, 0));
        setSelectedSize(null);
        setSizeMissing(false);
        setIsLoading(false);

        // Related products load after the product itself, so they never
        // hold up the page.
        const related = await fetchRelatedProducts(data);
        if (!cancelled) setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching product:", error);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setRelatedLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const activeVariant = product?.variants?.[activeVariantIndex];

  const toggleSection = (section: Section) =>
    setOpenSection((current) => (current === section ? null : section));

  const openSizeChart = () => {
    setOpenSection("sizechart");
    sizeChartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Add to cart first asks which store to buy from (see StorePickerModal);
  // the item goes into the cart once a store is picked.
  const handleAddToCart = () => {
    if (!product || !activeVariant) return;

    if (!selectedSize) {
      setSizeMissing(true);
      toast.error("Please select a size.");
      return;
    }

    setStorePickerOpen(true);
  };

  const handleStorePicked = (store: StoreStock) => {
    if (!product || !activeVariant || !selectedSize) return;

    const inCart = cartItems.find(
      (item) => item.productSizeId === selectedSize.id,
    );
    if (inCart && inCart.quantity >= store.qty) {
      toast.error(`Only ${store.qty} left at ${store.name}.`);
      return;
    }

    dispatch(
      addToCart({
        productSizeId: selectedSize.id,
        productId: product.id,
        slug: product.slug,
        productType: product.type,
        name: product.name,
        colorName: activeVariant.color.name,
        size: selectedSize.size,
        thumbnailUrl: activeVariant.thumbnail_url,
        price: product.price,
        finalPrice: product.final_price,
        weight: product.weight ?? 0,
        ...cartStoreFrom(store),
      }),
    );

    setStorePickerOpen(false);
    toast.success(`Added to cart from ${store.name}.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full pb-16 md:px-6 md:pt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <SkeletonImage className="aspect-square" />
          <div className="space-y-4 px-4 md:px-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <div className="my-6 h-px bg-zinc-100" />
            <Skeleton className="h-4 w-1/4" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-11" />
              ))}
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !activeVariant) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Product not found
      </div>
    );
  }

  const hasDiscount = product.final_price < product.price;
  const category = product.categories?.[0];
  const images =
    activeVariant.images.length > 0
      ? activeVariant.images
      : [{ id: 0, url: activeVariant.thumbnail_url }];
  const variants = product.variants ?? [];

  return (
    <div className="min-h-screen w-full pb-16 md:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="seccond-font hidden flex-wrap items-center gap-2 py-5 text-[0.6875rem] uppercase tracking-[0.15em] text-zinc-500 md:flex"
      >
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/products/${product.type}/list`}
          className="hover:text-black"
        >
          {product.type}
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/products/${product.type}/list/category/${category.slug}`}
              className="hover:text-black"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="base-font grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        {/* LEFT: photos */}
        <ProductGallery
          key={activeVariant.id}
          images={images}
          alt={formatProductName(product.name)}
        />

        {/* RIGHT: product info, pinned while the photos scroll by */}
        <div className="px-4 md:px-0">
          <div className="lg:sticky lg:top-[calc(var(--nav-h,4rem)+1.5rem)]">
            {category && (
              <p className="seccond-font text-[0.6875rem] uppercase tracking-[0.2em] text-zinc-500">
                {category.name}
              </p>
            )}
            <h1 className="mt-2 text-2xl leading-tight md:text-3xl">
              {formatProductName(product.name)}
            </h1>
            <p className="seccond-font mt-2 text-xs tracking-wide text-zinc-400">
              Art. {product.article}
            </p>

            {/* Price */}
            <div className="seccond-font mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xl font-semibold">
                {formatToIdr(product.final_price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-zinc-400 line-through">
                    {formatToIdr(product.price)}
                  </span>
                  <span className="bg-red-600 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-white">
                    {product.discount_type === "percent"
                      ? `-${Number(product.discount_value)}%`
                      : "SALE"}
                  </span>
                </>
              )}
            </div>

            <div className="my-6 h-px bg-zinc-200" />

            {/* Color */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em]">
                <span className="font-semibold">Color</span>
                <span className="ml-2 text-zinc-500">
                  {formatProductName(activeVariant.color.name)}
                </span>
              </p>
              {/* Shown even for a single color, so the shopper always sees
                  which color they are buying. Round swatches set colors
                  apart from the square size buttons below. */}
              <div className="mt-3 flex flex-wrap gap-3">
                {variants.map((variant, index) => {
                  const isActive = activeVariantIndex === index;
                  // No color code from the article API: show the variant's
                  // own photo in the swatch instead of an empty circle.
                  const swatchStyle = variant.color.code
                    ? { backgroundColor: variant.color.code }
                    : {
                        backgroundImage: `url(${variant.thumbnail_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      };

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      title={formatProductName(variant.color.name)}
                      aria-label={formatProductName(variant.color.name)}
                      aria-pressed={isActive}
                      onClick={() => {
                        if (isActive) return;
                        setActiveVariantIndex(index);
                        setSelectedSize(null);
                      }}
                      className={`h-9 w-9 cursor-pointer rounded-full p-0.5 ring-1 transition ${
                        isActive
                          ? "ring-black ring-offset-2"
                          : "ring-transparent hover:ring-zinc-400 hover:ring-offset-2"
                      }`}
                    >
                      <span
                        className="block h-full w-full rounded-full border border-black/15 bg-zinc-200"
                        style={swatchStyle}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.15em]">
                  Size
                  {selectedSize && (
                    <span className="ml-2 font-normal text-zinc-500">
                      {selectedSize.size}
                    </span>
                  )}
                </p>
                {product.sizechart && (
                  <button
                    type="button"
                    onClick={openSizeChart}
                    className="seccond-font flex cursor-pointer items-center gap-1.5 text-xs text-zinc-600 underline underline-offset-4 hover:text-black"
                  >
                    <Ruler size="0.875rem" />
                    Size guide
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {sortProductSizes(activeVariant.sizes).map((size) => {
                  const isSelected = selectedSize?.id === size.id;

                  return (
                    <button
                      key={size.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeMissing(false);
                      }}
                      className={`h-11 cursor-pointer border text-xs font-medium tracking-wide transition ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : sizeMissing
                            ? "border-red-300 hover:border-black"
                            : "border-zinc-300 hover:border-black"
                      }`}
                    >
                      {size.size}
                    </button>
                  );
                })}
              </div>
              {sizeMissing && (
                <p className="seccond-font mt-2 text-xs text-red-600">
                  Please select a size.
                </p>
              )}
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 h-12 w-full cursor-pointer bg-black px-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800 active:scale-[0.99]"
            >
              Add to cart
              {selectedSize ? ` · ${selectedSize.size}` : ""}
            </button>

            {/* Details */}
            <div className="mt-8 border-t border-zinc-200">
              {product.description && (
                <AccordionItem
                  title="Description"
                  open={openSection === "description"}
                  onToggle={() => toggleSection("description")}
                >
                  <div
                    className="[&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </AccordionItem>
              )}

              {product.sizechart && (
                <div ref={sizeChartRef}>
                  <AccordionItem
                    title="Size Chart"
                    open={openSection === "sizechart"}
                    onToggle={() => toggleSection("sizechart")}
                  >
                    <div
                      className="overflow-x-auto [&_p]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_td]:border-b [&_td]:border-zinc-100 [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-center [&_td]:whitespace-nowrap [&_td:first-child]:text-left [&_td:first-child]:font-semibold [&_td:first-child]:text-black [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-center [&_th]:text-[0.625rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-zinc-600 [&_th:first-child]:text-left"
                      dangerouslySetInnerHTML={{ __html: product.sizechart }}
                    />
                  </AccordionItem>
                </div>
              )}

              {product.product_cares && product.product_cares.length > 0 && (
                <AccordionItem
                  title="Care Instructions"
                  open={openSection === "care"}
                  onToggle={() => toggleSection("care")}
                >
                  <div className="space-y-4">
                    {product.product_cares.map((care) => (
                      <div key={care.id}>
                        <p className="font-medium text-black">
                          {care.material}
                        </p>
                        <div
                          className="mt-1 [&_ul]:list-disc [&_ul]:pl-5"
                          dangerouslySetInnerHTML={{
                            __html: care.care_instructions,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              )}

              <AccordionItem
                title="Product Details"
                open={openSection === "details"}
                onToggle={() => toggleSection("details")}
              >
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                  <dt className="text-zinc-500">Article</dt>
                  <dd>{product.article}</dd>
                  <dt className="text-zinc-500">Color</dt>
                  <dd>{formatProductName(activeVariant.color.name)}</dd>
                  {product.weight ? (
                    <>
                      <dt className="text-zinc-500">Weight</dt>
                      <dd>{product.weight} gr</dd>
                    </>
                  ) : null}
                  {product.categories && product.categories.length > 0 && (
                    <>
                      <dt className="text-zinc-500">Category</dt>
                      <dd>
                        {product.categories.map((c) => c.name).join(", ")}
                      </dd>
                    </>
                  )}
                </dl>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      <RelatedProduct dataProduct={relatedProducts} loading={relatedLoading} />

      <AnimatePresence>
        {storePickerOpen && selectedSize && (
          <StorePickerModal
            key={selectedSize.id}
            productSizeId={selectedSize.id}
            description={`${formatProductName(product.name)} · ${formatProductName(activeVariant.color.name)} · Size ${selectedSize.size}`}
            onClose={() => setStorePickerOpen(false)}
            onConfirm={handleStorePicked}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
