"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

export default function AboutPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState<boolean>(true);
  const [about, setAbout] = useState<any>(null);

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}abouts`);
      setAbout(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching shipping returns", err);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
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
            dangerouslySetInnerHTML={{ __html: about.description }}
          />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[350px]">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${about?.thumbnail}`}
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
