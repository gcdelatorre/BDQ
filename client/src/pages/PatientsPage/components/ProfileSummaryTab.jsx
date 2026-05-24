import {
  GenderFemale,
  Baby,
  Drop,
  CheckCircle,
  X,
  Notebook,
  NotePencil
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/card";
import {
  ProfileCard,
  ProfileField,
  ProfileFieldGrid
} from "@/components/patient/profile-ui";

import { useState, useEffect } from "react";

export default function ProfileSummaryTab({ patient, formatDate, onUpdate }) {
  const [remarks, setRemarks] = useState(patient.remarks || "");

  useEffect(() => {
    setRemarks(patient.remarks || "");
  }, [patient.remarks]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="flex flex-col gap-6">
        <ProfileCard title="Family Information" icon={GenderFemale}>
          <ProfileField label="Mother's Full Name">
            {patient.mother_complete_name}
          </ProfileField>
          <ProfileField label="Contact Number">
            <span className={!patient.contact_number ? "text-amber-600" : undefined}>
              {patient.contact_number || "Not provided"}
            </span>
          </ProfileField>
          <ProfileField label="Home Address">
            <span className="font-bold text-slate-700 leading-relaxed">
              {patient.complete_address}
            </span>
          </ProfileField>
        </ProfileCard>

        <ProfileCard title="Birth Records" icon={Baby}>
          <ProfileFieldGrid cols={2}>
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="field-label">Weight (kg)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{patient.weight_at_birth_kg}</p>
              <span
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase mt-2 inline-block border",
                  patient.birth_weight_status === "Normal"
                    ? "bg-teal-50 text-teal-700 border-teal-100"
                    : patient.birth_weight_status === "Underweight"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : patient.birth_weight_status === "Overweight"
                    ? "bg-orange-50 text-orange-700 border-orange-100"
                    : "bg-purple-50 text-purple-700 border-purple-100"
                )}
              >
                {patient.birth_weight_status}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="field-label">Length (cm)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{patient.length_at_birth_cm}</p>
            </div>
          </ProfileFieldGrid>
        </ProfileCard>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <ProfileCard title="Nutritional Milestones" icon={Drop}>
            <ProfileFieldGrid cols={3} className="gap-5">
              <ProfileField label="Breastfeeding Initiated">
                <p className="font-bold text-slate-700">
                  {patient.initiated_breastfeeding_date ? formatDate(patient.initiated_breastfeeding_date) : "No record yet"}
                </p>
              </ProfileField>
              <ProfileField label="Exclusively Breastfed (6 mo)">
                <div className="flex items-center gap-2">
                  {patient.exclusively_breastfed_6_months === "Yes" ? (
                    <>
                      <CheckCircle size={18} weight="fill" className="text-teal-500 shrink-0" />
                      <span className="font-bold text-slate-700">YES</span>
                    </>
                  ) : patient.exclusively_breastfed_6_months === "No" ? (
                    <>
                      <X size={18} weight="bold" className="text-rose-500 shrink-0" />
                      <span className="font-bold text-slate-700">NO</span>
                    </>
                  ) : (
                    <span className="font-bold text-slate-700">No record yet</span>
                  )}
                </div>
              </ProfileField>
              <ProfileField label="Complementary Foods">
                <div className="flex items-center gap-2">
                  {patient.intro_complementary_foods === "Yes" ? (
                    <CheckCircle size={18} weight="fill" className="text-teal-500 shrink-0" />
                  ) : (
                    <X size={18} weight="bold" className={patient.intro_complementary_foods === "No" ? "text-rose-500" : "text-slate-300"} />
                  )}
                  <select
                    className="bg-transparent border-none outline-none uppercase font-bold text-slate-700 cursor-pointer text-sm"
                    value={patient.intro_complementary_foods || ""}
                    onChange={(e) => onUpdate('intro_complementary_foods', e.target.value)}
                  >
                    <option value="">No record yet</option>
                    <option value="Yes">YES</option>
                    <option value="No">NO</option>
                  </select>
                </div>
              </ProfileField>
            </ProfileFieldGrid>
        </ProfileCard>

        <ProfileCard title="Certification Status" icon={CheckCircle}>
            <ProfileFieldGrid cols={2}>
              <div
                className={cn(
                  "p-5 rounded-xl border",
                  patient.fic_date ? "bg-teal-50/40 border-teal-100" : "bg-slate-50 border-slate-100"
                )}
              >
                <p className="field-label">FIC (Fully Immunized Child)</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className={cn("font-bold text-lg", patient.fic_date ? "text-slate-900" : "text-slate-400")}>
                    {patient.fic_date ? formatDate(patient.fic_date) : "Pending Completion"}
                  </p>
                  {patient.fic_date && <CheckCircle size={22} weight="fill" className="text-teal-500 shrink-0" />}
                </div>
              </div>
              <div
                className={cn(
                  "p-5 rounded-xl border",
                  patient.cic_date ? "bg-blue-50/40 border-blue-100" : "bg-slate-50 border-slate-100"
                )}
              >
                <p className="field-label">CIC (Completely Immunized Child)</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className={cn("font-bold text-lg", patient.cic_date ? "text-slate-900" : "text-slate-400")}>
                    {patient.cic_date ? formatDate(patient.cic_date) : "No record yet"}
                  </p>
                  {patient.cic_date && <CheckCircle size={22} weight="fill" className="text-blue-500 shrink-0" />}
                </div>
              </div>
            </ProfileFieldGrid>
        </ProfileCard>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
            <Notebook size={120} weight="bold" />
          </div>
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <NotePencil size={18} weight="duotone" className="text-teal-600" />
              <p className="field-label mb-0">Clinical Remarks</p>
            </div>
            <textarea
              className="w-full bg-transparent outline-none resize-none text-sm text-slate-600 leading-relaxed font-medium"
              rows={3}
              placeholder="Add clinical remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              onBlur={() => patient.remarks !== remarks && onUpdate('remarks', remarks)}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
