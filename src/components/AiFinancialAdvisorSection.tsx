import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  PiggyBank,
  Check,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Category, Expense, AdditionalIncome, FinancialGoal, AiFinancialAdvice } from '../types';
import { formatRupiah, calculateCategorySpent } from '../utils/formatters';

interface AiFinancialAdvisorSectionProps {
  monthKey: string;
  monthlyIncome: number;
  additionalIncomes?: AdditionalIncome[];
  categories: Category[];
  expenses: Expense[];
  goals?: FinancialGoal[];
  onOpenCategoryManager?: () => void;
  onQuickSpendCategory?: (category: Category) => void;
}

const AI_ADVICE_CACHE_PREFIX = 'aturduit_ai_advice_';

export const AiFinancialAdvisorSection: React.FC<AiFinancialAdvisorSectionProps> = ({
  monthKey,
  monthlyIncome,
  additionalIncomes = [],
  categories = [],
  expenses = [],
  goals = [],
  onOpenCategoryManager,
  onQuickSpendCategory,
}) => {
  const [advice, setAdvice] = useState<AiFinancialAdvice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Load cached advice from localStorage when monthKey changes
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`${AI_ADVICE_CACHE_PREFIX}${monthKey}`);
      if (cached) {
        setAdvice(JSON.parse(cached));
      } else {
        setAdvice(null);
      }
    } catch (e) {
      console.error('Failed to load cached AI advice', e);
    }
  }, [monthKey]);

  const handleFetchAiAdvice = async (queryText?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        monthKey,
        monthlyIncome,
        additionalIncomes,
        categories,
        expenses,
        goals,
        customQuery: queryText || customQuestion || undefined,
      };

      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghubungi Gemini AI Advisor');
      }

      const generatedAdvice: AiFinancialAdvice = {
        ...json.data,
        generatedAt: Date.now(),
      };

      setAdvice(generatedAdvice);
      // Cache to localStorage
      try {
        localStorage.setItem(
          `${AI_ADVICE_CACHE_PREFIX}${monthKey}`,
          JSON.stringify(generatedAdvice)
        );
      } catch (e) {
        console.error('Failed to cache AI advice', e);
      }

      if (queryText) {
        setCustomQuestion('');
      }
    } catch (err: any) {
      console.error('AI Advisor error:', err);
      setError(err?.message || 'Terjadi kesalahan saat menganalisis pola pengeluaran.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAction = (index: number) => {
    setCheckedActions((prev) => ({
      ...prev,
      [`${monthKey}_${index}`]: !prev[`${monthKey}_${index}`],
    }));
  };

  const totalSpent = (expenses || []).reduce((sum, e) => sum + (e?.amount || 0), 0);
  const totalAdditional = (additionalIncomes || []).reduce((sum, i) => sum + (i?.amount || 0), 0);
  const totalCombinedIncome = monthlyIncome + totalAdditional;

  const quickQuestions = [
    '💡 Pos mana yang paling berpotensi bocor?',
    '☕ Berapa hemat jika jajan kopi dikurangi?',
    '📈 Evaluasi alokasi tabungan saya',
    '🍱 Strategi penghematan pos makanan & resto',
  ];

  return (
    <section
      id="ai-financial-advisor"
      className="bg-gradient-to-b from-[#111C30] to-[#0D1526] rounded-3xl border border-indigo-900/40 p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-950/60 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111C30] flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                AI Financial Advisor
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini AI
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analisis pola pengeluaran otomatis & rekomendasi penghematan cerdas per kategori
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {advice && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5 font-medium"
              title={isExpanded ? 'Sembunyikan detail' : 'Tampilkan detail'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Ringkas
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Detail
                </>
              )}
            </button>
          )}

          <button
            onClick={() => handleFetchAiAdvice()}
            disabled={isLoading}
            className="text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md shadow-indigo-950/60 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Menganalisis...' : advice ? 'Perbarui Analisis AI' : 'Analisis Pengeluaran AI'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Gagal memproses rekomendasi AI</p>
            <p className="text-rose-400/90">{error}</p>
            <p className="text-[11px] text-slate-400 pt-1">
              Pastikan Anda terhubung ke internet dan API key Gemini sudah terkonfigurasi.
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-5 space-y-4 animate-pulse">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
            <div className="h-4 bg-slate-700/60 rounded w-1/3" />
            <div className="h-3 bg-slate-700/40 rounded w-5/6" />
            <div className="h-3 bg-slate-700/30 rounded w-4/6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800/60 h-28" />
            ))}
          </div>
        </div>
      )}

      {/* Initial Empty State (When no analysis yet) */}
      {!advice && !isLoading && (
        <div className="mt-5 p-6 rounded-2xl bg-[#0B1120]/60 border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-800/50">
            <Bot className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Dapatkan Tips Penghematan & Deteksi Pola Belanja
            </h3>
            <p className="text-xs text-slate-400">
              Gemini AI akan membaca seluruh catatan transaksi bulan ini ({expenses.length} pengeluaran,{' '}
              {categories.length} pos anggaran) untuk menemukan kebocoran halus dan strategi hemat yang paling efektif.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleFetchAiAdvice(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/70 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-700 text-slate-300 border border-slate-700/60 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Analysis Results */}
      {advice && !isLoading && (
        <div className="mt-5 space-y-5">
          {/* Top Row: Score Badge + Health Status + Savings Potential + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Score Card */}
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 flex items-center gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-lg shadow-inner ${
                    advice.healthScore >= 80
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      : advice.healthScore >= 60
                      ? 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span>{advice.healthScore}</span>
                  <span className="text-[9px] font-normal text-slate-400 -mt-1">/100</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Kesehatan Keuangan
                </span>
                <h4 className="text-sm font-bold text-white">{advice.healthStatus}</h4>
                <p className="text-[11px] text-slate-400">
                  {advice.healthScore >= 75
                    ? 'Arus kas terkontrol baik'
                    : advice.healthScore >= 50
                    ? 'Perlu sedikit pengetatan'
                    : 'Batas belanja terlampaui'}
                </p>
              </div>
            </div>

            {/* Potential Savings Highlight */}
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Potensi Hemat Bulanan
                </span>
                <h4 className="text-base font-bold font-mono text-emerald-400">
                  +{formatRupiah(advice.monthlySavingsPotentialTotal || 0)}
                </h4>
                <p className="text-[11px] text-slate-400">Jika tips AI dieksekusi rutin</p>
              </div>
            </div>

            {/* Smart Wisdom / Insight */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  AI Smart Insight
                </span>
                <p className="text-xs text-slate-300 italic line-clamp-2">
                  "{advice.smartInsight || 'Disiplin mengontrol pos kecil adalah rahasia tabungan besar.'}"
                </p>
              </div>
            </div>
          </div>

          {/* AI Summary Banner */}
          <div className="p-4 rounded-2xl bg-[#0B1120]/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white mr-1.5">Diagnosis AI:</span>
            {advice.summary}
          </div>

          {isExpanded && (
            <>
              {/* Section 1: Pola Pengeluaran Terdeteksi */}
              {(advice.detectedPatterns || []).length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-indigo-400" />
                      Pola Pengeluaran yang Terdeteksi
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {advice.detectedPatterns.length} pola diidentifikasi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {advice.detectedPatterns.map((pattern, idx) => {
                      const isWarning = pattern.type === 'warning';
                      const isPositive = pattern.type === 'positive';
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                            isWarning
                              ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                              : isPositive
                              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                              : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {isWarning ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : isPositive ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              )}
                              {pattern.title}
                            </span>
                            {pattern.categoryName && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {pattern.categoryName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-normal">
                            {pattern.description}
                          </p>
                          {pattern.impactAmount && pattern.impactAmount > 0 && (
                            <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                              Dampak: ~{formatRupiah(pattern.impactAmount)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Tips Penghematan Spesifik per Kategori */}
              {(advice.categorySavingTips || []).length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Tips Penghematan Spesifik per Pos Kategori
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Rekomendasi taktis & realistis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {advice.categorySavingTips.map((tip, idx) => {
                      const matchedCat = categories.find(
                        (c) =>
                          c.id === tip.categoryId ||
                          c.name.toLowerCase() === tip.categoryName?.toLowerCase()
                      );

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-white">
                                  {tip.categoryName}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    tip.priority === 'tinggi'
                                      ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                                      : tip.priority === 'sedang'
                                      ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  Prioritas {tip.priority}
                                </span>
                              </div>

                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                                Hemat +{formatRupiah(tip.potentialMonthlySaving)}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {tip.savingTip}
                            </p>

                            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-indigo-300 flex items-center gap-2">
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>
                                <strong className="text-slate-200">Aksi:</strong> {tip.actionItem}
                              </span>
                            </div>
                          </div>

                          {matchedCat && onQuickSpendCategory && (
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-400">
                                Terpakai:{' '}
                                <span className="font-mono text-slate-200">
                                  {formatRupiah(calculateCategorySpent(matchedCat.id, expenses))}
                                </span>{' '}
                                / {formatRupiah(matchedCat.allocatedAmount)}
                              </span>
                              <button
                                onClick={() => onQuickSpendCategory(matchedCat)}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 group-hover:underline"
                              >
                                Catat Pengeluaran
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Rencana Aksi Prioritas (Action Plan Checklist) */}
              {(advice.actionPlan || []).length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Rencana Aksi Prioritas Bulan Ini
                  </h3>

                  <div className="space-y-2">
                    {advice.actionPlan.map((action, idx) => {
                      const isChecked = !!checkedActions[`${monthKey}_${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAction(idx)}
                          className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 line-through opacity-70'
                              : 'bg-[#0B1120] border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-slate-700 bg-slate-800/60 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs leading-normal">{action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Follow-up Prompt Box */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tanyakan pertanyaan lanjutan atau simulasi penghematan:</span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customQuestion.trim() && !isLoading) {
                      handleFetchAiAdvice(customQuestion.trim());
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Contoh: Bagaimana cara menghemat Rp300.000 lagi dari pos Transportasi?"
                    className="flex-1 text-xs bg-[#0B1120] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!customQuestion.trim() || isLoading}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </form>

                {/* Quick chip suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickQuestions.slice(0, 3).map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFetchAiAdvice(q)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-950/80 hover:text-indigo-300 text-slate-400 border border-slate-800 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};
