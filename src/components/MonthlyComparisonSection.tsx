import React, { useState } from 'react';
import { MonthlyData } from '../types';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  PieChart as PieChartIcon,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyComparisonSectionProps {
  allMonthlyData: Record<string, MonthlyData>;
  currentMonthKey: string;
}

export const MonthlyComparisonSection: React.FC<MonthlyComparisonSectionProps> = ({
  allMonthlyData,
  currentMonthKey,
}) => {
  const monthKeys = Object.keys(allMonthlyData).sort();

  // Find previous month key by default
  const currentIndex = monthKeys.indexOf(currentMonthKey);
  const prevDefaultKey = currentIndex > 0 ? monthKeys[currentIndex - 1] : monthKeys[0];

  const [monthAKey, setMonthAKey] = useState<string>(prevDefaultKey || currentMonthKey);
  const [monthBKey, setMonthBKey] = useState<string>(currentMonthKey);

  const formatMonthLabel = (key: string) => {
    if (!key) return '';
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const dataA = allMonthlyData[monthAKey];
  const dataB = allMonthlyData[monthBKey];

  if (!dataA || !dataB) {
    return (
      <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-2xl text-slate-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-500" />
        <p className="text-sm font-semibold">Data perbandingan belum mencukupi.</p>
        <p className="text-xs text-slate-500">Mulai catat transaksi pada minimal 2 bulan berbeda untuk mengaktifkan analisis tren komparatif.</p>
      </div>
    );
  }

  // Calculate totals for month A
  const incomeA = dataA.monthlyIncome + (dataA.additionalIncomes?.reduce((s, i) => s + i.amount, 0) || 0);
  const spentA = dataA.expenses.reduce((s, e) => s + e.amount, 0);
  const surplusA = incomeA - spentA;
  const savingsRateA = incomeA > 0 ? Math.round((Math.max(0, surplusA) / incomeA) * 100) : 0;
  const dailyBurnA = Math.round(spentA / 30);

  // Calculate totals for month B
  const incomeB = dataB.monthlyIncome + (dataB.additionalIncomes?.reduce((s, i) => s + i.amount, 0) || 0);
  const spentB = dataB.expenses.reduce((s, e) => s + e.amount, 0);
  const surplusB = incomeB - spentB;
  const savingsRateB = incomeB > 0 ? Math.round((Math.max(0, surplusB) / incomeB) * 100) : 0;
  const dailyBurnB = Math.round(spentB / 30);

  // Percentage differences (B compared to A)
  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const incomeDiff = calcDiff(incomeB, incomeA);
  const spentDiff = calcDiff(spentB, spentA);
  const surplusDiff = calcDiff(surplusB, surplusA);

  // Build category comparison breakdown
  const categoryMap: Record<string, { name: string; spentA: number; spentB: number; group: string }> = {};

  // Populate from A
  dataA.categories.forEach((cat) => {
    const catSpent = dataA.expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    categoryMap[cat.name] = {
      name: cat.name,
      spentA: catSpent,
      spentB: 0,
      group: cat.group,
    };
  });

  // Populate from B
  dataB.categories.forEach((cat) => {
    const catSpent = dataB.expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    if (!categoryMap[cat.name]) {
      categoryMap[cat.name] = {
        name: cat.name,
        spentA: 0,
        spentB: catSpent,
        group: cat.group,
      };
    } else {
      categoryMap[cat.name].spentB = catSpent;
    }
  });

  const categoryComparisonList = Object.values(categoryMap).map((item) => {
    const diffNominal = item.spentB - item.spentA;
    const diffPct = calcDiff(item.spentB, item.spentA);
    return {
      ...item,
      diffNominal,
      diffPct,
    };
  });

  // Sort by highest spending in B
  categoryComparisonList.sort((a, b) => b.spentB - a.spentB);

  // Chart data
  const chartData = categoryComparisonList.slice(0, 7).map((item) => ({
    name: item.name.length > 14 ? item.name.slice(0, 12) + '...' : item.name,
    [formatMonthLabel(monthAKey)]: item.spentA,
    [formatMonthLabel(monthBKey)]: item.spentB,
  }));

  // Top spikes & savings
  const spikes = [...categoryComparisonList].filter((c) => c.diffNominal > 0).sort((a, b) => b.diffNominal - a.diffNominal);
  const savings = [...categoryComparisonList].filter((c) => c.diffNominal < 0).sort((a, b) => a.diffNominal - b.diffNominal);

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Perbandingan Arus Kas Antar-Bulan (MoM Analytics)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi efisiensi pengeluaran dan pertumbuhan saldo antar periode pembukuan
              </p>
            </div>
          </div>

          {/* Month Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <div className="text-2xs font-semibold text-slate-400">Bandingkan:</div>
              <select
                value={monthAKey}
                onChange={(e) => setMonthAKey(e.target.value)}
                className="bg-[#162032] border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                {monthKeys.map((k) => (
                  <option key={k} value={k}>
                    {formatMonthLabel(k)}
                  </option>
                ))}
              </select>

              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />

              <select
                value={monthBKey}
                onChange={(e) => setMonthBKey(e.target.value)}
                className="bg-[#162032] border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                {monthKeys.map((k) => (
                  <option key={k} value={k}>
                    {formatMonthLabel(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4 Metric Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* Pemasukan */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Total Pemasukan</span>
            <div className="flex items-baseline justify-between">
              <p className="text-base font-extrabold text-white font-mono">
                Rp {incomeB.toLocaleString('id-ID')}
              </p>
              <span
                className={`text-2xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                  incomeDiff >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {incomeDiff >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(incomeDiff)}%
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              Bulan lalu: Rp {incomeA.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Pengeluaran */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Total Pengeluaran</span>
            <div className="flex items-baseline justify-between">
              <p className="text-base font-extrabold text-white font-mono">
                Rp {spentB.toLocaleString('id-ID')}
              </p>
              <span
                className={`text-2xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                  spentDiff <= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {spentDiff <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {Math.abs(spentDiff)}% {spentDiff <= 0 ? 'hemat' : 'boros'}
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              Bulan lalu: Rp {spentA.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Surplus Kas */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Sisa Surplus Kas</span>
            <div className="flex items-baseline justify-between">
              <p className={`text-base font-extrabold font-mono ${surplusB >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Rp {surplusB.toLocaleString('id-ID')}
              </p>
              <span
                className={`text-2xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                  surplusB >= surplusA ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {surplusB >= surplusA ? '+' : ''}Rp {(surplusB - surplusA).toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              Bulan lalu: Rp {surplusA.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Rata-rata Pengeluaran Harian */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Burn Rate Harian</span>
            <div className="flex items-baseline justify-between">
              <p className="text-base font-extrabold text-white font-mono">
                Rp {dailyBurnB.toLocaleString('id-ID')}/hari
              </p>
              <span className="text-2xs font-semibold text-slate-400">
                Tabungan: {savingsRateB}%
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              Bulan lalu: Rp {dailyBurnA.toLocaleString('id-ID')}/hari
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-blue-400" />
          <span>Grafik Perbandingan Pengeluaran per Pos Anggaran (Top Kategori)</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey={formatMonthLabel(monthAKey)} fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey={formatMonthLabel(monthBKey)} fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Table & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3">Rincian Perubahan per Pos Anggaran</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-semibold">Pos Anggaran</th>
                  <th className="pb-2 font-semibold text-right">{formatMonthLabel(monthAKey)}</th>
                  <th className="pb-2 font-semibold text-right">{formatMonthLabel(monthBKey)}</th>
                  <th className="pb-2 font-semibold text-right">Selisih & Tren</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categoryComparisonList.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-medium text-slate-200">{c.name}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">
                      Rp {c.spentA.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-white">
                      Rp {c.spentB.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-2xs font-bold ${
                          c.diffNominal > 0
                            ? 'bg-rose-500/20 text-rose-300'
                            : c.diffNominal < 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.diffNominal > 0 ? `+Rp ${c.diffNominal.toLocaleString('id-ID')}` : c.diffNominal < 0 ? `-Rp ${Math.abs(c.diffNominal).toLocaleString('id-ID')}` : 'Sama'}
                        {c.diffPct !== 0 && ` (${c.diffPct > 0 ? '+' : ''}${c.diffPct}%)`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highlights Side Panel */}
        <div className="space-y-4">
          {/* Spikes */}
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Lonjakan Biaya Terbesar</span>
            </h4>
            {spikes.length === 0 ? (
              <p className="text-2xs text-slate-500">Tidak ada lonjakan pengeluaran pada periode ini.</p>
            ) : (
              <div className="space-y-2">
                {spikes.slice(0, 3).map((s) => (
                  <div key={s.name} className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-2xs">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{s.name}</span>
                      <span className="text-rose-400 font-mono">+Rp {s.diffNominal.toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">Naik {s.diffPct}% dari bulan sebelumnya</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Savings */}
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Penghematan Berhasil (Lebih Efisien)</span>
            </h4>
            {savings.length === 0 ? (
              <p className="text-2xs text-slate-500">Belum ada penghematan yang signifikan.</p>
            ) : (
              <div className="space-y-2">
                {savings.slice(0, 3).map((s) => (
                  <div key={s.name} className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-2xs">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{s.name}</span>
                      <span className="text-emerald-400 font-mono">-Rp {Math.abs(s.diffNominal).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">Turun {Math.abs(s.diffPct)}% lebih hemat</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
