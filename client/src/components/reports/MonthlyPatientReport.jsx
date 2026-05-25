import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import ReportHeader from './ReportHeader';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', flexDirection: 'column' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: 5, marginBottom: 5, textTransform: 'uppercase', color: '#334155' },
  table: { display: 'table', width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 5 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', padding: 4, alignItems: 'center' },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, borderColor: '#e2e8f0', padding: 4, alignItems: 'center' },
  tableCellHeader: { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', color: '#475569' },
  tableCell: { fontSize: 7, color: '#1e293b' },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  summaryCard: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 5, backgroundColor: '#f8fafc', alignItems: 'center' },
  summaryLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  summaryValue: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' }
});

const MonthlyPatientReport = ({ stats, patients = [], month, year }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <ReportHeader title={`Monthly Patient Health Summary: ${month}/${year}`} />

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Total Patients</Text><Text style={styles.summaryValue}>{stats.totalPatients || 0}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>FIC Rate</Text><Text style={styles.summaryValue}>{stats.ficCount || 0}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Normal Nutrition</Text><Text style={styles.summaryValue}>{stats.normalNutrition || 0}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Excl. Breastfeeding</Text><Text style={styles.summaryValue}>{stats.exclusiveBFCount || 0}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Detail List</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>Name</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>FSN</Text></View>
            <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={styles.tableCellHeader}>Age</Text></View>
            <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>Mother</Text></View>
            <View style={[styles.tableColHeader, { width: '12%' }]}><Text style={styles.tableCellHeader}>Status</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>FIC</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>Excl. BF</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>Contact</Text></View>
          </View>
          {patients.map((p, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{p.first_name} {p.last_name}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{p.family_serial_number}</Text></View>
              <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{p.age_months}m</Text></View>
              <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{p.mother_complete_name}</Text></View>
              <View style={[styles.tableCol, { width: '12%' }]}><Text style={styles.tableCell}>{p.latest_status}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{p.is_fic ? 'Yes' : 'No'}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{p.exclusive_bf}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{p.contact_number}</Text></View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default MonthlyPatientReport;
