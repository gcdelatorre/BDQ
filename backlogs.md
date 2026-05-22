4. Data Filtering, Pagination & Logs
Global Filtering: Implement robust data filtering capabilities across all tabular list views.

Inventory Management: Add specific search and multi-attribute filters to the item inventory page.

Audit Logs: Integrate strict server-side pagination alongside date, user, and action type filters.

Vaccine Recall Page: Standardize the layout to match global UI guidelines and integrate pagination for active/past recalls.

Ensure filtering and pagination working on each pages that contains

5. Patient Profiles & Scope Cleanup
Profile Synchronization Bug: Fix data reactive state errors in the Full Patient Profile view. Fields like certification_status and related metadata must instantly sync and persist with the backend database upon updating.

De-scoping Requirement: Completely remove the Maternal Immunization module, including its associated database schemas, UI routes, and navigation items.

7. fix seeders, store the real dummy datas, fix medicine seeders
