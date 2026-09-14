const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const DEFAULT_MESSAGE = "Halo, saya ingin bertanya tentang produk Celcius.";

// Not self-positioned (no `fixed`/`bottom-*`) - it's a flex child of the
// shared bottom-right stack in app/layout.tsx, alongside GuestSignupCard, so
// it naturally drops down into that card's spot once it's dismissed instead
// of floating in a gap left behind.
//
// Renders nothing until NEXT_PUBLIC_WHATSAPP_NUMBER is set - no dead/broken
// link to customer service before that's configured.
export default function WhatsAppButton() {
  if (!PHONE_NUMBER) return null;

  const href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with customer service on WhatsApp"
      className="flex items-center justify-center size-12 rounded-full bg-[#25D366] shadow-lg hover:brightness-95 transition-all cursor-pointer"
    >
      <i className="bi bi-whatsapp text-white text-2xl" aria-hidden="true" />
    </a>
  );
}
