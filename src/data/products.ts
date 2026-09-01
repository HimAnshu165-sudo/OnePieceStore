import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'nika-01',
    slug: 'sun-god-heavyweight-tee',
    name: 'Sun God Nika // Heavyweight Vintage Boxy Tee',
    japaneseName: '太陽の神 ニカ // 500GSM ボクシーTシャツ',
    crew: 'STRAW_HAT',
    character: 'Monkey D. Luffy',
    price: 95,
    compareAtPrice: 120,
    description:
      'Engineered from 500 GSM Japanese combed loopback cotton. Acid-washed for a subtle vintage patina with high-density puff screen print depicting the mythological warrior of liberation.',
    story:
      'Inspired by the drumbeats of liberation echoing across the Shin Sekai. Designed with a dropped shoulder silhouette and a heavyweight ribbed collar that retains its shape across countless voyages.',
    details: [
      '500 GSM Heavyweight Japanese Combed Cotton',
      'Distressed Acid Wash Finish with Natural Micro-Fraying',
      'High-Density Puff Screen Print Back & Minimal Chest Crest',
      'Reinforced Double-Needle Seams & Custom Woven Hem Label',
      'Pre-shrunk vintage boxy fit; true to oversized streetwear sizing'
    ],
    gsm: 500,
    cut: 'Oversized Boxy Silhouette',
    fabric: '100% Japanese Combed Organic Cotton',
    color: 'Acid Washed Obsidian',
    colorHex: '#1A1918',
    colors: [
      { name: 'Acid Washed Obsidian', hex: '#1A1918', image: '/images/luffy-sun-god.jpg' },
      { name: 'Faded Charcoal', hex: '#2A2928', image: '/images/luffy-sun-god.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 14,
    images: [
      '/images/luffy-sun-god.jpg',
      '/images/collection-red-hair.jpg',
      '/images/editorial-luffy-hoodie.jpg',
      '/images/detail-embroidery-nika.jpg',
      '/images/detail-woven-label.jpg'
    ],
    tags: ['Oversized', 'Heavyweight', 'Limited Edition', 'Sun God'],
    isNewDrop: true,
    isLimited: true,
    isBestseller: true,
    editionNumber: '084 / 250'
  },
  {
    id: 'zoro-02',
    slug: 'santoryu-oni-killer-tee',
    name: 'Santoryu Oni Killer // Wano Swordsman Tee',
    japaneseName: '三刀流 鬼斬り // ヘビーウェイト ドロップショルダー',
    crew: 'STRAW_HAT',
    character: 'Roronoa Zoro',
    price: 88,
    description:
      '480 GSM dense jersey tee in deep forest moss green. Features three minimalist blade slash screen-embroidery accents across the torso with traditional Tokyo blade typography.',
    story:
      'Crafted for the ronin of the Grand Line. The raw weight of the garment combined with deep earthy dye reflects the austere discipline of Wano’s premier swordsman.',
    details: [
      '480 GSM Organic Dense Weave Jersey',
      'Three-Blade Slash Screen Print with Precision Border Stitching',
      'Traditional Japanese Kanji Screen Print on Upper Chest',
      'Oversized Drop-Shoulder Patterning with Wide Sleeve Opening',
      'Pre-washed with enzyme bath for soft hand-feel'
    ],
    gsm: 480,
    cut: 'Drop Shoulder Relaxed Fit',
    fabric: '100% Long-Staple Cotton',
    color: 'Deep Forest Moss',
    colorHex: '#253528',
    colors: [
      { name: 'Deep Forest Moss', hex: '#253528', image: '/images/zoro-oni-cut.jpg' },
      { name: 'Pitch Shadow', hex: '#141414', image: '/images/zoro-oni-cut.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 9,
    images: [
      '/images/zoro-oni-cut.jpg',
      '/images/editorial-zoro-wano.jpg',
      '/images/detail-wano-dragon.jpg',
      '/images/lookbook-craft.jpg'
    ],
    tags: ['Swordsman', 'Wano', 'Drop Shoulder'],
    isNewDrop: true,
    isBestseller: true,
    editionNumber: '112 / 300'
  },
  {
    id: 'law-03',
    slug: 'room-death-surgeon-tee',
    name: 'Room: Death Surgeon // Shambles Boxy Tee',
    japaneseName: '死の外科医 // シャンブルズ ボクシーT',
    crew: 'HEART',
    character: 'Trafalgar D. Water Law',
    price: 92,
    description:
      'Pitch black luxury 520 GSM heavyweight tee. Minimalist yellow contrast stitching, surgical geometric heart graphic, and typography along the left sleeve.',
    story:
      'A study in surgical precision and North Blue rebellion. High-contrast perimeter stitching highlights the structural tailoring of this heavyweight boxy cut.',
    details: [
      '520 GSM Ultra-Dense Loopback Jersey',
      'Precision Yellow Contrast Structural Top-Stitching',
      'Geometric Heart Insignia & Room Coordinate Sleeve Typography',
      'Thick 1.25" Ribbed Collar with Anti-Sag Reinforcement',
      'Custom Matte Metal Aglets on Internal Care Ribbon'
    ],
    gsm: 520,
    cut: 'Boxy Heavyweight Cut',
    fabric: '100% Ring-Spun Cotton',
    color: 'Pitch Black w/ Yellow Stitch',
    colorHex: '#0D0D0D',
    colors: [
      { name: 'Pitch Black', hex: '#0D0D0D', image: '/images/law-room-tee.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 7,
    images: [
      '/images/law-room-tee.jpg',
      '/images/wano-ronin.jpg',
      '/images/editorial-law-parka.jpg',
      '/images/detail-zipper-hardware.jpg'
    ],
    tags: ['Heart Pirates', 'Tactical', 'Ultra Heavyweight'],
    isLimited: true,
    isBestseller: true,
    editionNumber: '042 / 200'
  },
  {
    id: 'shanks-04',
    slug: 'red-hair-emperor-tee',
    name: 'Red Hair Emperor // Conqueror Washed Tee',
    japaneseName: '赤髪の四皇 // 覇王色 ウォッシュドT',
    crew: 'RED_HAIR',
    character: 'Shanks',
    price: 90,
    compareAtPrice: 115,
    description:
      '470 GSM vintage washed deep crimson burgundy tee. Distressed raw hem, rolled cuff detailing, and weathered skull emblem bearing the triple claw scar.',
    story:
      'Imbued with the quiet aura of an Emperor. The crimson enzyme wash gives each piece an individual vintage fade that matures with every wear.',
    details: [
      '470 GSM Enzyme-Washed Heavyweight Cotton',
      'Distressed Raw Lower Hem with Micro-Laser Distressing',
      'Weathered Discharge Ink Graphic (Breathable & Crack-Resistant)',
      'Relaxed Armhole Drop with Reinforced Collar Tape',
      'Individually dyed for unique vintage shading'
    ],
    gsm: 470,
    cut: 'Relaxed Vintage Streetwear Cut',
    fabric: '100% Combed Slub Cotton',
    color: 'Washed Crimson Burgundy',
    colorHex: '#5C1D24',
    colors: [
      { name: 'Washed Crimson', hex: '#5C1D24', image: '/images/shanks-emperor.jpg' },
      { name: 'Ashes Black', hex: '#1C1A1A', image: '/images/shanks-emperor.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 12,
    images: [
      '/images/shanks-emperor.jpg',
      '/images/editorial-shanks-bomber.jpg',
      '/images/collection-red-hair.jpg',
      '/images/detail-woven-label.jpg'
    ],
    tags: ['Emperor', 'Conqueror', 'Vintage Wash'],
    isNewDrop: true,
    isLimited: true,
    editionNumber: '018 / 150'
  },
  {
    id: 'marine-05',
    slug: 'absolute-justice-raw-edge-tee',
    name: 'Absolute Justice // Marine Admirals Raw Edge Tee',
    japaneseName: '絶対的正義 // 海軍本部 生エッジT',
    crew: 'MARINE',
    character: 'Marine HQ',
    price: 85,
    description:
      '450 GSM bone-white heavyweight tee. Crisp nautical coordinates, clean navy Japanese typography, and architectural drop shoulders.',
    story:
      'The strict order of Marine Headquarters translated into architectural streetwear minimalism. Heavy off-white canvas drape with crisp navy typography.',
    details: [
      '450 GSM Heavyweight Raw Cotton Weave',
      'Precision Silk-Screened Japanese Navy Kanji & Naval Coordinates',
      'Raw Edge Sleeve Hem with Anti-Roll Overlock Interior',
      'Custom Grand Line Supply Woven Label on Back Yoke',
      'Oversized clean Scandinavian / Tokyo streetwear drape'
    ],
    gsm: 450,
    cut: 'Architectural Oversized Cut',
    fabric: '100% Unbleached Organic Cotton',
    color: 'Bone Off-White',
    colorHex: '#EAE6DC',
    colors: [
      { name: 'Bone Off-White', hex: '#EAE6DC', image: '/images/marine-justice.jpg' },
      { name: 'Naval Charcoal', hex: '#1E2228', image: '/images/marine-justice.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 18,
    images: [
      '/images/marine-justice.jpg',
      '/images/editorial-marine-trench.jpg',
      '/images/collection-east-blue.jpg',
      '/images/lookbook-craft.jpg'
    ],
    tags: ['Marine HQ', 'Minimalist', 'Off-White'],
    isNewDrop: false,
    isBestseller: false,
    editionNumber: '190 / 500'
  },
  {
    id: 'sanji-06',
    slug: 'diable-jambe-stealth-tee',
    name: 'Black Leg // Diable Jambe Stealth Tee',
    japaneseName: '黒足 // 悪魔風脚 ステルスT',
    crew: 'STRAW_HAT',
    character: 'Vinsmoke Sanji',
    price: 88,
    description:
      '460 GSM smoky slate charcoal tee. Subtle amber flame contour line-art with embroidered gold thread typography and tailored dropped sleeve.',
    story:
      'Culinary passion meets ruthless martial arts. A refined, understated piece with metallic bronze-gold embroidered accents that glow subtly under evening lights.',
    details: [
      '460 GSM Heavyweight Slate Jersey',
      'Metallic Bronze Embroidery on Chest & Nape',
      'Minimal Flame Contour Line-Art Screen Print',
      'Tailored Shoulder Seam with Streetwear Proportions',
      'Super-soft silicone washed surface'
    ],
    gsm: 460,
    cut: 'Tailored Streetwear Drop Shoulder',
    fabric: '100% Combed Cotton',
    color: 'Smoky Charcoal Slate',
    colorHex: '#2E3236',
    colors: [
      { name: 'Smoky Slate', hex: '#2E3236', image: '/images/sanji-diable.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 11,
    images: [
      '/images/sanji-diable.jpg',
      '/images/collection-east-blue.jpg',
      '/images/editorial-sanji-suit.jpg',
      '/images/detail-embroidery-nika.jpg'
    ],
    tags: ['Stealth', 'Straw Hat', 'Embroidered'],
    isNewDrop: false,
    isBestseller: true,
    editionNumber: '073 / 250'
  },
  {
    id: 'wano-07',
    slug: 'wano-ronin-dragon-tee',
    name: 'Wano Ronin // Kaido Dragon Vintage Graphic Tee',
    japaneseName: 'ワノ国 浪人 // 青龍 浮世絵T',
    crew: 'WANO',
    character: 'Wano Clan',
    price: 94,
    compareAtPrice: 125,
    description:
      '500 GSM heavy distressed vintage grey tee. Elaborate Ukiyo-e woodblock azure dragon art with traditional vermillion kanji red seal stamp.',
    story:
      'Ancient Wano craftsmanship rendered in modern Tokyo street couture. Features discharge ink multi-layer screen print that integrates into the fabric grain.',
    details: [
      '500 GSM Distressed Vintage Wash Cotton',
      'Traditional Ukiyo-e Woodblock Style Screen Print',
      'Vermillion Red Kanji Seal Screen Stamp',
      'Distressed Neckline & Hem Details',
      'Limited global production run'
    ],
    gsm: 500,
    cut: 'Heavy Vintage Boxy Silhouette',
    fabric: '100% Cotton Terry Weave',
    color: 'Vintage Asphalt Grey',
    colorHex: '#353434',
    colors: [
      { name: 'Vintage Asphalt', hex: '#353434', image: '/images/wano-ronin.jpg' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 5,
    images: [
      '/images/wano-ronin.jpg',
      '/images/zoro-oni-cut.jpg',
      '/images/detail-wano-dragon.jpg',
      '/images/editorial-zoro-wano.jpg'
    ],
    tags: ['Wano', 'Dragon', 'Ukiyo-e', 'Limited Edition'],
    isNewDrop: true,
    isLimited: true,
    isBestseller: true,
    editionNumber: '009 / 100'
  }
];

export const CREW_CATEGORIES = [
  { id: 'ALL', label: 'All Drops', count: PRODUCTS.length, badge: 'DROP 01' },
  { id: 'STRAW_HAT', label: 'Straw Hat Syndicate', count: 3, badge: 'NEW' },
  { id: 'HEART', label: 'Heart Pirates', count: 1, badge: 'LIMITED' },
  { id: 'RED_HAIR', label: 'Red Hair Division', count: 1, badge: 'CONQUEROR' },
  { id: 'MARINE', label: 'Marine Headquarters', count: 1, badge: 'JUSTICE' },
  { id: 'WANO', label: 'Wano Ronin Archive', count: 1, badge: 'RARE' },
];

