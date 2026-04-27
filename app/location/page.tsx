"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners";

type Gender = "men" | "women";
type Province = {
  id: number;
  name: string;
};
type LocationItem = {
  id: number;
  name: string;
  province: string;
  address: string;
  operational_time: string;
  operational_days: string;
  type: Gender;
};

export default function LocationPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<Gender>("men");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [dataLocation, setDataLocation] = useState<LocationItem[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  // 🔹 Fetch data dari backend
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}provinces`);
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDataLocation = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}locations`);
        setDataLocation(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
    fetchDataLocation();
  }, []);

  // 🔹 Toggle antara Men / Women
  const toggleLocation = () => {
    setLocation((prev) => (prev === "men" ? "women" : "men"));
  };

  // 🔹 Filter data berdasarkan gender & provinsi
  const filteredData = useMemo(() => {
    return dataLocation.filter((item) => {
      const matchGender = item.type === location;
      const matchProvince =
        selectedProvince === "" ||
        item.province
          .toLowerCase()
          .includes(
            provinces
              .find((p) => p.id === Number(selectedProvince))
              ?.name.toLowerCase() ?? "",
          );
      return matchGender && matchProvince;
    });
  }, [dataLocation, location, selectedProvince, provinces]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <Image
        src={
          location === "men"
            ? "/images/locationmen.jpg"
            : "/images/location-women.jpg"
        }
        alt={`${location} banner`}
        className="w-full object-cover shadow-md transition-all duration-300"
        width={1920}
        height={400}
      />

      {/* Toggle Button */}
      <button
        onClick={toggleLocation}
        className="bg-black text-white py-2 w-full my-4 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
      >
        {location === "men" ? "Women Locations" : "Men Locations"}
      </button>

      {/* Select Area */}
      <div className="flex flex-col justify-center items-center">
        <div className="mb-12 mt-6">
          <label htmlFor="area" className="text-sm mb-2 block">
            Select Area
          </label>
          <select
            id="area"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="border-b border-black w-72 block text-sm focus:outline-none"
          >
            <option value="">All</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data grid */}
      <div className="px-6">
        {filteredData.length === 0 ? (
          <p className="text-center text-gray-500 my-8">
            No locations found for {location === "men" ? "Men" : "Women"} in{" "}
            {selectedProvince
              ? provinces.find((p) => p.id === Number(selectedProvince))?.name
              : "All Provinces"}
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="p-6 text-center transition-all duration-200"
              >
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm my-2">{item.address}</p>
                <hr className="text-zinc-400 mb-2" />
                <p className="text-sm">{item.operational_time}</p>
                <p className="text-sm">{item.operational_days}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
