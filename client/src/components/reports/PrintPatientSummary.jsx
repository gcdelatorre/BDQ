import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Printer, Spinner, Calendar } from '@phosphor-icons/react';
import MonthlyPatientReport from './MonthlyPatientReport';
import reportingService from '@/services/reportingService';
import { useToast } from '@/hooks/useToast';

const PrintPatientSummary = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportingService.getMonthlySummary(month, year);
      setReportData(data);
      toast.success("Ready", "Patient summary report prepared.");
    } catch {
      toast.error("Error", "Could not fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  if (!reportData) {
    return (
      <div className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-3">
          <Calendar size={18} className="text-slate-400" />
          <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} className="w-12 text-sm font-bold bg-transparent outline-none" min="1" max="12" />
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-16 text-sm font-bold bg-transparent outline-none" />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold shadow-sm hover:bg-teal-700 transition-all text-[11px] uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? <Spinner size={16} className="animate-spin" /> : <Printer size={16} />}
          {loading ? "..." : "Load Data"}
        </button>
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={<MonthlyPatientReport stats={reportData.stats} patients={reportData.patients} month={month} year={year} />}
      fileName={`PatientSummary_${year}_${month}.pdf`}
      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold shadow-sm hover:bg-teal-700 transition-all text-[11px] uppercase tracking-widest"
    >
      <Printer size={16} /> Download PDF
    </PDFDownloadLink>
  );
};

export default PrintPatientSummary;
