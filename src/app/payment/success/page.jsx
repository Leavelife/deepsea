export default function PaymentSuccess() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <h1 className="text-3xl font-bold text-green-700 mb-3">Pembayaran Berhasil!</h1>
        <p className="text-gray-600 mb-6">Terima kasih telah bertransaksi melalui sistem simulasi DeepSea.</p>
        <a href="/" className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition">Kembali ke Beranda</a>
      </div>
    );
  }
  