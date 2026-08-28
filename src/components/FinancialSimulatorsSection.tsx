import React, { useState } from 'react';
import {
  Calculator,
  Shield,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Check,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FinancialSimulatorsSectionProps {
  monthlyExpensesAverage: number;
}

export const FinancialSimulatorsSection: React.FC<FinancialSimulatorsSectionProps> = ({
  monthlyExpensesAverage,
}) => {
  const [activeTab, setActiveTab] = useState<'emergency' | 'debt' | 'compound'>('emergency');

  // --- 1. Emergency Fund State ---
  const [expenseBase, setExpenseBase] = useState<string>(
    (monthlyExpensesAverage || 4000000).toString()
  );
  const [familyStatus, setFamilyStatus] = useState<'single' | 'married' | 'freelance'>('single');
  const [customMonths, setCustomMonths] = useState<number>(6);
  const [currentSavings, setCurrentSavings] = useState<string>('5000000');
  const [targetDurationMonths, setTargetDurationMonths] = useState<number>(12);

  // --- 2. Debt Payoff State ---
  const [debts, setDebts] = useState<
    { id: string; name: string; balance: number; interestRate: number; minPayment: number }[]
  >([
    { id: '1', name: 'Kartu Kredit Bank', balance: 5000000, interestRate: 21, minPayment: 500000 },
    { id: '2', name: 'Paylater Belanja', balance: 2500000, interestRate: 29, minPayment: 300000 },
    { id: '3', name: 'Cicilan Gadget KTA', balance: 8000000, interestRate: 14, minPayment: 850000 },
  ]);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<string>('500000');
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtInterest, setNewDebtInterest] = useState('');
  const [newDebtMinPay, setNewDebtMinPay] = useState('');

  // --- 3. Compound Interest State ---
  const [initialCapital, setInitialCapital] = useState<string>('10000000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('1500000');
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(10);
  const [investmentYears, setInvestmentYears] = useState<number>(10);

  // === CALCULATIONS ===

  // 1. Emergency Fund Calculations
  const expNum = parseFloat(expenseBase.replace(/\D/g, '')) || 0;
  const currentSavedNum = parseFloat(currentSavings.replace(/\D/g, '')) || 0;
  const recommendedMultiplier =
    familyStatus === 'single' ? 6 : familyStatus === 'married' ? 9 : 12;
  const targetEmergencyFund = expNum * (customMonths || recommendedMultiplier);
  const emergencyShortfall = Math.max(0, targetEmergencyFund - currentSavedNum);
  const monthlySavingNeeded =
    targetDurationMonths > 0 ? Math.round(emergencyShortfall / targetDurationMonths) : 0;
  const progressEmergencyPct =
    targetEmergencyFund > 0
      ? Math.min(100, Math.round((currentSavedNum / targetEmergencyFund) * 100))
      : 100;

  // 2. Debt Calculations
  const totalDebtBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const extraPayNum = parseFloat(extraMonthlyPayment.replace(/\D/g, '')) || 0;

  // Simple Snowball vs Avalanche estimations
  const totalMonthlyBudget = totalMinPayment + extraPayNum;
  const approxSnowballMonths =
    totalMonthlyBudget > 0 ? Math.ceil(totalDebtBalance / (totalMonthlyBudget * 0.9)) : 0;
  const approxAvalancheMonths =
    totalMonthlyBudget > 0 ? Math.ceil(totalDebtBalance / (totalMonthlyBudget * 0.94)) : 0;
  const interestSavedEstimate = Math.round(totalDebtBalance * 0.08);

  const handleAddDebt = () => {
    if (!newDebtName.trim()) return;
    const b = parseFloat(newDebtBalance.replace(/\D/g, '')) || 0;
    const r = parseFloat(newDebtInterest) || 0;
    const m = parseFloat(newDebtMinPay.replace(/\D/g, '')) || 0;
    if (b <= 0) return;

    setDebts([
      ...debts,
      {
        id: Date.now().toString(),
        name: newDebtName.trim(),
        balance: b,
        interestRate: r,
        minPayment: m || Math.round(b * 0.1),
      },
    ]);

    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtInterest('');
    setNewDebtMinPay('');
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  // 3. Compound Interest Calculations
  const initCapNum = parseFloat(initialCapital.replace(/\D/g, '')) || 0;
  const monthlyContrNum = parseFloat(monthlyContribution.replace(/\D/g, '')) || 0;
  const rMonthly = annualReturnRate / 100 / 12;

  const compoundData = [];
  let currentPrincipal = initCapNum;
  let currentTotalValue = initCapNum;

  for (let year = 1; year <= investmentYears; year++) {
    for (let month = 1; month <= 12; month++) {
      currentPrincipal += monthlyContrNum;
      currentTotalValue = (currentTotalValue + monthlyContrNum) * (1 + rMonthly);
    }
    compoundData.push({
      year: `Tahun ${year}`,
      'Modal Disetor': Math.round(currentPrincipal),
      'Total Nilai Investasi': Math.round(currentTotalValue),
      'Keuntungan Bunga': Math.round(Math.max(0, currentTotalValue - currentPrincipal)),
    });
  }

  const finalTotalValue = compoundData[compoundData.length - 1]?.['Total Nilai Investasi'] || 0;
  const finalPrincipal = compoundData[compoundData.length - 1]?.['Modal Disetor'] || 0;
  const finalGains = Math.max(0, finalTotalValue - finalPrincipal);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Kalkulator & Simulator Perencanaan Finansial
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hitung dana darurat, simulator pelunasan utang, dan proyeksi bunga majemuk
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'emergency'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Dana Darurat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('debt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'debt'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pelunasan Utang</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compound')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'compound'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Investasi Majemuk</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: DANA DARURAT */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Controls */}
          <div className="lg:col-span-1 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Parameter Dana Darurat</span>
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Rata-rata Pengeluaran Bulanan (Rp)
              </label>
              <input
                type="text"
                value={expenseBase ? parseInt(expenseBase.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setExpenseBase(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Profil & Tanggungan Keluarga
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setFamilyStatus('single');
                    setCustomMonths(6);
                  }}
                  className={`p-2 rounded-xl text-2xs font-semibold text-center border transition-all ${
                    familyStatus === 'single'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Lajang (6x)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFamilyStatus('married');
                    setCustomMonths(9);
                  }}
                  className={`p-2 rounded-xl text-2xs font-semibold text-center border transition-all ${
                    familyStatus === 'married'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Menikah (9x)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFamilyStatus('freelance');
                    setCustomMonths(12);
                  }}
                  className={`p-2 rounded-xl text-2xs font-semibold text-center border transition-all ${
                    familyStatus === 'freelance'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Freelance / Anak (12x)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Dana Darurat yang Sudah Terkumpul (Rp)
              </label>
              <input
                type="text"
                value={currentSavings ? parseInt(currentSavings.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setCurrentSavings(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Target Tercapai Dalam: {targetDurationMonths} Bulan
              </label>
              <input
                type="range"
                min="3"
                max="36"
                step="1"
                value={targetDurationMonths}
                onChange={(e) => setTargetDurationMonths(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Hasil Rekomendasi Finansial
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Target Dana Darurat: Rp {targetEmergencyFund.toLocaleString('id-ID')}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Kemajuan:</span>
                  <p className="text-xl font-mono font-extrabold text-indigo-300">
                    {progressEmergencyPct}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressEmergencyPct}%` }}
                />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-2xs text-slate-400 block mb-1">Sudah Tersedia:</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    Rp {currentSavedNum.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-2xs text-slate-400 block mb-1">Kekurangan (Gap):</span>
                  <p className="text-sm font-bold text-rose-400 font-mono">
                    Rp {emergencyShortfall.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-2xs text-indigo-300 font-bold block mb-1">
                    Tabung per Bulan:
                  </span>
                  <p className="text-sm font-bold text-indigo-200 font-mono">
                    Rp {monthlySavingNeeded.toLocaleString('id-ID')}/bln
                  </p>
                </div>
              </div>

              {/* Advice Box */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-0.5">Strategi Pengamanan:</p>
                  <p className="text-slate-400">
                    Simpan dana darurat pada instrumen likuid dan bebas risiko seperti Tabungan Bank khusus terpisah atau Reksadana Pasar Uang (RDPU) agar bisa dicairkan sewaktu-waktu saat terjadi keadaan darurat (kesehatan/kehilangan pekerjaan).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PELUNASAN UTANG (SNOWBALL VS AVALANCHE) */}
      {activeTab === 'debt' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Debt List & Add */}
          <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <span>Daftar Kewajiban & Cicilan Berjalan</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-300">
                Total: Rp {totalDebtBalance.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Debts Table */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {debts.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{d.name}</span>
                    <div className="text-2xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Bunga: {d.interestRate}%/thn</span>
                      <span>• Min. Bayar: Rp {d.minPayment.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-rose-400">
                      Rp {d.balance.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDebt(d.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Debt Form */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                + Tambah Utang / Cicilan Baru:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Nama (e.g. KTA)"
                  value={newDebtName}
                  onChange={(e) => setNewDebtName(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#162032] border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Sisa Pokok (Rp)"
                  value={newDebtBalance}
                  onChange={(e) => setNewDebtBalance(e.target.value.replace(/\D/g, ''))}
                  className="px-2.5 py-1.5 bg-[#162032] border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
                <input
                  type="number"
                  placeholder="Bunga %/thn"
                  value={newDebtInterest}
                  onChange={(e) => setNewDebtInterest(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#162032] border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddDebt}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Strategy Comparison Panel */}
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white">Simulasi Strategi Pelunasan</h3>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Alokasi Ekstra Pelunasan per Bulan (Rp)
              </label>
              <input
                type="text"
                value={extraMonthlyPayment ? parseInt(extraMonthlyPayment.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setExtraMonthlyPayment(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-semibold"
              />
            </div>

            {/* Side-by-side Avalanche vs Snowball */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-blue-300">1. Metode Avalanche (Bunga Tertinggi)</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">Hemat Bunga</span>
                </div>
                <p className="text-xs text-slate-400">
                  Prioritaskan bunga terbesar ({Math.max(...debts.map((d) => d.interestRate), 0)}%).
                </p>
                <div className="mt-2 text-2xs font-mono font-semibold text-white">
                  Perkiraan lunas: ~{approxAvalancheMonths} bulan (Hemat bunga ~Rp {interestSavedEstimate.toLocaleString('id-ID')})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-purple-300">2. Metode Snowball (Nominal Terkecil)</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Kemenangan Cepat</span>
                </div>
                <p className="text-xs text-slate-400">
                  Lunasi nominal utang paling kecil dulu agar beban pikiran cepat berkurang.
                </p>
                <div className="mt-2 text-2xs font-mono font-semibold text-white">
                  Perkiraan lunas: ~{approxSnowballMonths} bulan
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUNGA MAJEMUK & INVESTASI */}
      {activeTab === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Controls */}
          <div className="lg:col-span-1 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Parameter Investasi</span>
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Modal Awal / Lump Sum (Rp)
              </label>
              <input
                type="text"
                value={initialCapital ? parseInt(initialCapital.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setInitialCapital(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Setoran Rutin Bulanan (DCA) (Rp)
              </label>
              <input
                type="text"
                value={monthlyContribution ? parseInt(monthlyContribution.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                onChange={(e) => setMonthlyContribution(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-[#162032] border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Estimasi Imbal Hasil (Return): {annualReturnRate}% / tahun
              </label>
              <input
                type="range"
                min="4"
                max="25"
                step="0.5"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-2xs text-slate-500 mt-1">
                <span>SBN (6%)</span>
                <span>Reksadana (10%)</span>
                <span>Saham/Index (15%+)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Jangka Waktu: {investmentYears} Tahun
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Chart & Final Outcome */}
          <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Hasil Akumulasi {investmentYears} Tahun
                  </span>
                  <h3 className="text-2xl font-black text-white font-mono mt-0.5">
                    Rp {finalTotalValue.toLocaleString('id-ID')}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-2xs">Modal Disetor:</span>
                    <span className="font-mono font-bold text-slate-200">
                      Rp {finalPrincipal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Bunga Majemuk:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +Rp {finalGains.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Area Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={compoundData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="Total Nilai Investasi" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                    <Area type="monotone" dataKey="Modal Disetor" stroke="#64748b" fill="#64748b" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
