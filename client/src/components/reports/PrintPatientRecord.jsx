import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Printer, Spinner } from '@phosphor-icons/react';
import PatientHealthRecord from './PatientHealthRecord';
import clinicalService from '@/services/clinicalService';
import { useToast } from '@/hooks/useToast';

const PrintPatientRecord = ({ patient }) => {
  const [data, setData] = useState({
    immunizations: [],
    nutritions: [],
    supplements: [],
    breastfeeding: [],
  });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [imm, nut, sup, bf] = await Promise.all([
        clinicalService.getChildImmunizationRecords(patient.child_id),
        clinicalService.getNutritionHistory(patient.child_id),
        clinicalService.getSupplementHistory(patient.child_id),
        clinicalService.getBreastfeedingHistory(patient.child_id),
      ]);

      setData({
        immunizations: imm || [],
        nutritions: nut || [],
        supplements: sup || [],
        breastfeeding: bf || [],
      });
      setReady(true);
      toast.success("Ready to Print", "PDF document has been generated.");
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error("Error", "Could not prepare the print record.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <button
        onClick={fetchAllData}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-teal-600 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
      >
        {loading ? (
          <Spinner size={16} weight="bold" className="animate-spin" />
        ) : (
          <Printer size={16} weight="bold" />
        )}
        {loading ? "Preparing..." : "Print Official Record"}
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <PatientHealthRecord
          patient={patient}
          immunizations={data.immunizations}
          nutritions={data.nutritions}
          supplements={data.supplements}
          breastfeeding={data.breastfeeding}
        />
      }
      fileName={`HealthRecord_${patient.last_name}_${patient.child_id}.pdf`}
      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-xs uppercase tracking-widest"
    >
      {({ blob, url, loading: pdfLoading, error }) => (
        <>
          <Printer size={16} weight="bold" />
          {pdfLoading ? "Generating..." : "Download PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
};

export default PrintPatientRecord;
