import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Upload,
  FileText,
  Table,
  CheckCircle,
  Database,
  Calendar,
  Layers,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MonthlyData, FinancialGoal, Expense, AdditionalIncome } from '../types';
import { formatRupiah, calculateCategorySpent, formatMonthYearTitle } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyData: MonthlyData;
  allMonthsData: Record<string, MonthlyData>;
  financialGoals: FinancialGoal[];
  onImportBackup: (backupData: { allMonthsData: Record<string, MonthlyData>; financialGoals: FinancialGoal[] }) => void;
  onImportTransactions: (importedExpenses: Expense[], importedIncomes: AdditionalIncome[], targetMonthKey: string) => void;
}

type ExportScope = 'single_month' | 'annual' | 'all_time';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  monthlyData,
  allMonthsData = {},
  financialGoals = [],
  onImportBackup,
  onImportTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'backup' | 'import'>('export');
  const [exportScope, setExportScope] = useState<ExportScope>('single_month');
  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyData.monthKey || new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Available months list from allMonthsData & current
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    if (monthlyData?.monthKey) set.add(monthlyData.monthKey);
    Object.keys(allMonthsData || {}).forEach((k) => set.add(k));
    return Array.from(set).sort().reverse();
  }, [monthlyData, allMonthsData]);

  // Available years list
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    availableMonths.forEach((m) => {
      const yr = m.split('-')[0];
      if (yr) set.add(yr);
    });
    set.add(new Date().getFullYear().toString());
    return Array.from(set).sort().reverse();
  }, [availableMonths]);

  if (!isOpen) return null;

  // Helper map to find category name by id
  const getCategoryName = (data: MonthlyData, categoryId: string): string => {
    const cat = (data.categories || []).find((c) => c.id === categoryId);
    return cat ? cat.name : 'Umum / Lainnya';
  };

  // Filter months based on export scope
  const getMonthsToExport = (): { monthKey: string; data: MonthlyData }[] => {
    const fullDataMap: Record<string, MonthlyData> = {
      ...allMonthsData,
      [monthlyData.monthKey]: monthlyData,
    };

    if (exportScope === 'single_month') {
      const data = fullDataMap[selectedMonth] || {
        monthKey: selectedMonth,
        monthlyIncome: 0,
        categories: [],
        expenses: [],
        additionalIncomes: [],
        lastUpdated: Date.now(),
      };
      return [{ monthKey: selectedMonth, data }];
    } else if (exportScope === 'annual') {
      return Object.entries(fullDataMap)
        .filter(([key]) => key.startsWith(selectedYear))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, data]) => ({ monthKey, data }));
    } else {
      // all_time
      return Object.entries(fullDataMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, data]) => ({ monthKey, data }));
    }
  };

  // 1. EXPORT TO PDF (Clean Indonesian Layout)
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const months = getMonthsToExport();

      if (months.length === 0) {
        setStatusMessage({ type: 'error', text: 'Tidak ada data untuk periode yang dipilih.' });
        return;
      }

      // Title & Header Branding
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN EVALUASI KEUANGAN - ATURDUIT', 14, 15);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate 400
      const scopeLabel =
        exportScope === 'single_month'
          ? `Periode: Bulan ${formatMonthYearTitle(selectedMonth)}`
          : exportScope === 'annual'
          ? `Periode: Evaluasi Tahunan ${selectedYear}`
          : 'Periode: Evaluasi Keseluruhan (All-Time)';
      doc.text(`${scopeLabel} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 23);

      let currentY = 38;

      // Summary Totals Calculation
      let totalAllIncome = 0;
      let totalAllExpense = 0;

      months.forEach(({ data }) => {
        const addInc = (data.additionalIncomes || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const inc = (data.monthlyIncome || 0) + addInc;
        const exp = (data.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        totalAllIncome += inc;
        totalAllExpense += exp;
      });

      const netSurplus = totalAllIncome - totalAllExpense;

      // Overview Box
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.roundedRect(14, currentY, 182, 24, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('TOTAL PEMASUKAN', 20, currentY + 8);
      doc.text('TOTAL PENGELUARAN', 80, currentY + 8);
      doc.text('SISA SALDO / SURPLUS', 140, currentY + 8);

      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105); // Green
      doc.text(formatRupiah(totalAllIncome), 20, currentY + 18);

      doc.setTextColor(225, 29, 72); // Rose
      doc.text(formatRupiah(totalAllExpense), 80, currentY + 18);

      doc.setTextColor(79, 70, 229); // Indigo
      doc.text(formatRupiah(netSurplus), 140, currentY + 18);

      currentY += 32;

      // If Annual or All-Time: Monthly Breakdown Table
      if (exportScope !== 'single_month') {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Ringkasan Arus Kas Per Bulan', 14, currentY);
        currentY += 4;

        const summaryRows = months.map(({ monthKey, data }) => {
          const addInc = (data.additionalIncomes || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
          const inc = (data.monthlyIncome || 0) + addInc;
          const exp = (data.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
          const rem = inc - exp;
          const txCount = (data.expenses || []).length;
          return [
            formatMonthYearTitle(monthKey),
            formatRupiah(inc),
            formatRupiah(exp),
            formatRupiah(rem),
            `${txCount} transaksi`,
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Bulan', 'Pemasukan', 'Pengeluaran', 'Surplus / Sisa', 'Aktivitas']],
          body: summaryRows,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Categories Allocation Breakdown
      if (months.length > 0) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(
          exportScope === 'single_month'
            ? `Alokasi Pos Anggaran (${formatMonthYearTitle(months[0].monthKey)})`
            : 'Detail Pos Anggaran Bulan Terakhir',
          14,
          currentY
        );
        currentY += 4;

        const targetData = months[months.length - 1].data;
        const catRows = (targetData.categories || []).map((cat) => {
          const spent = calculateCategorySpent(cat.id, targetData.expenses || []);
          const remaining = (cat.allocatedAmount || 0) - spent;
          return [
            cat.name,
            cat.group?.toUpperCase() || 'UMUM',
            `${cat.percentage}%`,
            formatRupiah(cat.allocatedAmount),
            formatRupiah(spent),
            formatRupiah(remaining),
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Pos Anggaran', 'Kelompok', 'Porsi', 'Batas Anggaran', 'Realisasi', 'Sisa']],
          body: catRows,
          theme: 'striped',
          headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Detailed Transactions Table (If Single Month)
      if (exportScope === 'single_month' && months[0].data.expenses.length > 0) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Daftar Rincian Transaksi Pengeluaran', 14, currentY);
        currentY += 4;

        const currentMonthInfo = months[0].data;
        const txRows = (currentMonthInfo.expenses || []).map((exp) => {
          return [
            exp.date || '-',
            getCategoryName(currentMonthInfo, exp.categoryId),
            exp.description || '-',
            formatRupiah(exp.amount),
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Tanggal', 'Kategori', 'Keterangan', 'Nominal']],
          body: txRows,
          theme: 'plain',
          headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 8, cellPadding: 2.5 },
          margin: { left: 14, right: 14 },
        });
      }

      // Save PDF
      const filename = `Laporan_Keuangan_AturDuit_${exportScope}_${
        exportScope === 'single_month' ? selectedMonth : exportScope === 'annual' ? selectedYear : 'AllTime'
      }.pdf`;
      doc.save(filename);
      setStatusMessage({ type: 'success', text: `Berhasil mengunduh dokumen PDF: ${filename}` });
    } catch (e: any) {
      console.error('Failed to export PDF', e);
      setStatusMessage({ type: 'error', text: 'Gagal membuat dokumen PDF: ' + (e?.message || 'Error tidak diketahui') });
    }
  };

  // 2. EXPORT TO EXCEL (Multi-sheet, Full Details)
  const handleExportExcel = () => {
    try {
      const months = getMonthsToExport();
      if (months.length === 0) {
        setStatusMessage({ type: 'error', text: 'Tidak ada data untuk diekspor ke Excel.' });
        return;
      }

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Ringkasan Bulanan (Summary)
      const summaryData = months.map(({ monthKey, data }) => {
        const addInc = (data.additionalIncomes || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const totalInc = (data.monthlyIncome || 0) + addInc;
        const totalExp = (data.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        return {
          'Periode': formatMonthYearTitle(monthKey),
          'Bulan (Kode)': monthKey,
          'Gaji Pokok (Rp)': data.monthlyIncome || 0,
          'Pemasukan Lainnya (Rp)': addInc,
          'Total Pemasukan (Rp)': totalInc,
          'Total Pengeluaran (Rp)': totalExp,
          'Sisa Saldo (Rp)': totalInc - totalExp,
          'Jumlah Transaksi': (data.expenses || []).length,
        };
      });
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Bulanan');

      // Sheet 2: Daftar Semua Pengeluaran
      const allExpenses: any[] = [];
      months.forEach(({ monthKey, data }) => {
        (data.expenses || []).forEach((exp) => {
          allExpenses.push({
            'Bulan': monthKey,
            'Tanggal': exp.date || '',
            'Kategori': getCategoryName(data, exp.categoryId),
            'Keterangan': exp.description || '',
            'Nominal (Rp)': exp.amount || 0,
            'Ada Foto Struk': exp.receiptImage ? 'Ya' : 'Tidak',
          });
        });
      });
      if (allExpenses.length > 0) {
        const expenseSheet = XLSX.utils.json_to_sheet(allExpenses);
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Daftar Pengeluaran');
      }

      // Sheet 3: Daftar Pemasukan Tambahan
      const allIncomes: any[] = [];
      months.forEach(({ monthKey, data }) => {
        (data.additionalIncomes || []).forEach((inc) => {
          allIncomes.push({
            'Bulan': monthKey,
            'Tanggal': inc.date || '',
            'Sumber Pemasukan': inc.sourceName || '',
            'Jenis': inc.incomeType || '',
            'Nominal (Rp)': inc.amount || 0,
            'Catatan': inc.notes || '',
          });
        });
      });
      if (allIncomes.length > 0) {
        const incomeSheet = XLSX.utils.json_to_sheet(allIncomes);
        XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Pemasukan Lain');
      }

      // Sheet 4: Target Impian (Goals)
      if (financialGoals && financialGoals.length > 0) {
        const goalsData = financialGoals.map((g) => ({
          'Nama Target': g.name,
          'Target Dana (Rp)': g.targetAmount,
          'Terkumpul (Rp)': g.currentAmount,
          'Target Waktu': g.targetDate || '-',
          'Kategori Asal': g.categoryName || '-',
          'Keterangan': g.description || '-',
        }));
        const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
        XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Target Impian');
      }

      const filename = `Laporan_Keuangan_AturDuit_${exportScope}_${
        exportScope === 'single_month' ? selectedMonth : exportScope === 'annual' ? selectedYear : 'AllTime'
      }.xlsx`;

      XLSX.writeFile(workbook, filename);
      setStatusMessage({ type: 'success', text: `Berhasil mengunduh spreadsheet Excel: ${filename}` });
    } catch (e: any) {
      console.error('Failed to export Excel', e);
      setStatusMessage({ type: 'error', text: 'Gagal membuat file Excel: ' + (e?.message || 'Error tidak diketahui') });
    }
  };

  // 3. FULL BACKUP JSON
  const handleExportFullJSON = () => {
    const fullBackup = {
      app: 'AturDuit',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      allMonthsData: {
        ...allMonthsData,
        [monthlyData.monthKey]: monthlyData,
      },
      financialGoals: financialGoals || [],
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `aturduit_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    setStatusMessage({ type: 'success', text: 'Backup lengkap seluruh data berhasil diunduh dalam format JSON.' });
  };

  // 4. RESTORE / IMPORT BACKUP JSON
  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Validation
        if (parsed && (parsed.allMonthsData || parsed.monthKey)) {
          let mergedAllMonths: Record<string, MonthlyData> = {};
          let goals: FinancialGoal[] = [];

          if (parsed.allMonthsData) {
            mergedAllMonths = parsed.allMonthsData;
            goals = parsed.financialGoals || [];
          } else if (parsed.monthKey) {
            // Single month backup format
            mergedAllMonths = {
              [parsed.monthKey]: parsed,
            };
          }

          onImportBackup({
            allMonthsData: mergedAllMonths,
            financialGoals: goals,
          });

          setStatusMessage({
            type: 'success',
            text: `Data cadangan berhasil dipulihkan! Terimpor ${Object.keys(mergedAllMonths).length} periode bulan.`,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Format file JSON tidak valid. Pastikan file adalah backup dari AturDuit.',
          });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Gagal membaca file JSON: ' + err?.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 5. IMPORT EXCEL / CSV TRANSACTIONS
  const handleImportExcelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          setStatusMessage({ type: 'error', text: 'File Excel kosong atau tidak terbaca.' });
          return;
        }

        const importedExpenses: Expense[] = [];
        const importedIncomes: AdditionalIncome[] = [];

        // Match existing category id if available
        const currentCategories = monthlyData.categories || [];

        jsonRows.forEach((row, idx) => {
          const tanggal = row['Tanggal'] || row['date'] || row['Tgl'] || new Date().toISOString().slice(0, 10);
          const kategoriName = String(row['Kategori'] || row['category'] || row['Pos'] || 'Lain-lain');
          const keterangan = String(row['Keterangan'] || row['description'] || row['Nama'] || `Transaksi Import #${idx + 1}`);
          const nominal = parseFloat(row['Nominal (Rp)'] || row['Nominal'] || row['amount'] || row['Jumlah'] || 0);

          if (nominal > 0) {
            // Check if income or expense
            const isIncome =
              kategoriName.toLowerCase().includes('pemasukan') ||
              keterangan.toLowerCase().includes('gaji') ||
              keterangan.toLowerCase().includes('income');

            if (isIncome) {
              importedIncomes.push({
                id: `import_inc_${Date.now()}_${idx}`,
                sourceName: keterangan,
                amount: nominal,
                incomeType: 'freelance',
                date: String(tanggal),
                notes: `Impor Excel (${kategoriName})`,
                allocationMode: 'unallocated_surplus',
                createdAt: Date.now(),
              });
            } else {
              const matchedCat = currentCategories.find(
                (c) => c.name.toLowerCase() === kategoriName.toLowerCase()
              );
              const categoryId = matchedCat ? matchedCat.id : (currentCategories[0]?.id || 'cat_lain');

              importedExpenses.push({
                id: `import_exp_${Date.now()}_${idx}`,
                categoryId,
                amount: nominal,
                description: keterangan,
                date: String(tanggal),
                createdAt: Date.now(),
              });
            }
          }
        });

        if (importedExpenses.length > 0 || importedIncomes.length > 0) {
          onImportTransactions(importedExpenses, importedIncomes, selectedMonth);
          setStatusMessage({
            type: 'success',
            text: `Berhasil mengimpor ${importedExpenses.length} pengeluaran dan ${importedIncomes.length} pemasukan ke bulan ${selectedMonth}.`,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Tidak ada baris transaksi yang cocok. Pastikan terdapat kolom Tanggal, Kategori, Keterangan, dan Nominal.',
          });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Gagal mengurai file Excel: ' + err?.message });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#111C30] rounded-3xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-950/60">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Pusat Evaluasi, Ekspor & Backup Data
              </h2>
              <p className="text-xs text-slate-400">
                Unduh PDF, Excel, atau cadangkan data evaluasi bulanan & tahunan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0B1120]/60 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Unduh Laporan (PDF / Excel)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('backup');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Cadangkan (Backup)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah / Pulihkan
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mx-5 mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-800/80 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* TAB 1: EXPORT REPORT (PDF & EXCEL) */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Step 1: Pilih Jangkauan Periode */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  1. Pilih Rentang Periode Evaluasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope('single_month')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                      exportScope === 'single_month'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-2xs'
                        : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Bulan Tertentu
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('annual')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                      exportScope === 'annual'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-2xs'
                        : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Tahunan (1 Tahun Penuh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('all_time')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                      exportScope === 'all_time'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-2xs'
                        : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Semua Periode
                  </button>
                </div>
              </div>

              {/* Step 2: Date Selector Dropdown */}
              {exportScope === 'single_month' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Pilih Bulan Spesifik
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {formatMonthYearTitle(m)} ({m})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {exportScope === 'annual' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Pilih Tahun
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-[#0B1120] border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Format Pilihan Unduhan */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  2. Pilih Format Dokumen
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Download PDF */}
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="p-4 rounded-2xl border border-slate-800 hover:border-indigo-500 bg-[#0B1120] hover:bg-indigo-950/30 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Dokumen PDF Resmi</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Tabel siap cetak & evaluasi visual
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Unduh PDF</span>
                      <Download className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Download Excel */}
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="p-4 rounded-2xl border border-slate-800 hover:border-emerald-500 bg-[#0B1120] hover:bg-emerald-950/30 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 group-hover:scale-105 transition-transform">
                        <Table className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Spreadsheet Excel (.xlsx)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Multi-sheet transaksi & analisis angka
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Unduh Excel</span>
                      <Download className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL SYSTEM BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B1120] rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Cadangan Aman & Terenkripsi Lokal
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Unduh seluruh database aplikasi (semua bulan yang pernah dicatat, target impian, pos anggaran, dan riwayat transaksi) ke dalam 1 file JSON cadangan.
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                  <span>Jumlah Bulan Tersimpan:</span>
                  <span className="font-bold text-white">{availableMonths.length} Bulan</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Jumlah Target Impian:</span>
                  <span className="font-bold text-white">{financialGoals.length} Target</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportFullJSON}
                className="w-full p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-950/60 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Unduh File Cadangan Lengkap (.json)
              </button>
            </div>
          )}

          {/* TAB 3: IMPORT & RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* Opsi 1: Pulihkan Backup Lengkap */}
              <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Pulihkan Seluruh Data dari File Backup (.json)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Gunakan file cadangan .json yang sebelumnya diunduh
                    </p>
                  </div>
                </div>

                <label className="block w-full cursor-pointer">
                  <div className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-500/60 hover:bg-indigo-950/30 text-indigo-300 font-bold text-xs text-center transition-all flex items-center justify-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Backup JSON
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSONFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Opsi 2: Unggah Spreadsheet Excel Transaksi */}
              <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Impor Transaksi dari File Excel (.xlsx / .csv)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Kolom yang dibutuhkan: Tanggal, Kategori, Keterangan, Nominal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Target Bulan Impor:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-[#111C30] border border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-white"
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="block w-full cursor-pointer">
                  <div className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/60 hover:bg-emerald-950/30 text-emerald-300 font-bold text-xs text-center transition-all flex items-center justify-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Excel / CSV
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcelFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
