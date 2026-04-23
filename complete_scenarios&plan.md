eto yung mga workflow or, flow sa system mismo, or flow kung saan papunta ang datas on each action.

---

# 1️⃣ User Login Scenario

### Steps

1. Nurse/Midwife opens system.
2. Inputs **Username + Password**.
3. System validates credentials.

### Database involved

- `USER`

### System actions

- Check `username`
- Compare `password_hash`
- Verify `account_status = Active`

### Result

User is redirected to:

**Dashboard**

### Audit Log

```
User logged in
```

Saved in:

`AUDIT_LOG`

---

# 2️⃣ Patient Registration (Adult)

### Scenario

A patient arrives at the health center and has no record yet.

### Steps

1. Nurse opens **Patients Page**
2. Clicks **Register Adult Patient**
3. Inputs patient details
4. Clicks **Save**

### Data stored

Table:

`ADULT_PATIENT`

Example stored fields:

- First name
- Last name
- Birth date
- Civil status
- Contact
- Address
- Allergies
- Medical conditions

### Important field

```
registered_by_user_id
```

This records **who registered the patient**.

### Audit Log

```
User registered new adult patient
```

Saved in:

`AUDIT_LOG`

---

# 3️⃣ Patient Registration (Child)

### Scenario

Mother brings baby for immunization.

### Steps

1. Nurse opens **Patients Page**
2. Clicks **Register Child**
3. Inputs child health information.

### Data stored

Table:

`CHILD_PATIENT`

Important fields include:

- Family Serial Number
- Birth Weight
- Breastfeeding start
- Mother name
- Address

### Audit Log

```
User registered new child patient
```

---

# 4️⃣ Child Immunization Recording

### Scenario

Child receives vaccine.

### Steps

1. Nurse opens **Child Patient Profile**
2. Clicks **Immunization Tab**
3. Clicks **Add Vaccine Record**

### Data stored

Table:

`CHILD_IMMUNIZATION_RECORD`

Fields stored:

- `Child_ID`
- `Vaccine_Type`
- `Dose_Number`
- `Date_Administered`
- `Administered_By_User_ID`

### Audit Log

```
User added immunization record
```

---

# 5️⃣ Maternal Immunization Tracking

### Scenario

Tracking maternal tetanus vaccination related to the child.

### Steps

1. Open **Child Profile**
2. Go to **Maternal Immunization Tab**
3. Record TT2 / TT3 / TT4 / TT5

### Data stored

Table:

`MATERNAL_IMMUNIZATION`

Fields:

- `Child_ID`
- TT2_Td2_Date
- TT3_Date
- TT4_Date
- TT5_Date

---

# 6️⃣ Nutritional Assessment Scenario

### Scenario

Midwife measures baby's weight and height.

### Steps

1. Open **Child Profile**
2. Go to **Nutrition Tab**
3. Add Assessment

### Data stored

Table:

`NUTRITIONAL_ASSESSMENT`

Fields:

- Length
- Weight
- Age in months
- Nutritional status

Example statuses:

- Underweight
- Stunted
- Normal

---

# 7️⃣ Supplementation Scenario

### Scenario

Child receives Vitamin A or Iron.

### Steps

1. Open **Child Profile**
2. Go to **Supplementation Tab**
3. Record supplement

### Data stored

Table:

`SUPPLEMENTATION_RECORD`

Fields:

- Supplement type
- Target age
- Date given

---

# 8️⃣ Breastfeeding Monitoring Scenario

### Scenario

Midwife checks if child is exclusively breastfed.

### Steps

1. Open **Child Profile**
2. Go to **Breastfeeding Checkpoint**
3. Record checkpoint

### Data stored

Table:

`BREASTFEEDING_CHECKPOINT`

Fields:

- Age target
- Check date
- Breastfeeding status

---

# 9️⃣ Medicine Inventory Management

### Scenario

Health center receives new medicine supply.

### Steps

1. Admin opens **Medicine Inventory Page**
2. Clicks **Add Stock**
3. Inputs details

### Data stored

Tables involved

`MEDICINE`

`INVENTORY`

Fields stored

- Medicine name
- Batch number
- Quantity
- Expiration date
- Supplier

### Audit Log

```
User added new inventory batch
```

---

# 🔟 Dispensing Medicine to Patient

### Scenario

Patient is given medicines after consultation.

### Steps

1. Nurse opens **Dispense Medicine Page**
2. Selects patient
3. Adds medicines
4. Clicks **Save Transaction**

### Step 1 — Create transaction

Stored in:

`DISPENSING_TRANSACTION`

Fields:

- `User_ID`
- `Adult_Patient_ID` or `Child_ID`
- Date
- Notes

---

### Step 2 — Store medicines

Stored in:

`DISPENSED_MEDICINE`

Fields:

- `Transaction_ID`
- `Medicine_ID`
- Quantity
- Dosage
- Duration

Example:

Transaction:

```
Transaction_ID = 1001
Patient = Juan
```

Medicines stored:

| Medicine | Qty |
| --- | --- |
| Paracetamol | 10 |
| Amoxicillin | 20 |

---

### Step 3 — Update inventory

`INVENTORY.quantity_in_stock` decreases.

---

### Audit Log

```
User dispensed medicines to patient
```

---

# 1️⃣1️⃣ Patient History Retrieval

### Scenario

Nurse wants to view patient medical history.

### Steps

1. Search patient
2. Open patient profile

System displays

- Patient info
- Dispensing history
- Immunizations
- Supplements
- Assessments

Tables queried

- `DISPENSING_TRANSACTION`
- `DISPENSED_MEDICINE`
- `CHILD_IMMUNIZATION_RECORD`
- `NUTRITIONAL_ASSESSMENT`

---

# 1️⃣2️⃣ Reporting & Analytics

### Scenario

Barangay needs monthly reports.

### Nurse/Admin opens:

**Reports Page**

Examples of reports:

### Patient Reports

- Total registered patients
- Child patients
- Adult patients

### Immunization Reports

- Fully immunized children
- Pending vaccinations

### Medicine Reports

- Most dispensed medicine
- Expiring medicines
- Low stock alerts

### Inventory Reports

- Current stock
- Batch tracking

Tables used

- `DISPENSING_TRANSACTION`
- `DISPENSED_MEDICINE`
- `INVENTORY`
- `MEDICINE`

---

# 1️⃣3️⃣ Audit Log Monitoring

### Scenario

Admin checks system activity.

### Steps

1. Open **Audit Log Page**
2. View activity history

Example logs

| User | Action |
| --- | --- |
| Nurse A | Registered patient |
| Nurse B | Dispensed medicine |
| Admin | Updated inventory |

Stored in:

`AUDIT_LOG`

---

# 🧠 Full System Workflow (Simplified)

```
LOGIN
   ↓
DASHBOARD
   ↓
PATIENT REGISTRATION
   ↓
CHILD HEALTH RECORDS
(Immunization / Nutrition / Supplements)
   ↓
MEDICINE INVENTORY
   ↓
DISPENSING TRANSACTION
   ↓
INVENTORY AUTOMATICALLY REDUCES
   ↓
PATIENT HISTORY TRACKING
   ↓
REPORTS & ANALYTICS
   ↓
AUDIT LOG MONITORING
```

---

# 💡 Important Observation

Your system actually combines **3 health systems into one**:

1️⃣ **Electronic Medical Record (EMR)**

2️⃣ **Child Health Monitoring System**

3️⃣ **Pharmacy Inventory System**

That’s why your **ERD is large but correct**.

---

✅ If you want, I can also show you the **complete UI page architecture (like 18 system pages)** so when you build the **frontend or present the system**, everything becomes **super clean and professional.**

# SQL QUERY COMMANDS

Below are the **main system scenarios** in your BDQ system and the **possible SQL queries executed when the user clicks submit/save**.

I’ll follow the **actual flow nurses/midwives will do in the system** and show the **INSERT / UPDATE operations**.

To keep data safe, these actions are usually wrapped in a **database transaction**:

```
BEGIN;
-- queries here
COMMIT;
```

---

# 1️⃣ User Login

### Scenario

User logs in to the system.

### Query – Validate credentials

```
SELECT user_id, password_hash,role, account_status
FROMuser
WHERE username='nurse_anna';
```

Application compares password hash.

---

### Insert Audit Log

```
INSERTINTO audit_log
(user_id, action_performed, target_table, target_record_id, action_timestamp, description)
VALUES
(5,'LOGIN','USER',5, NOW(),'User logged into the system');
```

---

# 2️⃣ Register Adult Patient

### Scenario

Nurse registers a new adult patient.

### Query

```
INSERTINTO adult_patient
(
registered_by_user_id,
registration_date,
first_name,
middle_name,
last_name,
sex,
date_of_birth,
civil_status,
contact_number,
address,
blood_type,
known_allergies,
medical_conditions,
remarks
)
VALUES
(
5,
CURRENT_DATE,
'Juan',
'Santos',
'Dela Cruz',
'Male',
'1985-05-10',
'Married',
'09123456789',
'Sabang Naga City',
'O+',
'None',
'Hypertension',
'Regular patient'
);
```

---

### Audit Log

```
INSERTINTO audit_log
(user_id, action_performed, target_table, target_record_id, action_timestamp, description)
VALUES
(5,'CREATE','ADULT_PATIENT', LAST_INSERT_ID(), NOW(),'Registered new adult patient');
```

---

# 3️⃣ Register Child Patient

### Query

```
INSERTINTO child_patient
(
registered_by_user_id,
date_of_registration,
family_serial_number,
first_name,
middle_initial,
last_name,
sex,
date_of_birth,
mother_complete_name,
complete_address,
se_status,
length_at_birth_cm,
weight_at_birth_kg,
birth_weight_status,
initiated_breastfeeding_date,
exclusively_breastfed_up_to_6_months,
intro_to_complementary_foods,
remarks
)
VALUES
(
5,
CURRENT_DATE,
'FSN-102',
'Baby',
'A',
'Dela Cruz',
'Female',
'2024-06-10',
'Maria Dela Cruz',
'Sabang Naga City',
'NHTS',
49,
3.2,
'Normal',
'2024-06-10',
TRUE,
'2024-12-10',
'Healthy'
);
```

---

# 4️⃣ Record Child Immunization

### Query

```
INSERTINTO child_immunization_record
(
child_id,
vaccine_type,
dose_number,
date_administered,
administered_by_user_id,
remarks
)
VALUES
(
12,
'BCG',
1,
CURRENT_DATE,
5,
'Initial dose'
);
```

---

# 5️⃣ Record Nutritional Assessment

```
INSERTINTO nutritional_assessment
(
child_id,
assessment_period,
age_in_months_at_assessment,
length_cm,
length_date_taken,
weight_kg,
weight_date_taken,
nutritional_status,
assessed_by_user_id,
remarks
)
VALUES
(
12,
'6-11 months',
8,
68,
CURRENT_DATE,
7.2,
CURRENT_DATE,
'Normal',
5,
'Healthy growth'
);
```

---

# 6️⃣ Record Supplementation

```
INSERTINTO supplementation_record
(
child_id,
supplement_type,
target_age_months,
date_given,
administered_by_user_id,
remarks
)
VALUES
(
12,
'Vitamin A',
6,
CURRENT_DATE,
5,
'Routine supplementation'
);
```

---

# 7️⃣ Add Medicine (Admin)

### Scenario

Admin adds a new medicine to the system.

```
INSERTINTO medicine
(
medicine_name,
generic_name,
medicine_category,
unit_of_measure,
description,
reorder_level,
created_by_user_id,
created_at
)
VALUES
(
'Biogesic',
'Paracetamol',
'Tablet',
'Tablet',
'Pain reliever',
50,
1,
NOW()
);
```

---

# 8️⃣ Add Inventory Batch

```
INSERTINTO inventory
(
medicine_id,
batch_number,
quantity_in_stock,
expiration_date,
date_received,
supplier_name,
storage_location,
last_updated
)
VALUES
(
3,
'BATCH-2026-001',
500,
'2027-05-01',
CURRENT_DATE,
'DOH Supply',
'Cabinet A',
NOW()
);
```

---

# 9️⃣ Dispense Medicine (MOST IMPORTANT PART)

This happens when the nurse **submits the dispensing form**.

## Step 1 – Create Transaction

```
INSERTINTO dispensing_transaction
(
user_id,
adult_patient_id,
child_id,
transaction_date,
notes
)
VALUES
(
5,
22,
NULL,
NOW(),
'Fever treatment'
);
```

Assume the DB returns:

```
transaction_id = 1001
```

---

## Step 2 – Insert Dispensed Medicines

Example if **two medicines were given**.

```
INSERTINTO dispensed_medicine
(
transaction_id,
medicine_id,
quantity_dispensed,
dosage_instruction,
duration_days,
remarks
)
VALUES
(
1001,
3,
10,
'Take twice daily',
5,
'After meals'
);
```

---

```
INSERTINTO dispensed_medicine
(
transaction_id,
medicine_id,
quantity_dispensed,
dosage_instruction,
duration_days,
remarks
)
VALUES
(
1001,
7,
20,
'Take three times daily',
7,
'Finish all antibiotics'
);
```

---

## Step 3 – Reduce Inventory

```
UPDATE inventory
SET quantity_in_stock= quantity_in_stock-10,
last_updated= NOW()
WHERE medicine_id=3;
```

---

```
UPDATE inventory
SET quantity_in_stock= quantity_in_stock-20,
last_updated= NOW()
WHERE medicine_id=7;
```

---

# 🔟 Audit Log for Dispensing

```
INSERTINTO audit_log
(user_id, action_performed, target_table, target_record_id, action_timestamp, description)
VALUES
(5,'CREATE','DISPENSING_TRANSACTION',1001, NOW(),'Dispensed medicines to patient');
```

---

# 1️⃣1️⃣ Update Inventory (Manual Adjustment)

Example if admin edits stock.

```
UPDATE inventory
SET quantity_in_stock=300,
last_updated= NOW()
WHERE inventory_id=5;
```

---

# 1️⃣2️⃣ Generate Reports (Example Query)

### Most dispensed medicines

```
SELECT m.medicine_name, SUM(d.quantity_dispensed)AS total_dispensed
FROM dispensed_medicine d
JOIN medicine mON d.medicine_id= m.medicine_id
GROUPBY m.medicine_name
ORDERBY total_dispensedDESC;
```

---

# 1️⃣3️⃣ View Patient Medicine History

```
SELECT
dt.transaction_id,
dt.transaction_date,
m.medicine_name,
dm.quantity_dispensed,
dm.dosage_instruction
FROM dispensing_transaction dt
JOIN dispensed_medicine dm
ON dt.transaction_id= dm.transaction_id
JOIN medicine m
ON dm.medicine_id= m.medicine_id
WHERE dt.adult_patient_id=22;
```

---

# 🔵 Full System Submission Flow (Important)

When nurse clicks **Dispense Medicine**:

```
BEGIN;

INSERTINTO dispensing_transaction ...
RETURN transaction_id

INSERTINTO dispensed_medicine ...
INSERTINTO dispensed_medicine ...

UPDATE inventory ...
UPDATE inventory ...

INSERTINTO audit_log ...

COMMIT;
```

If something fails:

```
ROLLBACK;
```

---

✅ This covers the **complete SQL behavior for the BDQ system when forms are submitted**:

- patient registration
- child health monitoring
- medicine inventory
- dispensing medicines
- audit logs
- reports