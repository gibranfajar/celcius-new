import Image from "next/image";
import Link from "next/link";

export default function CollectionList({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="col-span-3 text-center py-10 text-gray-500">
        <p className="text-lg font-medium">No collections found.</p>
        <p className="text-sm">
          Try changing the category or product type filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
      {data.map((item, index) => (
        <Link key={index} href={`/collection/${item.slug}`} className="mb-8">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.thumbnail}`}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            width={500}
            height={500}
          />
          <h2 className="mt-3 text-base font-medium text-gray-800 group-hover:text-gray-600">
            {item.title}
          </h2>
        </Link>
      ))}
    </div>
  );
}
