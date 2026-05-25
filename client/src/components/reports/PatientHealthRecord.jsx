import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import ReportHeader from './ReportHeader';

// Register fonts if needed, but standard fonts are available
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    padding: 5,
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#1e293b',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#475569',
  },
  tableCell: {
    fontSize: 9,
    color: '#1e293b',
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 5,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  }
});

const formatDate = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const PatientHealthRecord = ({ patient, immunizations = [], nutritions = [], supplements = [], breastfeeding = [] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <ReportHeader title="Child Health Record" />

      {/* Patient Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Patient Name:</Text>
          <Text style={styles.value}>{patient.first_name} {patient.middle_initial}. {patient.last_name}</Text>
          <Text style={styles.label}>Sex:</Text>
          <Text style={styles.value}>{patient.sex === 'M' ? 'Male' : 'Female'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{formatDate(patient.date_of_birth)}</Text>
          <Text style={styles.label}>FSN:</Text>
          <Text style={styles.value}>{patient.family_serial_number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mother's Name:</Text>
          <Text style={styles.value}>{patient.mother_complete_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{patient.complete_address}</Text>
        </View>
      </View>

      {/* Immunization History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Immunization History</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Vaccine Type</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Dose</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Date Given</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Remarks</Text></View>
          </View>
          {immunizations.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}><Text style={styles.tableCell}>No records found.</Text></View>
            </View>
          ) : (
            immunizations.map((imm, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{imm.vaccine_type}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Dose {imm.dose_number}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(imm.date_administered)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{imm.remarks || '---'}</Text></View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Nutritional Assessments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Growth Monitoring</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Age (Mo)</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Weight (kg)</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Height (cm)</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Status</Text></View>
          </View>
          {nutritions.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}><Text style={styles.tableCell}>No records found.</Text></View>
            </View>
          ) : (
            nutritions.map((nut, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{nut.age_in_months_at_assessment}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{nut.weight_kg}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{nut.length_cm}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{nut.nutritional_status}</Text></View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Supplementation Log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supplementation Log</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Supplement</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Target Age</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Date Given</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Remarks</Text></View>
          </View>
          {supplements.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}><Text style={styles.tableCell}>No records found.</Text></View>
            </View>
          ) : (
            supplements.map((sup, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{sup.supplement_type}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{sup.target_age_months} Mo</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(sup.date_given)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{sup.remarks || '---'}</Text></View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Breastfeeding Checkpoint */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Breastfeeding Checkpoint</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '30%' }]}><Text style={styles.tableCellHeader}>Target Age (Mo)</Text></View>
            <View style={[styles.tableColHeader, { width: '30%' }]}><Text style={styles.tableCellHeader}>Exclusively BF</Text></View>
            <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Check Date</Text></View>
          </View>
          {breastfeeding.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}><Text style={styles.tableCell}>No records found.</Text></View>
            </View>
          ) : (
            breastfeeding.map((bf, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>{bf.age_month_target} Mo</Text></View>
                <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>{bf.is_exclusively_breastfed}</Text></View>
                <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{formatDate(bf.check_date)}</Text></View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Signatures */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureName}>__________________________</Text>
          <Text style={styles.signatureLabel}>Nurse / Midwife Signature</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureName}>__________________________</Text>
          <Text style={styles.signatureLabel}>Date Generated</Text>
          <Text style={styles.tableCell}>{formatDate(new Date())}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 20, textAlign: 'center' }}>
        This is an official document generated by the BDQ Child Health Monitoring System.
      </Text>
    </Page>
  </Document>
);

export default PatientHealthRecord;
