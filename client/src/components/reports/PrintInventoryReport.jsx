import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Printer, Spinner } from '@phosphor-icons/react';
import MonthlyInventoryReport from './MonthlyInventoryReport';
import pharmacyService from '@/services/pharmacyService';
import { useToast } from '@/hooks/useToast';

const PrintInventoryReport = () => {
  const [data, setData] = useState({
    medicines: [],
    history: [],
  });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [meds, hist] = await Promise.all([
        pharmacyService.getAllMedicines(),
        pharmacyService.getDispensingHistory(100), // Get recent 100 transactions for the report
      ]);

      setData({
        medicines: meds || [],
        history: hist || [],
      });
      setReady(true);
      toast.success("Report Ready", "Inventory data has been prepared.");
    } catch (error) {
      console.error("Failed to fetch inventory report:", error);
      toast.error("Error", "Could not generate inventory report.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <button
        onClick={fetchReportData}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest disabled:opacity-50"
      >
        {loading ? (
          <Spinner size={18} weight="bold" className="animate-spin" />
        ) : (
          <Printer size={18} weight="bold" />
        )}
        {loading ? "Preparing..." : "Inventory Report"}
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <MonthlyInventoryReport
          medicines={data.medicines}
          history={data.history}
        />
      }
      fileName={`InventoryReport_${new Date().toISOString().split('T')[0]}.pdf`}
      className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 transition-all text-[11px] uppercase tracking-widest"
    >
      {({ blob, url, loading: pdfLoading, error }) => (
        <>
          <Printer size={18} weight="bold" />
          {pdfLoading ? "Generating..." : "Download Report"}
        </>
      )}
    </PDFDownloadLink>
  );
};

export default PrintInventoryReport;
