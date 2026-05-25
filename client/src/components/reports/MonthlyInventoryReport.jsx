import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import ReportHeader from './ReportHeader';

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
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#475569',
  },
  tableCell: {
    fontSize: 8,
    color: '#1e293b',
  },
  lowStock: {
    color: '#e11d48', // rose-600
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 5,
    backgroundColor: '#f8fafc',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  }
});

const formatDate = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const MonthlyInventoryReport = ({ medicines = [], history = [] }) => {
  const lowStockCount = medicines.filter(m => Number(m.total_stock) <= Number(m.reorder_level)).length;
  const totalItemsDispensed = history.reduce((acc, curr) => acc + (curr.quantity_dispensed || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Monthly Inventory & Dispensing Report" />

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Catalog Items</Text>
            <Text style={styles.summaryValue}>{medicines.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Low Stock Alerts</Text>
            <Text style={[styles.summaryValue, lowStockCount > 0 && styles.lowStock]}>{lowStockCount}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Recent Transactions</Text>
            <Text style={styles.summaryValue}>{history.length}</Text>
          </View>
        </View>

        {/* Stock Status Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Stock Levels</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Medicine Name</Text></View>
              <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>Category</Text></View>
              <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>In Stock</Text></View>
              <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>Status</Text></View>
            </View>
            {medicines.map((med, index) => {
              const isLow = Number(med.total_stock) <= Number(med.reorder_level);
              return (
                <View style={styles.tableRow} key={index}>
                  <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{med.medicine_name}</Text></View>
                  <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{med.medicine_category}</Text></View>
                  <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{med.total_stock} {med.unit_of_measure}</Text></View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={[styles.tableCell, isLow && styles.lowStock]}>
                      {isLow ? 'LOW STOCK' : 'NORMAL'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Dispensing Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Dispensing Activity</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>Date</Text></View>
              <View style={[styles.tableColHeader, { width: '35%' }]}><Text style={styles.tableCellHeader}>Patient</Text></View>
              <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Dispensed By</Text></View>
            </View>
            {history.slice(0, 15).map((log, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{formatDate(log.transaction_date)}</Text></View>
                <View style={[styles.tableCol, { width: '35%' }]}><Text style={styles.tableCell}>{log.patient_first} {log.patient_last}</Text></View>
                <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>Nurse {log.nurse_last}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 30, alignItems: 'flex-end' }}>
          <View style={{ width: 200, borderTopWidth: 1, paddingTop: 5, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Barangay Health Nurse</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Certified Correct</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MonthlyInventoryReport;
