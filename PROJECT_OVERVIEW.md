# Project Overview: Barangay Health Kiosk System

This document provides a high-level overview of the Barangay Health Kiosk system. It is intended to help developers quickly understand the project's architecture, features, and technology stack.

## 1. Purpose

The application is a comprehensive health management system designed for a local barangay (community) health center. It focuses on pediatric care, enabling nurses and health workers to manage patient records, track immunizations, and handle pharmacy inventory and dispensing. The system aims to digitize records, improve data accuracy, and provide actionable insights for patient follow-ups.

## 2. Core Features

The application is divided into several key modules:

### a. Dashboard

The landing page after login, providing a snapshot of the health center's activities.

- **Key Metrics:** Displays statistics like total registered patients, dispensing records, and low-stock alerts.
- **Recent Activities:** A scrollable feed of recent user actions (logins, record creation, updates).
- **Recent Dispensing:** A list of the most recent medicine dispensing transactions.
- **Stock Alerts:** Highlights medicines that are low in stock or out of stock.
- **Upcoming Recalls:** Shows a list of patients who are due for vaccinations soon.

### b. Patient Management

This module handles the directory of all child patients.

- **Patient Registry (`PatientsPage.jsx`):**
  - A searchable and filterable data table of all registered children.
  - Implements a "One Family, One Serial Number" (FSN) architecture to group siblings.
  - Provides a modal (`RegisterChildModal.jsx`) to register new children, capturing basic info, family details, and birth statistics.

- **Patient Profile (`PatientProfile.jsx`):**
  - A detailed view for each patient, accessed from the registry.
  - The profile is organized into several tabs for different clinical records.

### c. Clinical Record Tabs (within Patient Profile)

- **Full Profile / Summary (`ProfileSummaryTab.jsx`):** Displays a summary of family information, birth records, and certification status (FIC/CIC).
- **Child Immunization (`ImmunizationTab.jsx`):**
  - An interactive checklist for the national Expanded Program on Immunization (EPI).
  - It calculates and displays the status of each vaccine dose (Recorded, Due, Overdue, Upcoming) based on the child's date of birth.
  - Allows nurses to record, edit, or delete vaccination records.
- **Nutritional Assessment (`NutritionalTab.jsx`):** Tracks the child's growth by recording weight and height at different assessment periods.
- **Supplementation (`SupplementationTab.jsx`):** Logs the administration of supplements like Vitamin A, Iron, and MNP.
- **Breastfeeding (`BreastfeedingTab.jsx`):** Monitors exclusive breastfeeding milestones.
- **Medicine Logs (`DispensingLogsTab.jsx`):** Shows a complete history of all medications dispensed to the patient.

### d. Pharmacy & Inventory

- **Medicine Dispensing (`PharmacyPage.jsx`):**
  - A three-step workflow:
    1.  **Select Patient:** Search and select a patient from a scalable catalog.
    2.  **Add Medicines:** Browse the medicine catalog and add items to a dispensing cart.
    3.  **Review & Dispense:** Add notes, review the cart, and confirm the transaction.
  - Stock levels are updated automatically upon dispensing.
  - A "History" button opens a modal (`DispensingHistoryModal.jsx`) to view all recent dispensing transactions across all patients.

- **Inventory Management (`InventoryPage.jsx`):**
  - A grid-based view of all medicines in the master catalog.
  - Each card shows the medicine name, total stock, and a visual indicator for stock level (optimal or low).
  - Provides modals to:
    1.  **Register a new medicine** to the master list.
    2.  **Add a new batch** for an existing medicine, recording quantity, expiration date, and supplier.

### e. Insights & Auditing

- **Vaccine Recall (`VaccineRecallPage.jsx`):**
  - A dedicated page that lists all patients who are due or overdue for vaccinations.
  - Cards provide contact information for the mother/guardian to facilitate follow-ups.
  - Includes filtering by status (All, Overdue, Upcoming) and a special "Tomorrow's Call List" modal.

- **Audit Logs (`AuditLogsPage.jsx`):**
  - A comprehensive log of all actions performed within the system for accountability.
  - Features server-side pagination and filtering by date, user, and action type.

## 3. Technology Stack

- **Frontend Framework:** React.js
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with `clsx` (via `cn` utility) for conditional classes.
- **UI Components:**
  - Custom, reusable components found in `src/components/ui`.
  - Icons provided by `@phosphor-icons/react`.
- **Animation:** `framer-motion` for UI animations and page transitions.
- **State Management:** Primarily React Hooks (`useState`, `useEffect`, `useContext`). `AuthContext` is used for managing user authentication state.
- **Services:** API interactions are abstracted into service modules (`patientService`, `pharmacyService`, etc.) which likely use `axios` or `fetch`.
- **Notifications:** `sonner` is used for toast notifications.

## 4. Project Architecture

- **Component-Based Structure:** The application follows a standard React component structure, separating pages, reusable components, services, hooks, and contexts.
- **Page-Based Routing:** `react-router-dom` is used for routing, with protected routes to ensure only authenticated users can access the main application.
- **Service Layer:** Data fetching and mutations are handled in a dedicated `services` directory. This decouples the UI from the data logic and makes API management cleaner.
- **Global Layout:** A consistent layout is enforced by the `Layout.jsx` component, which includes a `Sidebar` for navigation and a `Header`.
- **Backlog-Driven Development:** The `backlogs.md` file indicates that development is guided by a clear list of features and bug fixes, such as implementing the FSN, UI consistency, and removing the Maternal Immunization module.

This overview should provide a solid foundation for any developer joining the project. For more specific details, please refer to the code within the respective feature directories.