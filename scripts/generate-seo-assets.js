/**
 * Script pour générer les assets SEO (favicons et og-image)
 * 
 * Usage: node scripts/generate-seo-assets.js
 * 
 * Prérequis: npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const LOGO_SVG = path.join(PUBLIC_DIR, 'logo.svg');
const LOGO_PNG = path.join(PUBLIC_DIR, 'logo.png');

// Couleur de fond ArtisanFlow
const BG_COLOR = '#0A1A2F';

async function generateFavicons() {
  console.log('🎨 Génération des favicons...');

  // Vérifier si logo.png existe, sinon utiliser logo.svg
  let logoPath = LOGO_PNG;
  if (!fs.existsSync(LOGO_PNG)) {
    logoPath = LOGO_SVG;
  }

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo introuvable. Veuillez créer logo.png ou logo.svg dans public/');
    return;
  }

  try {
    // Favicon 16x16
    await sharp(logoPath)
      .resize(16, 16, { fit: 'contain', background: { r: 10, g: 26, b: 47 } })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon-16.png'));

    // Favicon 32x32
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 10, g: 26, b: 47 } })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon-32.png'));

    // Apple touch icon 180x180
    await sharp(logoPath)
      .resize(180, 180, { fit: 'contain', background: { r: 10, g: 26, b: 47 } })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

    // Favicon.ico (32x32)
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 10, g: 26, b: 47 } })
      .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

    console.log('✅ Favicons générés avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des favicons:', error);
  }
}

async function generateOGImage() {
  console.log('🎨 Génération de l\'image OpenGraph...');

  const width = 1200;
  const height = 630;
  const logoSize = 200;
  const textSize = 48;

  try {
    // Créer l'image de base avec fond bleu
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0A1A2F;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1E3A5F;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)"/>
        
        <!-- Logo centré -->
        <g transform="translate(${width / 2 - logoSize / 2}, ${height / 2 - logoSize / 2 - 60})">
          <rect width="${logoSize}" height="${logoSize}" fill="#3B82F6" rx="24"/>
          <path d="M ${logoSize / 2} ${logoSize * 0.2} L ${logoSize * 0.3} ${logoSize * 0.8} L ${logoSize * 0.4} ${logoSize * 0.8} L ${logoSize * 0.475} ${logoSize * 0.6} L ${logoSize * 0.525} ${logoSize * 0.6} L ${logoSize * 0.6} ${logoSize * 0.8} L ${logoSize * 0.7} ${logoSize * 0.8} Z" fill="white"/>
          <path d="M ${logoSize * 0.475} ${logoSize * 0.5} L ${logoSize / 2} ${logoSize * 0.4} L ${logoSize * 0.525} ${logoSize * 0.5} Z" fill="#3B82F6"/>
        </g>
        
        <!-- Texte -->
        <text x="${width / 2}" y="${height / 2 + 100}" 
              font-family="Arial, sans-serif" 
              font-size="${textSize}" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle">
          Devis en 20 secondes avec l'IA
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(path.join(PUBLIC_DIR, 'og-image.jpg'));

    console.log('✅ Image OpenGraph générée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'image OpenGraph:', error);
  }
}

async function main() {
  console.log('🚀 Génération des assets SEO pour ArtisanFlow...\n');

  // Vérifier si sharp est installé
  try {
    require('sharp');
  } catch (error) {
    console.error('❌ Sharp n\'est pas installé. Veuillez exécuter: npm install --save-dev sharp');
    process.exit(1);
  }

  await generateFavicons();
  await generateOGImage();

  console.log('\n✨ Génération terminée!');
}

main().catch(console.error);

