import { AvatarConfig, Gender } from '../types';

export const SKIN_TONES = [
  { id: 'fair', color: '#FDDFD0', label: 'Fair' },
  { id: 'peach', color: '#FAD0B6', label: 'Warm Peach' },
  { id: 'wheat', color: '#F2C29B', label: 'Wheat' },
  { id: 'honey', color: '#E5A675', label: 'Honey' },
  { id: 'bronze', color: '#BA7A48', label: 'Bronze' },
  { id: 'deep', color: '#824E2B', label: 'Deep Espresso' },
];

export const HAIR_COLORS = [
  { id: 'black', color: '#2B2321', label: 'Espresso Black' },
  { id: 'dark_brown', color: '#4A3427', label: 'Chestnut Brown' },
  { id: 'honey_brown', color: '#7D5537', label: 'Honey Caramel' },
  { id: 'golden_blonde', color: '#D9A757', label: 'Golden Blonde' },
  { id: 'rose_gold', color: '#D89189', label: 'Rose Gold' },
  { id: 'pastel_lavender', color: '#A897D8', label: 'Pastel Lilac' },
  { id: 'midnight_navy', color: '#22385C', label: 'Midnight Blue' },
  { id: 'silver_gray', color: '#9DA8B6', label: 'Silver Gray' },
];

export const FEMALE_HAIRSTYLES = [
  { id: 'messy_bun', labelAr: 'كعكة عصرية', labelEn: 'Messy Bun' },
  { id: 'long_waves', labelAr: 'موجات طويلة', labelEn: 'Long Waves' },
  { id: 'hijab_classic', labelAr: 'حجاب أنيق', labelEn: 'Chic Hijab' },
  { id: 'ponytail_high', labelAr: 'ذيل حصان عالي', labelEn: 'High Ponytail' },
  { id: 'bob_cut', labelAr: 'قصة بوب ناعمة', labelEn: 'Soft Bob' },
  { id: 'braided_side', labelAr: 'ضفيرة جانبية', labelEn: 'Side Braid' },
  { id: 'curly_afro', labelAr: 'كيرلي كثيف', labelEn: 'Curly Afro' },
  { id: 'twin_space_buns', labelAr: 'كعكتين لطيفة', labelEn: 'Space Buns' },
  { id: 'shoulder_straight', labelAr: 'مستقيم للأكتاف', labelEn: 'Straight Shoulder' },
  { id: 'pixie_chic', labelAr: 'بيكسي أنيق', labelEn: 'Chic Pixie' },
];

export const MALE_HAIRSTYLES = [
  { id: 'short_textured', labelAr: 'قصير مدرج', labelEn: 'Textured Crop' },
  { id: 'pompadour', labelAr: 'بومبادور كلاسيك', labelEn: 'Pompadour' },
  { id: 'curly_fade', labelAr: 'كيرلي مدرج', labelEn: 'Curly Fade' },
  { id: 'side_part', labelAr: 'فرق جانبي رسمي', labelEn: 'Side Part' },
  { id: 'messy_quiff', labelAr: 'كويف شبابي', labelEn: 'Messy Quiff' },
  { id: 'buzz_cut', labelAr: 'قصة باز نظيفة', labelEn: 'Buzz Fade' },
  { id: 'wavy_medium', labelAr: 'مموج متوسط', labelEn: 'Medium Waves' },
  { id: 'modern_slick', labelAr: 'سليك عصري', labelEn: 'Modern Slick' },
  { id: 'undercut', labelAr: 'أندركات شبابي', labelEn: 'Undercut' },
  { id: 'dreads_short', labelAr: 'جدائل قصيرة', labelEn: 'Short Locks' },
];

export const EYE_COLORS = [
  { id: 'brown', color: '#3E2723', label: 'Warm Brown' },
  { id: 'hazel', color: '#6A5636', label: 'Golden Hazel' },
  { id: 'emerald', color: '#2E7D32', label: 'Emerald Green' },
  { id: 'sapphire', color: '#1565C0', label: 'Sapphire Blue' },
  { id: 'dark_slate', color: '#263238', label: 'Dark Slate' },
  { id: 'violet', color: '#512DA8', label: 'Mystic Violet' },
];

export const OUTFIT_STYLES = [
  { id: 'sweater', labelAr: 'كنزة صوفية مريحة', labelEn: 'Cozy Cable Knit' },
  { id: 'hoodie', labelAr: 'هودي جامعي دافئ', labelEn: 'Varsity Hoodie' },
  { id: 'blazer', labelAr: 'بليزر أكاديمي أنيق', labelEn: 'Academic Blazer' },
  { id: 'crewneck', labelAr: 'سويتر كلاسيك', labelEn: 'Minimal Crewneck' },
  { id: 'denim_jacket', labelAr: 'جاكيت جينز', labelEn: 'Denim Jacket' },
  { id: 'collared_shirt', labelAr: 'قميص بياقة رسمية', labelEn: 'Collared Shirt' },
  { id: 'lab_coat', labelAr: 'معطف مختبر علمي', labelEn: 'Science Lab Coat' },
  { id: 'cardigan', labelAr: 'كارديغان لطيف', labelEn: 'Soft Cardigan' },
];

export const OUTFIT_COLORS = [
  { id: 'lavender', color: '#C9B6F2', label: 'Lavender Purple' },
  { id: 'soft_pink', color: '#F7B9D5', label: 'Soft Pink' },
  { id: 'royal_blue', color: '#3678D8', label: 'Royal Blue' },
  { id: 'navy_blue', color: '#142D55', label: 'Navy Blue' },
  { id: 'butter_yellow', color: '#FFE49A', label: 'Butter Yellow' },
  { id: 'sage_green', color: '#97CBA9', label: 'Sage Green' },
  { id: 'cream_white', color: '#FDFBF7', label: 'Cream White' },
  { id: 'charcoal', color: '#2D3748', label: 'Charcoal' },
];

export const EYEWEAR_OPTIONS = [
  { id: 'none', labelAr: 'بدون نظارات', labelEn: 'None' },
  { id: 'round_wire', labelAr: 'إطار سلكي دائري ذهبي', labelEn: 'Wire Round' },
  { id: 'thick_black', labelAr: 'إطار أسود عصري', labelEn: 'Modern Horn' },
  { id: 'cateye', labelAr: 'إطار عيون القطة أنيق', labelEn: 'Chic Cat-eye' },
  { id: 'clear_acetate', labelAr: 'إطار شفاف أكريليك', labelEn: 'Clear Acetate' },
];

export const ACCESSORIES = [
  { id: 'none', labelAr: 'بدون إكسسوار', labelEn: 'None' },
  { id: 'headphones', labelAr: 'سماعات رأس للمذاكرة', labelEn: 'Study Headphones' },
  { id: 'grad_cap', labelAr: 'قبعة التخرج الأكاديمية', labelEn: 'Graduation Cap' },
  { id: 'star_pin', labelAr: 'دبوس النجوم المتفوق', labelEn: 'Honor Star Pin' },
  { id: 'coffee_cup', labelAr: 'كوب قهوة المذاكرة', labelEn: 'Study Coffee' },
];

export const FACIAL_HAIR_OPTIONS = [
  { id: 'none', labelAr: 'بدون لحية', labelEn: 'Clean Shaven' },
  { id: 'stubble', labelAr: 'شعر خفيف 5 o\'clock', labelEn: 'Subtle Stubble' },
  { id: 'groomed_beard', labelAr: 'لحية مهذبة', labelEn: 'Trimmed Beard' },
  { id: 'full_beard', labelAr: 'لحية كاملة كلاسيكية', labelEn: 'Full Beard' },
  { id: 'mustache', labelAr: 'شارب كلاسيكي', labelEn: 'Classic Mustache' },
];

export function generateRandomAvatar(gender: Gender): AvatarConfig {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const hairstyles = gender === 'female' ? FEMALE_HAIRSTYLES : MALE_HAIRSTYLES;
  const hairColor = pick(HAIR_COLORS).color;
  const skinTone = pick(SKIN_TONES).color;
  const eyeColor = pick(EYE_COLORS).color;
  const outfitStyle = pick(OUTFIT_STYLES).id;
  const outfitColor = gender === 'female' ? pick([
    '#C9B6F2', '#F7B9D5', '#FFE49A', '#FDFBF7'
  ]) : pick([
    '#142D55', '#3678D8', '#9FD5FF', '#2D3748'
  ]);
  const glasses = pick(EYEWEAR_OPTIONS).id;
  const accessory = pick(ACCESSORIES).id;
  const facialHair = gender === 'male' ? pick(FACIAL_HAIR_OPTIONS).id : 'none';

  return {
    id: `avatar_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    gender,
    skinTone,
    hairStyle: pick(hairstyles).id,
    hairColor,
    eyeColor,
    outfitStyle,
    outfitColor,
    glasses,
    accessory,
    facialHair,
    state: 'welcome',
    use3DPhotoModel: true,
  };
}
