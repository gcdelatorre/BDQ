import * as auditService from "../services/auditService.js";

/**
 * Reusable helper to log actions from any controller.
 * It automatically extracts the user_id from the session.
 */
export const log = async (req, action, table, recordId = null, description = null) => {
    try {
        const userId = req.session?.user?.user_id;
        
        if (!userId) {
            console.warn("Audit Log Warning: No user found in session for logging.");
        }

        await auditService.logAction({
            user_id: userId,
            action_performed: action,
            target_table: table,
            target_record_id: recordId,
            description: description
        });
    } catch (error) {
        // We handle errors here so the main controller logic doesn't crash
        console.error("Helper Log Error:", error);
    }
};
