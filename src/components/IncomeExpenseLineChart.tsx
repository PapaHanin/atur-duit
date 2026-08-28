import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import { Expense, AdditionalIncome } from '../types';
import { formatRupiah } from '../utils/formatters';

interface IncomeExpenseLineChartProps {
  monthKey: string;
  monthlyIncome: number;
  additionalIncomes: AdditionalIncome[];
  expenses: Expense[];
}

export const IncomeExpenseLineChart: React.FC<IncomeExpenseLineChartProps> = ({
  monthKey,
  monthlyIncome,
  additionalIncomes = [],
  expenses = [],
}) => {
  const [chartMode, setChartMode] = useState<'cumulative' | 'daily'>('cumulative');

  // Parse year & month
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || new Date().getMonth() + 1;

  // Calculate days in the month
  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Aggregate daily data
  const chartData = useMemo(() => {
    // Initialize day map from 1 to daysInMonth
    const dailyData: {
      day: number;
      label: string;
      fullDate: string;
      income: number;
      expense: number;
      cumulativeIncome: number;
      cumulativeExpense: number;
      netSavings: number;
    }[] = [];

    // Base salary is credited on Day 1
    const incomeByDay: { [day: number]: number } = {};
    incomeByDay[1] = monthlyIncome;

    // Additional incomes
    (additionalIncomes || []).forEach((inc) => {
      if (!inc.date) return;
      const d = new Date(inc.date);
      const incMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (incMonthKey === monthKey) {
        const day = d.getDate();
        incomeByDay[day] = (incomeByDay[day] || 0) + (inc.amount || 0);
      }
    });

    // Expenses
    const expenseByDay: { [day: number]: number } = {};
    (expenses || []).forEach((exp) => {
      if (!exp.date) return;
      const d = new Date(exp.date);
      const expMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (expMonthKey === monthKey) {
        const day = d.getDate();
        expenseByDay[day] = (expenseByDay[day] || 0) + (exp.amount || 0);
      }
    });

    let runningIncome = 0;
    let runningExpense = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const inc = incomeByDay[day] || 0;
      const exp = expenseByDay[day] || 0;

      runningIncome += inc;
      runningExpense += exp;

      dailyData.push({
        day,
        label: `Tgl ${day}`,
        fullDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        income: inc,
        expense: exp,
        cumulativeIncome: runningIncome,
        cumulativeExpense: runningExpense,
        netSavings: runningIncome - runningExpense,
      });
    }

    return dailyData;
  }, [monthKey, monthlyIncome, additionalIncomes, expenses, daysInMonth, year, month]);

  // Overall Totals
  const totalIncome = useMemo(() => {
    return (
      monthlyIncome +
      (additionalIncomes || []).reduce((acc, curr) => acc + (curr.amount || 0), 0)
    );
  }, [monthlyIncome, additionalIncomes]);

  const totalExpense = useMemo(() => {
    return (expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [expenses]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';
  const avgDailyExpense = daysInMonth > 0 ? Math.round(totalExpense / daysInMonth) : 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;

      return (
        <div className="bg-[#0B1120]/95 backdrop-blur-md border border-slate-700/90 p-3.5 rounded-2xl shadow-xl shadow-black/80 text-xs min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {dataPoint.label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {dataPoint.fullDate}
            </span>
          </div>

          <div className="space-y-1.5">
            {chartMode === 'cumulative' ? (
              <>
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Pemasukan Kumulatif:
                  </span>
                  <span className="font-mono font-bold">
                    {formatRupiah(dataPoint.cumulativeIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-rose-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Pengeluaran Kumulatif:
                  </span>
                  <span className="font-mono font-bold">
                    {formatRupiah(dataPoint.cumulativeExpense)}
                  </span>
                </div>
                <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between text-white font-bold">
                  <span className="text-slate-300">Sisa Saldo Kumulatif:</span>
                  <span
                    className={`font-mono ${
                      dataPoint.netSavings >= 0 ? 'text-indigo-300' : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(dataPoint.netSavings)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Pemasukan Hari Ini:
                  </span>
                  <span className="font-mono font-bold">
                    {formatRupiah(dataPoint.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-rose-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Pengeluaran Hari Ini:
                  </span>
                  <span className="font-mono font-bold">
                    {formatRupiah(dataPoint.expense)}
                  </span>
                </div>
                <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between text-white font-bold">
                  <span className="text-slate-300">Net Arus Kas:</span>
                  <span
                    className={`font-mono ${
                      dataPoint.income - dataPoint.expense >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(dataPoint.income - dataPoint.expense)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111C30] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/30 space-y-6">
      {/* Header & Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-indigo-400 shadow-2xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tren Pemasukan vs Pengeluaran
              </h3>
              <p className="text-xs text-slate-400">
                Visualisasi pergerakan arus kas harian dan akumulasi keuangan bulan ini
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Mode: Kumulatif vs Harian */}
        <div className="flex items-center bg-[#0B1120] p-1 rounded-2xl border border-slate-800 self-start sm:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setChartMode('cumulative')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartMode === 'cumulative'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kumulatif (Akumulasi)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('daily')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Arus Harian
          </button>
        </div>
      </div>

      {/* Metric Mini Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pemasukan */}
        <div className="bg-[#0B1120]/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Pemasukan
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-400 mt-0.5 block">
              +{formatRupiah(totalIncome)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-[#0B1120]/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Pengeluaran
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-rose-400 mt-0.5 block">
              -{formatRupiah(totalExpense)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/50">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        {/* Selisih Bersih / Surplus */}
        <div className="bg-[#0B1120]/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sisa Saldo Bersih
            </span>
            <span
              className={`text-sm sm:text-base font-black font-mono mt-0.5 block ${
                netSavings >= 0 ? 'text-indigo-300' : 'text-rose-400'
              }`}
            >
              {formatRupiah(netSavings)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Rata-Rata Pengeluaran Harian */}
        <div className="bg-[#0B1120]/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Rata-rata / Hari
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-200 mt-0.5 block">
              {formatRupiah(avgDailyExpense)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/50">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recharts Responsive Line Chart */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E293B"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#64748B"
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickFormatter={(v) => `Tgl ${v}`}
              interval={Math.floor(daysInMonth / 7)}
            />

            <YAxis
              stroke="#64748B"
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
                return val;
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {chartMode === 'cumulative' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="cumulativeIncome"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="Pemasukan Kumulatif"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10B981', stroke: '#0B1120', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeExpense"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Pengeluaran Kumulatif"
                  activeDot={{ r: 5, fill: '#F43F5E', stroke: '#0B1120', strokeWidth: 2 }}
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10B981' }}
                  name="Pemasukan Harian"
                  activeDot={{ r: 6, fill: '#10B981', stroke: '#0B1120', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#F43F5E' }}
                  name="Pengeluaran Harian"
                  activeDot={{ r: 6, fill: '#F43F5E', stroke: '#0B1120', strokeWidth: 2 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary Notes */}
      <div className="flex items-center justify-between gap-4 flex-wrap text-xs pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-2xs" />
            <span className="text-slate-300 font-semibold">
              {chartMode === 'cumulative' ? 'Pemasukan Terkumpul' : 'Pemasukan Harian'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 shadow-2xs" />
            <span className="text-slate-300 font-semibold">
              {chartMode === 'cumulative' ? 'Pengeluaran Terkumpul' : 'Pengeluaran Harian'}
            </span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Tingkat Tabungan:{' '}
          <span className="text-emerald-400 font-bold font-mono">{savingsRate}%</span>
        </div>
      </div>
    </div>
  );
};
