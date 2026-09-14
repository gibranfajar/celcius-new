const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const DEFAULT_MESSAGE = "Halo, saya ingin bertanya tentang produk Celcius.";

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
      // Positioned above where the guest sign-up card sits (also bottom-4
      // right-4) so the two never overlap when both are visible.
      className="fixed bottom-36 right-4 z-40 flex items-center justify-center size-12 rounded-full bg-[#25D366] shadow-lg hover:brightness-95 transition-all cursor-pointer"
    >
      <svg
        viewBox="0 0 32 32"
        className="size-7"
        fill="white"
        aria-hidden="true"
      >
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.223.61 4.352 1.766 6.224L4 29l7.963-1.734A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818a9.74 9.74 0 0 1-4.967-1.36l-.356-.211-4.724 1.029 1.05-4.612-.232-.375A9.75 9.75 0 1 1 25.75 15a9.76 9.76 0 0 1-9.746 9.818Zm5.354-7.302c-.293-.147-1.735-.857-2.004-.955-.269-.098-.465-.147-.66.147-.196.294-.758.955-.929 1.151-.171.196-.342.22-.635.073-.293-.147-1.238-.456-2.358-1.454-.872-.778-1.461-1.738-1.632-2.032-.171-.294-.018-.453.129-.6.132-.132.293-.343.44-.514.147-.171.196-.294.293-.49.098-.196.049-.367-.024-.514-.073-.147-.66-1.59-.905-2.178-.238-.573-.48-.495-.66-.504-.171-.008-.367-.01-.562-.01-.196 0-.514.073-.783.367-.269.294-1.026 1.003-1.026 2.445 0 1.442 1.05 2.836 1.196 3.032.147.196 2.067 3.157 5.009 4.427.7.302 1.246.483 1.672.618.703.224 1.343.192 1.849.116.564-.084 1.735-.71 1.98-1.395.245-.685.245-1.272.171-1.395-.073-.122-.269-.196-.562-.343Z" />
      </svg>
    </a>
  );
}
