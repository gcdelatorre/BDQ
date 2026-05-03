# 📦 BDQ SYSTEM - Child Health Monitoring Workflow

This document outlines the core workflows and database operations for the Barangay Health Center Child Health Monitoring System.

---

# 1️⃣ User Login Scenario

### Steps
1. Nurse/Midwife opens system.
2. Inputs **Username + Password**.
3. System validates credentials.

### Database involved
- `user`

### System actions
- Check `username`
- Compare `password_hash`
- Verify `account_status = Active`

### Result
User is redirected to: **Dashboard**

### Audit Log
`User logged in` -> Saved in: `audit_log`

---

# 2️⃣ Patient Registration (Child Only)

### Scenario
Mother brings baby for registration and health monitoring.

### Steps
1. Nurse opens **Patients Page**
2. Clicks **Register Child**
3. Inputs child health information (FSN, Birth data, etc.)
4. Clicks **Save**

### Data stored
Table: `child_patient`

### Important Fields
- `registered_by_user_id`: Records who registered the child.
- `family_serial_number`: Used for family grouping.
- `birth_weight_status`: (Low, Normal, Unknown).

### Audit Log
`User registered new child patient` -> Saved in: `audit_log`

---

# 3️⃣ Child Immunization Recording

### Scenario
Child receives a vaccine dose.

### Steps
1. Nurse opens **Child Patient Profile**
2. Clicks **Immunization Tab**
3. Clicks **Add Vaccine Record**

### Data stored
Table: `child_immunization_record`

### Fields
- `child_id`
- `vaccine_type`
- `dose_number`
- `date_administered`
- `administered_by_user_id`

### Audit Log
`User added immunization record`

---

# 4️⃣ Nutritional Assessment

### Scenario
Midwife measures child's weight and height for growth monitoring.

### Steps
1. Open **Child Profile**
2. Go to **Nutrition Tab**
3. Add Assessment (Length, Weight, Age in Months)

### Data stored
Table: `nutritional_assessment`

### Status Logic
System calculates/stores `nutritional_status`:
- Underweight
- Stunted
- Wasted
- Obese
- Normal

---

# 5️⃣ Supplementation Record

### Scenario
Child receives Vitamin A, Iron, or MNP.

### Steps
1. Open **Child Profile**
2. Go to **Supplementation Tab**
3. Record supplement given.

### Data stored
Table: `supplementation_record`

---

# 6️⃣ Breastfeeding Monitoring

### Scenario
Midwife checks exclusive breastfeeding status at specific age checkpoints.

### Steps
1. Open **Child Profile**
2. Go to **Breastfeeding Checkpoint**
3. Record status (Yes/No) for target age.

### Data stored
Table: `breastfeeding_checkpoint`

---

# 7️⃣ Medicine Inventory Management

### Scenario
Health center receives or updates medicine supply.

### Steps
1. Admin opens **Inventory Page**
2. Adds new medicine or batch.

### Data stored
Tables: `medicine`, `inventory`

### Audit Log
`User added new inventory batch`

---

# 8️⃣ Dispensing Medicine to Child

### Scenario
Child is prescribed/given medicine (Vitamins, Paracetamol Syrup, etc.).

### Steps
1. Nurse opens **Dispense Page**
2. Selects **Child Patient**
3. Adds medicines and dosages.
4. Saves transaction.

### Transaction Logic
1. Create `dispensing_transaction` linked to `child_id`.
2. Add line items to `dispensed_medicine`.
3. **Automatically decrease** `inventory.quantity_in_stock`.

### Audit Log
`User dispensed medicines to child`

---

# 9️⃣ Reporting & Analytics

### Scenario
Generating pediatric health reports.

### Examples
- **Patient Reports**: Total registered children, Age distribution.
- **Immunization Reports**: FIC (Fully Immunized Children), CIC (Completely Immunized Children).
- **Nutrition Reports**: List of Malnourished/Underweight children.
- **Inventory Reports**: Low stock syrup, Expiring supplements.

---

# 🔟 Audit Log Monitoring

### Scenario
Admin checks system activity for accountability.

### Data
Table: `audit_log`

---

# 🧠 System Workflow Summary

```
LOGIN
   ↓
DASHBOARD (Pediatric Overview)
   ↓
CHILD REGISTRATION
   ↓
CHILD HEALTH RECORDS (Imm / Nutri / Supp / BF)
   ↓
MEDICINE INVENTORY
   ↓
DISPENSING TO CHILD
   ↓
INVENTORY AUTO-REDUCE
   ↓
REPORTS & AUDIT
```

✅ **Note**: The system is exclusively for **Child Health Monitoring**. Adult patient workflows are not supported.