"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function ModalShippingAddress({
  setShowModal,
  onSave,
  data,
}: any) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    postalCode: "",
    address: "",
  });

  // 🟦 Prefill dari props "data"
  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        provinceId: data.provinceId || "",
        provinceName: data.provinceName || "",
        cityId: data.cityId || "",
        cityName: data.cityName || "",
        districtId: data.districtId || "",
        districtName: data.districtName || "",
        postalCode: data.postalCode || "",
        address: data.address || "",
      });
    }
  }, [data]);

  // 🟦 Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${BASE_URL}provinces`);
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 🟦 Jika provinceId sudah ada (prefill), load cities
  useEffect(() => {
    if (!form.provinceId) return;

    const fetchCities = async () => {
      const res = await axios.get(`${BASE_URL}cities/${form.provinceId}`);
      setCities(res.data);
    };
    fetchCities();
  }, [form.provinceId]);

  // 🟦 Jika cityId sudah ada (prefill), load districts
  useEffect(() => {
    if (!form.cityId) return;

    const fetchDistricts = async () => {
      const res = await axios.get(`${BASE_URL}districts/${form.cityId}`);
      setDistricts(res.data);
    };
    fetchDistricts();
  }, [form.cityId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-[500px] shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <button
            onClick={() => setShowModal(false)}
            className="cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="border w-full p-2 text-sm"
              placeholder="Enter your name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Mobile Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border w-full p-2 text-sm"
              placeholder="Your phone number"
            />
          </div>

          {/* Province */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Province</label>
            <select
              className="border w-full p-2 text-sm"
              value={form.provinceId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = provinces.find((p) => p.id == id);

                setForm({
                  ...form,
                  provinceId: id,
                  provinceName: selected?.name || "",
                  cityId: "",
                  cityName: "",
                  districtId: "",
                  districtName: "",
                });

                setCities([]);
                setDistricts([]);
              }}
            >
              <option value="">Select province</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">City</label>
            <select
              className="border w-full p-2 text-sm"
              value={form.cityId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = cities.find((c) => c.id == id);

                setForm({
                  ...form,
                  cityId: id,
                  cityName: selected?.name || "",
                  districtId: "",
                  districtName: "",
                });

                setDistricts([]);
              }}
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">District</label>
            <select
              className="border w-full p-2 text-sm"
              value={form.districtId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = districts.find((d) => d.id == id);

                setForm({
                  ...form,
                  districtId: id,
                  districtName: selected?.name || "",
                });
              }}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Postal Code */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className="border w-full p-2 text-sm"
              placeholder="Postal code"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="border w-full p-2 text-sm"
              rows={2}
              placeholder="Complete address"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full mt-5 py-2 bg-black text-white text-xs hover:bg-gray-800 cursor-pointer"
        >
          SAVE ADDRESS
        </button>
      </div>
    </div>
  );
}
