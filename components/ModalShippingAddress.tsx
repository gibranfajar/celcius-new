"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import MobileSheetModal from "@/components/MobileSheetModal";
import { getProvinces, getCities, getDistricts, getSubdistricts } from "@/lib/api";
import { ShippingArea } from "@/lib/api/types";

export interface ShippingAddressForm {
  receiverName: string;
  phone: string;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  subdistrictId: string;
  subdistrictName: string;
  postalCode: string;
  address: string;
}

const emptyForm: ShippingAddressForm = {
  receiverName: "",
  phone: "",
  provinceId: "",
  provinceName: "",
  cityId: "",
  cityName: "",
  districtId: "",
  districtName: "",
  subdistrictId: "",
  subdistrictName: "",
  postalCode: "",
  address: "",
};

export default function ModalShippingAddress({
  setShowModal,
  onSave,
  data,
}: {
  setShowModal: (v: boolean) => void;
  onSave: (form: ShippingAddressForm) => void;
  data: ShippingAddressForm | null;
}) {
  const [provinces, setProvinces] = useState<ShippingArea[]>([]);
  const [cities, setCities] = useState<ShippingArea[]>([]);
  const [districts, setDistricts] = useState<ShippingArea[]>([]);
  const [subdistricts, setSubdistricts] = useState<ShippingArea[]>([]);

  const [form, setForm] = useState<ShippingAddressForm>(data ?? emptyForm);

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (!form.provinceId) return;
    getCities(form.provinceId)
      .then(setCities)
      .catch((error) => console.error("Error fetching cities:", error));
  }, [form.provinceId]);

  useEffect(() => {
    if (!form.cityId) return;
    getDistricts(form.cityId)
      .then(setDistricts)
      .catch((error) => console.error("Error fetching districts:", error));
  }, [form.cityId]);

  useEffect(() => {
    if (!form.districtId) return;
    getSubdistricts(form.districtId)
      .then(setSubdistricts)
      .catch((error) => console.error("Error fetching subdistricts:", error));
  }, [form.districtId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
    setShowModal(false);
  };

  const isComplete =
    form.receiverName &&
    form.phone &&
    form.provinceId &&
    form.cityId &&
    form.districtId &&
    form.subdistrictId &&
    form.postalCode &&
    form.address;

  return (
    <MobileSheetModal
      onClose={() => setShowModal(false)}
      className="sm:max-w-125 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6"
    >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <button
            onClick={() => setShowModal(false)}
            aria-label="Close"
            className="cursor-pointer text-zinc-500 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Full Name</label>
            <input
              type="text"
              name="receiverName"
              value={form.receiverName}
              onChange={handleChange}
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Mobile Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Province</label>
            <select
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              value={form.provinceId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = provinces.find((p) => String(p.id) === id);
                setForm({
                  ...form,
                  provinceId: id,
                  provinceName: selected?.name || "",
                  cityId: "",
                  cityName: "",
                  districtId: "",
                  districtName: "",
                  subdistrictId: "",
                  subdistrictName: "",
                });
                setCities([]);
                setDistricts([]);
                setSubdistricts([]);
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

          <div>
            <label className="text-xs text-gray-600 mb-1 block">City</label>
            <select
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              value={form.cityId}
              disabled={!form.provinceId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = cities.find((c) => String(c.id) === id);
                setForm({
                  ...form,
                  cityId: id,
                  cityName: selected?.name || "",
                  districtId: "",
                  districtName: "",
                  subdistrictId: "",
                  subdistrictName: "",
                });
                setDistricts([]);
                setSubdistricts([]);
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

          <div>
            <label className="text-xs text-gray-600 mb-1 block">District</label>
            <select
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              value={form.districtId}
              disabled={!form.cityId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = districts.find((d) => String(d.id) === id);
                setForm({
                  ...form,
                  districtId: id,
                  districtName: selected?.name || "",
                  subdistrictId: "",
                  subdistrictName: "",
                });
                setSubdistricts([]);
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

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Subdistrict</label>
            <select
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              value={form.subdistrictId}
              disabled={!form.districtId}
              onChange={(e) => {
                const id = e.target.value;
                const selected = subdistricts.find((s) => String(s.id) === id);
                setForm({
                  ...form,
                  subdistrictId: id,
                  subdistrictName: selected?.name || "",
                  postalCode: selected?.zip_code || form.postalCode,
                });
              }}
            >
              <option value="">Select subdistrict</option>
              {subdistricts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              placeholder="Postal code"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="border border-zinc-300 w-full p-2.5 text-sm focus:border-black"
              rows={2}
              placeholder="Complete address"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full mt-5 py-2 bg-black text-white text-xs hover:bg-gray-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SAVE ADDRESS
        </button>
    </MobileSheetModal>
  );
}
