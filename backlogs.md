1. Family Serial Number (FSN): Implement a "One Family, One Serial Number" architecture. // DONE

2. Immunization View Record. // DONE
In our current system we dont have an identifier on which this vaccine belong or what should be taken.
So just update the UI by just simply putting an identifier there of which month or age group so the nurse know which to check.
{
  "BCG": {
    "doses": 1,
    "schedule": ["At birth"]
  },
  "Hepatitis_B": {
    "doses": 1,
    "schedule": ["At birth"]
  },
  "Pentavalent": {
    "doses": 3,
    "schedule": ["1.5 mos", "2.5 mos", "3.5 mos"]
  },
  "OPV": {
    "doses": 3,
    "schedule": ["1.5 mos", "2.5 mos", "3.5 mos"]
  },
  "IPV": {
    "doses": 2,
    "schedule": ["3.5 mos", "9 mos"]
  },
  "PCV": {
    "doses": 3,
    "schedule": ["1.5 mos", "2.5 mos", "3.5 mos"]
  },
  "MMR": {
    "doses": 2,
    "schedule": ["9 mos", "12 mos"]
  }
}

3. UI/UX Consistency & Scalability // DONE
Global UI Polish: Enforce a unified design system across all modules (consistent typography, button styles, padding, and color schemes).

Pharmacy Page Optimizations:

Medicine Catalog: Implement an independent scrollable container for inventory navigation.

Patient Catalog: Must be built for high scalability. Replace infinite loading with server-side virtual scrolling or explicit pagination to handle large datasets seamlessly.

Medicine Dispensing History: Add a dedicated "History" action button inside the Pharmacy view to open a logs panel or modal.

4. Data Filtering, Pagination & Logs
Global Filtering: Implement robust data filtering capabilities across all tabular list views.

Inventory Management: Add specific search and multi-attribute filters to the item inventory page.

Audit Logs: Integrate strict server-side pagination alongside date, user, and action type filters.

Vaccine Recall Page: Standardize the layout to match global UI guidelines and integrate pagination for active/past recalls.

Ensure filtering and pagination working on each pages that contains

5. Patient Profiles & Scope Cleanup
Profile Synchronization Bug: Fix data reactive state errors in the Full Patient Profile view. Fields like certification_status and related metadata must instantly sync and persist with the backend database upon updating.

De-scoping Requirement: Completely remove the Maternal Immunization module, including its associated database schemas, UI routes, and navigation items.

6. Customized Toast for our System. and make the Recent Activities Scrollable like the Recent Dispensing

7. fix seeders, store the real dummy datas, fix medicine seeders

8. npm sequelize