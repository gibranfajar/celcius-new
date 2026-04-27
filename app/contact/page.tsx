export default function ContactsPage() {
  return (
    <div className="p-8 md:p-16">
      <h2 className="text-center">Contact Info</h2>
      <hr className="text-zinc-300 my-4" />
      <p className="text-xs">You can contact us for more information.</p>

      <h2 className="font-bold my-6">Customer Service Hours:</h2>
      <div className="flex-1 flex flex-col mb-4">
        <span className="text-xs">Monday - Friday</span>
        <span className="text-xs">09:00 - 16:00 WIB</span>
      </div>

      <div className="flex-1 flex flex-col mb-6">
        <p className="text-xs">
          Pemesanan serta permintaan atau pertanyaan yang masuk pada hari Sabtu,
          Minggu, dan hari libur akan diproses pada hari kerja berikutnya.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <span>
          <span className="font-bold">Email:</span> celciusmen@gmail.com
        </span>
        <span>
          <span className="font-bold">Whatsapp:</span> 081113310566
        </span>
      </div>

      <p className="text-xs my-6">
        For questions regarding your order, please include your order number.
      </p>
    </div>
  );
}
