import { BudgetPreset, Category } from '../types';

export const BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: 'standar_seimbang',
    name: 'Formula Seimbang (Rekomendasi 40/30/20/10)',
    description: 'Cocok untuk profesional & keluarga dengan pos cicilan terencana',
    allocations: [
      {
        name: 'Kebutuhan Pokok',
        group: 'pokok',
        icon: 'Utensils',
        description: 'Makan harian, transport, belanja dapur, pulsa/internet',
        percentage: 40,
        color: '#059669', // Emerald
      },
      {
        name: 'Kewajiban & Hutang',
        group: 'kewajiban',
        icon: 'Receipt',
        description: 'Cicilan rumah/motor, tagihan listrik, air, asuransi, pinjaman',
        percentage: 30,
        color: '#2563eb', // Blue
      },
      {
        name: 'Keinginan & Lifestyle',
        group: 'keinginan',
        icon: 'Coffee',
        description: 'Nongkrong, hiburan, belanja pakaian, hobi, subscription',
        percentage: 20,
        color: '#d97706', // Amber
      },
      {
        name: 'Tabungan, Investasi & Darurat',
        group: 'tabungan',
        icon: 'PiggyBank',
        description: 'Dana darurat, tabungan masa depan, reksadana, emas/saham',
        percentage: 10,
        color: '#7c3aed', // Purple
      },
    ],
  },
  {
    id: 'aturan_emas_503020',
    name: 'Formula Klasik 50 / 30 / 20',
    description: 'Metode budgeting terpopuler untuk gaya hidup stabil dan seimbang',
    allocations: [
      {
        name: 'Kebutuhan Pokok & Tagihan Wajib',
        group: 'pokok',
        icon: 'Home',
        description: 'Makan, sewa/kost, tagihan listrik air, transport & kebutuhan dasar',
        percentage: 50,
        color: '#059669',
      },
      {
        name: 'Keinginan & Lifestyle',
        group: 'keinginan',
        icon: 'Coffee',
        description: 'Nongkrong, liburan, belanja fashion, hobi & hiburan',
        percentage: 30,
        color: '#d97706',
      },
      {
        name: 'Tabungan, Investasi & Dana Darurat',
        group: 'tabungan',
        icon: 'PiggyBank',
        description: 'Simpanan darurat, tabungan masa depan, instrumen investasi',
        percentage: 20,
        color: '#7c3aed',
      },
    ],
  },
  {
    id: 'bebas_hutang',
    name: 'Formula Bebas Hutang & Pelunasan Cepat',
    description: 'Prioritas pelunasan cicilan/pinjaman dengan pos lifestyle minimal',
    allocations: [
      {
        name: 'Kewajiban & Pelunasan Hutang',
        group: 'kewajiban',
        icon: 'Receipt',
        description: 'Fokus melunasi cicilan, kartu kredit, pinjaman & tagihan wajib',
        percentage: 45,
        color: '#2563eb',
      },
      {
        name: 'Kebutuhan Pokok',
        group: 'pokok',
        icon: 'Utensils',
        description: 'Makanan harian, sembako, transportasi hemat',
        percentage: 35,
        color: '#059669',
      },
      {
        name: 'Tabungan Dana Darurat',
        group: 'tabungan',
        icon: 'ShieldCheck',
        description: 'Bantalan darurat agar tidak berhutang lagi jika ada kondisi krisis',
        percentage: 10,
        color: '#7c3aed',
      },
      {
        name: 'Keinginan & Hiburan Terkendali',
        group: 'keinginan',
        icon: 'Sparkles',
        description: 'Hiburan minim & sederhana untuk menjaga kesehatan mental',
        percentage: 10,
        color: '#d97706',
      },
    ],
  },
  {
    id: 'frugal_investor',
    name: 'Formula Investor / Nabung Maksimal (35/40/15/10)',
    description: 'Fokus mencapai kebebasan finansial (FIRE) dengan investasi agresif',
    allocations: [
      {
        name: 'Tabungan & Portofolio Investasi',
        group: 'tabungan',
        icon: 'TrendingUp',
        description: 'Investasi saham, reksadana, tabungan dana darurat 12 bulan',
        percentage: 40,
        color: '#7c3aed',
      },
      {
        name: 'Kebutuhan Pokok Hemat',
        group: 'pokok',
        icon: 'Utensils',
        description: 'Makan masak sendiri, transportasi publik, efisiensi sembako',
        percentage: 35,
        color: '#059669',
      },
      {
        name: 'Kewajiban & Tagihan Rutin',
        group: 'kewajiban',
        icon: 'Receipt',
        description: 'Listrik, WiFi kerja, utilitas esensial',
        percentage: 15,
        color: '#2563eb',
      },
      {
        name: 'Keinginan & Self Reward',
        group: 'keinginan',
        icon: 'Coffee',
        description: 'Self reward sesekali',
        percentage: 10,
        color: '#d97706',
      },
    ],
  },
];

export function generateCategoriesFromPreset(preset: BudgetPreset, totalIncome: number): Category[] {
  return preset.allocations.map((alloc, index) => {
    const allocatedAmount = Math.round((totalIncome * alloc.percentage) / 100);
    return {
      id: `cat_${Date.now()}_${index}`,
      name: alloc.name,
      group: alloc.group,
      icon: alloc.icon,
      description: alloc.description,
      percentage: alloc.percentage,
      allocatedAmount,
      color: alloc.color,
      isCustom: false,
    };
  });
}
