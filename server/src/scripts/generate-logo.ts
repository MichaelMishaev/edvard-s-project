import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || 'fGDoK4f_gOWFjcDaS4vLxaavoVaWtzD8EgQXJiqWP72Fz3PBSg-bRzdtup_ajnP_vBBUZXZhBnPF3Y-CLxv4MA';

async function generateLogo() {
  console.log('🎨 Generating Jerusalem Quest logo...');

  const formData = new FormData();
  formData.append('prompt', 'Modern logo for "Jerusalem Quest" educational game. Golden Jerusalem cityscape silhouette with ancient walls and gates, olive branches, golden menorah symbol, clean geometric design, professional, colorful, child-friendly, educational theme, Hebrew typography elements, blue and gold color scheme, minimalist iconic logo on white background');
  formData.append('aspect_ratio', '1x1');
  formData.append('rendering_speed', 'TURBO');
  formData.append('style_type', 'DESIGN');
  formData.append('num_images', '1');

  try {
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Logo generated successfully!');

    const imageUrl = data.data[0].url;
    console.log('📥 Downloading image...');

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();

    // Save to client/public
    const publicDir = path.resolve(__dirname, '../../../client/public');
    const logoPath = path.join(publicDir, 'logo.png');
    const faviconPath = path.join(publicDir, 'favicon.png');

    fs.writeFileSync(logoPath, Buffer.from(buffer));
    fs.writeFileSync(faviconPath, Buffer.from(buffer));

    console.log(`✅ Logo saved to: ${logoPath}`);
    console.log(`✅ Favicon saved to: ${faviconPath}`);
    console.log('\n🎉 Logo generation complete!');
  } catch (error) {
    console.error('❌ Error generating logo:', error);
    process.exit(1);
  }
}

generateLogo();
