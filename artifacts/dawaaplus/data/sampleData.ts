export interface Medicine {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  requiresPrescription: boolean;
  description: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyCity: string;
  rating: number;
  reviews: number;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PharmacyOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: { medicineId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  address: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'الكل', icon: 'apps', color: '#1A9E6E' },
  { id: '1', name: 'مسكنات', icon: 'medkit', color: '#E53E3E' },
  { id: '2', name: 'فيتامينات', icon: 'leaf', color: '#38A169' },
  { id: '3', name: 'أدوية قلب', icon: 'heart', color: '#E53E3E' },
  { id: '4', name: 'منظم سكر', icon: 'water', color: '#3182CE' },
  { id: '5', name: 'مضادات حيوية', icon: 'shield-checkmark', color: '#805AD5' },
  { id: '6', name: 'تجميل وعناية', icon: 'sparkles', color: '#D69E2E' },
  { id: '7', name: 'أطفال', icon: 'happy', color: '#ED8936' },
];

export const SAMPLE_MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'باراسيتامول 500mg',
    brand: 'بانادول',
    categoryId: '1',
    category: 'مسكنات',
    price: 12.99,
    originalPrice: 16.00,
    stock: 150,
    requiresPrescription: false,
    description: 'مسكن للألم وخافض للحرارة للبالغين والأطفال',
    pharmacyId: 'p1',
    pharmacyName: 'دەرمانخانەی شیفا',
    pharmacyCity: 'هەولێر',
    rating: 4.8,
    reviews: 1240,
    color: '#E53E3E',
  },
  {
    id: '2',
    name: 'فيتامين د3 1000IU',
    brand: 'بيورتس',
    categoryId: '2',
    category: 'فيتامينات',
    price: 45.00,
    stock: 80,
    requiresPrescription: false,
    description: 'يدعم صحة العظام والجهاز المناعي',
    pharmacyId: 'p1',
    pharmacyName: 'دەرمانخانەی شیفا',
    pharmacyCity: 'هەولێر',
    rating: 4.6,
    reviews: 580,
    color: '#38A169',
  },
  {
    id: '3',
    name: 'أسبرين 100mg',
    brand: 'باير',
    categoryId: '3',
    category: 'أدوية قلب',
    price: 18.50,
    stock: 200,
    requiresPrescription: false,
    description: 'مضاد للتخثر وصحة القلب',
    pharmacyId: 'p2',
    pharmacyName: 'دەرمانخانەی ئارام',
    pharmacyCity: 'سلێمانی',
    rating: 4.7,
    reviews: 890,
    color: '#E53E3E',
  },
  {
    id: '4',
    name: 'ميتفورمين 500mg',
    brand: 'جلوكوفاج',
    categoryId: '4',
    category: 'منظم سكر',
    price: 32.00,
    stock: 60,
    requiresPrescription: true,
    description: 'منظم لمستوى السكر في الدم',
    pharmacyId: 'p2',
    pharmacyName: 'دەرمانخانەی ئارام',
    pharmacyCity: 'سلێمانی',
    rating: 4.5,
    reviews: 320,
    color: '#3182CE',
  },
  {
    id: '5',
    name: 'أموكسيسيلين 500mg',
    brand: 'أوجمنتين',
    categoryId: '5',
    category: 'مضادات حيوية',
    price: 55.00,
    stock: 45,
    requiresPrescription: true,
    description: 'مضاد حيوي واسع الطيف',
    pharmacyId: 'p1',
    pharmacyName: 'دەرمانخانەی شیفا',
    pharmacyCity: 'هەولێر',
    rating: 4.3,
    reviews: 210,
    color: '#805AD5',
  },
  {
    id: '6',
    name: 'فيتامين ج 1000mg',
    brand: 'سيتريوم',
    categoryId: '2',
    category: 'فيتامينات',
    price: 38.00,
    originalPrice: 45.00,
    stock: 120,
    requiresPrescription: false,
    description: 'يعزز المناعة ومضاد للأكسدة',
    pharmacyId: 'p3',
    pharmacyName: 'دەرمانخانەی ژیان',
    pharmacyCity: 'دهۆک',
    rating: 4.9,
    reviews: 760,
    color: '#D69E2E',
  },
  {
    id: '7',
    name: 'شراب السعال للأطفال',
    brand: 'أكتيفيد',
    categoryId: '7',
    category: 'أطفال',
    price: 22.00,
    stock: 75,
    requiresPrescription: false,
    description: 'مزيل للاحتقان ومضاد للسعال للأطفال',
    pharmacyId: 'p3',
    pharmacyName: 'دەرمانخانەی ژیان',
    pharmacyCity: 'دهۆک',
    rating: 4.4,
    reviews: 415,
    color: '#ED8936',
  },
  {
    id: '8',
    name: 'كريم ترطيب نيفيا',
    brand: 'نيفيا',
    categoryId: '6',
    category: 'تجميل وعناية',
    price: 28.50,
    stock: 90,
    requiresPrescription: false,
    description: 'كريم ترطيب عميق للبشرة الجافة',
    pharmacyId: 'p2',
    pharmacyName: 'دەرمانخانەی ئارام',
    pharmacyCity: 'سلێمانی',
    rating: 4.6,
    reviews: 530,
    color: '#3182CE',
  },
];

export const SAMPLE_ORDERS: PharmacyOrder[] = [
  {
    id: 'ORD-2024-089',
    customerId: 'c1',
    customerName: 'أحمد محمد',
    items: [
      { medicineId: '1', name: 'باراسيتامول 500mg', quantity: 2, price: 12.99 },
      { medicineId: '6', name: 'فيتامين ج 1000mg', quantity: 1, price: 38.00 },
    ],
    total: 63.98,
    status: 'new',
    createdAt: '2024-03-28T10:30:00Z',
    address: 'هەولێر، شەقامی ١٠٠ مەتری',
  },
  {
    id: 'ORD-2024-088',
    customerId: 'c2',
    customerName: 'سارة علي',
    items: [
      { medicineId: '2', name: 'فيتامين د3', quantity: 1, price: 45.00 },
    ],
    total: 45.00,
    status: 'processing',
    createdAt: '2024-03-28T09:15:00Z',
    address: 'سلێمانی، ناوەندی شار',
  },
  {
    id: 'ORD-2024-087',
    customerId: 'c3',
    customerName: 'خالد العمري',
    items: [
      { medicineId: '8', name: 'كريم نيفيا', quantity: 2, price: 28.50 },
    ],
    total: 57.00,
    status: 'completed',
    createdAt: '2024-03-27T16:20:00Z',
    address: 'دهۆک، شەقامی مەین',
  },
];
