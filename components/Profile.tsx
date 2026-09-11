"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import MobileSheetModal from "@/components/MobileSheetModal";
import MembershipSummary from "@/components/MembershipSummary";
import {
  updateProfile,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getProvinces,
  getCities,
  getDistricts,
  getSubdistricts,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { MembershipProfile, ShippingArea, User, UserAddress } from "@/lib/api/types";

const emptyAddressForm = {
  receiver_name: "",
  phone_number: "",
  province_id: "",
  province: "",
  city_id: "",
  city: "",
  district_id: "",
  district: "",
  subdistrict_id: "",
  subdistrict: "",
  postal_code: "",
  address: "",
  is_primary: false,
};

export default function Profile({
  data,
  onUpdated,
  membership,
  membershipLoading,
}: {
  data: User;
  onUpdated: (user: User) => void;
  membership: MembershipProfile | null;
  membershipLoading: boolean;
}) {
  const [name, setName] = useState(data.name);
  const [email, setEmail] = useState(data.email);
  const [phoneNumber, setPhoneNumber] = useState(data.phone_number ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [provinces, setProvinces] = useState<ShippingArea[]>([]);
  const [cities, setCities] = useState<ShippingArea[]>([]);
  const [districts, setDistricts] = useState<ShippingArea[]>([]);
  const [subdistricts, setSubdistricts] = useState<ShippingArea[]>([]);
  const [savingAddress, setSavingAddress] = useState(false);

  const loadAddresses = async () => {
    try {
      setAddresses(await listAddresses());
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  useEffect(() => {
    loadAddresses();
    getProvinces()
      .then(setProvinces)
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (!addressForm.province_id) return;
    getCities(addressForm.province_id)
      .then(setCities)
      .catch((error) => console.error("Error fetching cities:", error));
  }, [addressForm.province_id]);

  useEffect(() => {
    if (!addressForm.city_id) return;
    getDistricts(addressForm.city_id)
      .then(setDistricts)
      .catch((error) => console.error("Error fetching districts:", error));
  }, [addressForm.city_id]);

  useEffect(() => {
    if (!addressForm.district_id) return;
    getSubdistricts(addressForm.district_id)
      .then(setSubdistricts)
      .catch((error) => console.error("Error fetching subdistricts:", error));
  }, [addressForm.district_id]);

  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const updated = await updateProfile({
        name,
        email,
        phone_number: phoneNumber || null,
        ...(password
          ? {
              current_password: currentPassword,
              password,
              password_confirmation: passwordConfirmation,
            }
          : {}),
      });

      toast.success("Profile updated successfully!");
      onUpdated(updated);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const startEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      receiver_name: addr.receiver_name,
      phone_number: addr.phone_number,
      province_id: String(addr.province_id),
      province: addr.province,
      city_id: String(addr.city_id),
      city: addr.city,
      district_id: String(addr.district_id),
      district: addr.district,
      subdistrict_id: String(addr.subdistrict_id),
      subdistrict: addr.subdistrict,
      postal_code: addr.postal_code,
      address: addr.address,
      is_primary: addr.is_primary,
    });
    setShowAddressForm(true);
  };

  const handleSubmitAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingAddress(true);

    const payload = {
      receiver_name: addressForm.receiver_name,
      phone_number: addressForm.phone_number,
      province_id: Number(addressForm.province_id),
      province: addressForm.province,
      city_id: Number(addressForm.city_id),
      city: addressForm.city,
      district_id: Number(addressForm.district_id),
      district: addressForm.district,
      subdistrict_id: Number(addressForm.subdistrict_id),
      subdistrict: addressForm.subdistrict,
      postal_code: addressForm.postal_code,
      address: addressForm.address,
      is_primary: addressForm.is_primary,
    };

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, payload);
      } else {
        await createAddress(payload);
      }

      toast.success("Address saved.");
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm);
      await loadAddresses();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingAddress(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showAddressForm ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAddressForm]);

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      toast.success("Address removed.");
      await loadAddresses();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-6">Profile</h1>

        <div className="mb-6">
          <MembershipSummary
            profile={membership}
            loading={membershipLoading}
          />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmitProfile}>
          <input
            type="text"
            className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="text"
            className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
          />

          <hr className="my-2" />
          <p className="text-xs text-gray-500">
            Leave the fields below empty if you don&apos;t want to change your password.
          </p>

          <input
            type="password"
            className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
          />
          <input
            type="password"
            className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
          />
          <input
            type="password"
            className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Confirm New Password"
          />

          <button
            disabled={savingProfile}
            type="submit"
            className="bg-black text-white py-2 hover:bg-zinc-800 transition cursor-pointer"
          >
            {savingProfile ? "Loading..." : "UPDATE"}
          </button>
        </form>
      </div>

      <div>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Addresses</h2>
          <button
            onClick={() => {
              setEditingAddressId(null);
              setAddressForm(emptyAddressForm);
              setShowAddressForm(true);
            }}
            className="text-xs font-medium tracking-wide border border-black px-3 py-2 hover:bg-black hover:text-white transition cursor-pointer"
          >
            ADD ADDRESS
          </button>
        </div>

        <div className="space-y-3">
          {addresses.length === 0 && (
            <p className="text-sm text-gray-500">No addresses saved yet.</p>
          )}

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-zinc-200 p-4 text-sm flex flex-col sm:flex-row sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-medium">
                    {addr.receiver_name} ({addr.phone_number})
                  </p>
                  {addr.is_primary && (
                    <span className="text-[10px] tracking-wide font-medium px-1.5 py-0.5 bg-black text-white">
                      PRIMARY
                    </span>
                  )}
                </div>
                <p className="text-gray-600">
                  {addr.address}, {addr.subdistrict}, {addr.district}, {addr.city},{" "}
                  {addr.province} {addr.postal_code}
                </p>
              </div>
              <div className="flex sm:flex-col gap-3 sm:gap-2 shrink-0">
                <button
                  onClick={() => startEditAddress(addr)}
                  className="text-xs underline cursor-pointer hover:text-zinc-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-red-600 underline cursor-pointer hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showAddressForm && (
            <MobileSheetModal
              key="address-form"
              onClose={closeAddressForm}
              className="sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto space-y-3 text-sm"
            >
              <form onSubmit={handleSubmitAddress} className="space-y-3">
              <div className="sticky top-0 bg-white flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-zinc-100 z-10">
                <h2 className="text-sm font-semibold">
                  {editingAddressId ? "Edit Address" : "Add Address"}
                </h2>
                <button
                  type="button"
                  onClick={closeAddressForm}
                  aria-label="Close"
                  className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 md:px-5 pb-5 space-y-3">
            <input
              type="text"
              className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
              placeholder="Receiver Name"
              value={addressForm.receiver_name}
              onChange={(e) =>
                setAddressForm({ ...addressForm, receiver_name: e.target.value })
              }
              required
            />
            <input
              type="text"
              className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
              placeholder="Phone Number"
              value={addressForm.phone_number}
              onChange={(e) =>
                setAddressForm({ ...addressForm, phone_number: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
                value={addressForm.province_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = provinces.find((p) => String(p.id) === id);
                  setAddressForm({
                    ...addressForm,
                    province_id: id,
                    province: selected?.name || "",
                    city_id: "",
                    city: "",
                    district_id: "",
                    district: "",
                    subdistrict_id: "",
                    subdistrict: "",
                  });
                  setCities([]);
                  setDistricts([]);
                  setSubdistricts([]);
                }}
                required
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
                value={addressForm.city_id}
                disabled={!addressForm.province_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = cities.find((c) => String(c.id) === id);
                  setAddressForm({
                    ...addressForm,
                    city_id: id,
                    city: selected?.name || "",
                    district_id: "",
                    district: "",
                    subdistrict_id: "",
                    subdistrict: "",
                  });
                  setDistricts([]);
                  setSubdistricts([]);
                }}
                required
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
                value={addressForm.district_id}
                disabled={!addressForm.city_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = districts.find((d) => String(d.id) === id);
                  setAddressForm({
                    ...addressForm,
                    district_id: id,
                    district: selected?.name || "",
                    subdistrict_id: "",
                    subdistrict: "",
                  });
                  setSubdistricts([]);
                }}
                required
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
                value={addressForm.subdistrict_id}
                disabled={!addressForm.district_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = subdistricts.find((s) => String(s.id) === id);
                  setAddressForm({
                    ...addressForm,
                    subdistrict_id: id,
                    subdistrict: selected?.name || "",
                    postal_code: selected?.zip_code || addressForm.postal_code,
                  });
                }}
                required
              >
                <option value="">Select Subdistrict</option>
                {subdistricts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
              placeholder="Postal Code"
              value={addressForm.postal_code}
              onChange={(e) =>
                setAddressForm({ ...addressForm, postal_code: e.target.value })
              }
              required
            />

            <textarea
              className="border border-zinc-300 p-2.5 w-full text-sm focus:border-black"
              placeholder="Complete Address"
              rows={2}
              value={addressForm.address}
              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
              required
            />

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={addressForm.is_primary}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, is_primary: e.target.checked })
                }
              />
              Set as primary address
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingAddress}
                className="bg-black text-white py-2 px-4 hover:bg-zinc-800 transition cursor-pointer"
              >
                {savingAddress ? "Saving..." : "SAVE ADDRESS"}
              </button>
              <button
                type="button"
                onClick={closeAddressForm}
                className="border border-zinc-400 py-2 px-4 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
              </div>
              </form>
            </MobileSheetModal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
