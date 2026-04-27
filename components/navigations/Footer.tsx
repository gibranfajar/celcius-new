import Link from "next/link";

export default function Footer() {
  return (
    <div className="p-8 seccond-font">
      <div className="grid gap-4 md:grid-cols-3 justify-items-center">
        <div className="flex gap-4 text-sm">
          <ul>
            <li className="font-bold">Shop</li>
            <li className="text-xs my-1">
              <Link href="/products/men/list/apparel">Mens</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/products/women/list/apparel">Womens</Link>
            </li>
          </ul>
          <ul>
            <li className="font-bold">Celcius</li>
            <li className="text-xs my-1">
              <Link href="/about">About Us</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/collection">News</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/location">Store Locator</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
          <ul>
            <li className="font-bold">Support</li>
            <li className="text-xs my-1">
              <Link href="/faqs">FAQ</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/shipping-returns">Shipping & Returns</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/privacy-policy">Privacy & Cookie Policy</Link>
            </li>
            <li className="text-xs my-1">
              <Link href="/terms-conditions">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        <div className="flex items-start">
          <div>
            <span className="font-bold">Subscribe</span>
            <form action="">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="privacy"
                  className="cursor-pointer"
                />
                <label htmlFor="privacy" className="text-xs my-1">
                  I have read and understand the
                  <Link href="/privacy-policy">Privacy and Cookies Policy</Link>
                </label>
              </div>
              <input
                type="email"
                name="subscribeEmail"
                className="bg-slate-200 px-2 py-2 w-50 active:outline-none focus:outline-none text-xs"
                placeholder="Your email address"
              />

              <button className="bg-black text-white px-4 py-1 z-10 absolute cursor-pointer">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <a
              href="https://facebook.com/Celcius-IDN/100063491621453/"
              target="_blank"
            >
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://tiktok.com/@celcius_idn" target="_blank">
              <i className="bi bi-tiktok"></i>
            </a>
            <a href="https://instagram.com/celcius_idn" target="_blank">
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://www.youtube.com/channel/UCTBavLm_Z1zr_4bxVvRAl1g"
              target="_blank"
            >
              <i className="bi bi-youtube"></i>
            </a>
          </div>
          <p className="text-xs">
            Direktorat Jendral Perlindungan Konsumen dan Tertib Niaga
            Kementerian Perdagangan RI 0853-1111-1010
          </p>
        </div>
      </div>

      <h1 className="text-center mt-8 text-sm text-slate-400">
        © Celcius 2025
      </h1>
    </div>
  );
}
