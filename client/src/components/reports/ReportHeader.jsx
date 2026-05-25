import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  republicText: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  departmentText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  regionText: {
    fontSize: 9,
    marginBottom: 2,
  },
  officeText: {
    fontSize: 12,
    fontWeight: 'black',
    marginTop: 5,
    textTransform: 'uppercase',
    color: '#0d9488', // teal-600
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

const ReportHeader = ({ title }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.republicText}>Republic of the Philippines</Text>
    <Text style={styles.departmentText}>Department of Health</Text>
    <Text style={styles.officeText}>Barangay Santa Cruz Health Center</Text>
    {title && <Text style={styles.reportTitle}>{title}</Text>}
  </View>
);

export default ReportHeader;
