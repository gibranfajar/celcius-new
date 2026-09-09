"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { getAbout } from "@/lib/api";
import { About } from "@/lib/api/types";

export default function AboutPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      setLoading(true);
      try {
        setAbout(await getAbout());
      } catch (error) {
        console.error("Error fetching about:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  if (!about) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Content not available.
      </div>
    );
  }

  return (
    <div className="p-8 md:p-16 seccond-font">
      <h2 className="text-center">About Celcius</h2>
      <hr className="text-zinc-300 my-4" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex justify-center items-center">
          <div
            className="text-justify mt-4 text-sm [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
            dangerouslySetInnerHTML={{ __html: about.content }}
          />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[350px]">
            <Image
              src={about.image_url}
              loading="lazy"
              alt="Celcius Fashion"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
