import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FilterProps = {
  isOpen: boolean;
  setisOpen: (v: boolean) => void;
  gender: string;
};

export default function Filter({ isOpen, setisOpen, gender }: FilterProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}categories`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((cat: any) => cat.type === gender);
        setData(filtered);
      });
  }, [gender]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 base-font ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header sidebar */}
      <div className="flex justify-between items-center px-4 py-3 shadow">
        <h2 className="font-semibold">FILTER BY</h2>
        <button
          onClick={() => setisOpen(false)}
          className="text-xl cursor-pointer"
          aria-label="Close filter"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
        <ul className="space-y-2 text-xs">
          <li>CATEGORY</li>
          <li
            onClick={() => {
              router.push(`/products/${gender}/list/apparel`);
              setisOpen(false);
            }}
            className="cursor-pointer"
          >
            All
          </li>

          {data.map((category: any) => (
            <li
              key={category.id}
              onClick={() => {
                router.push(
                  `/products/${gender}/list/category/${category.slug}`,
                );
                setisOpen(false);
              }}
              className="cursor-pointer"
            >
              {category.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
