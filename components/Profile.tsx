"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function Profile({ data }: any) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [user, setUser] = useState<any>(data);
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

  // Ambil daftar provinsi saat pertama kali load
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Ambil daftar kota berdasarkan province
  useEffect(() => {
    if (user.province) fetchCities(user.province);
  }, [user.province]);

  // Ambil daftar kecamatan berdasarkan city
  useEffect(() => {
    if (user.city) fetchSubdistricts(user.city);
  }, [user.city]);

  const fetchProvinces = async () => {
    try {
      const res = await axios.get(`${BASE_URL}provinces`);
      setProvinces(res.data);
    } catch (err) {
      console.error("Error fetching provinces", err);
    }
  };

  const fetchCities = async (province: string) => {
    try {
      const res = await axios.get(`${BASE_URL}cities/${province}`);
      setCities(res.data);
    } catch (err) {
      console.error("Error fetching cities", err);
    }
  };

  const fetchSubdistricts = async (city: string) => {
    try {
      const res = await axios.get(`${BASE_URL}districts/${city}`);
      setSubdistricts(res.data);
    } catch (err) {
      console.error("Error fetching subdistricts", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BASE_URL}update-profile`,
        {
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          address: user.address,
          province: user.province,
          city: user.city,
          district: user.district,
          postal_code: user.postal_code,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile updated successfully!");
      setUser(res.data.user || res.data);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <input
          type="text"
          className="border border-zinc-400 p-2 w-full focus:outline-none"
          value={user.name || ""}
          name="name"
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="text"
          className="border border-zinc-400 p-2 w-full focus:outline-none"
          value={user.address || ""}
          name="address"
          onChange={handleChange}
          placeholder="Address"
        />
        <input
          type="text"
          className="border border-zinc-400 p-2 w-full focus:outline-none"
          value={user.phone_number || ""}
          name="phone"
          onChange={handleChange}
          placeholder="Phone"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="border border-zinc-400 p-2 w-full"
            name="province"
            value={user.province || ""}
            onChange={handleChange}
          >
            <option value="">Select Province</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>

          <select
            className="border border-zinc-400 p-2 w-full"
            name="city"
            value={user.city || ""}
            onChange={handleChange}
            disabled={!user.province}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            className="border border-zinc-400 p-2 w-full"
            name="district"
            value={user.district || ""}
            onChange={handleChange}
            disabled={!user.city}
          >
            <option value="">Select District</option>
            {subdistricts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="border border-zinc-400 p-2 w-full focus:outline-none"
            value={user.postal_code || ""}
            name="postal_code"
            onChange={handleChange}
            placeholder="Postal Code"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="bg-black text-white py-2 hover:bg-zinc-800 transition cursor-pointer"
        >
          {loading ? "Loading..." : "UPDATE"}
        </button>
      </form>
    </div>
  );
}
