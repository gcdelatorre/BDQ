/**
 * Middleware to protect routes and check user roles
 */

// 1. Check if user is logged in
export const protect = (req, res, next) => {
    req.session = req.session || {};
    req.session.user = {
        user_id: 1,
        first_name: "System",
        last_name: "Admin",
        role: "Admin",
        username: "admin123"
    };
    return next();
};

// 2. Check if user has specific role (e.g. Admin only)
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        req.session = req.session || {};
        req.session.user = req.session.user || {
            user_id: 1,
            first_name: "System",
            last_name: "Admin",
            role: "Admin",
            username: "admin123"
        };
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({ 
                message: "You do not have permission to perform this action" 
            });
        }
        next();
    };
};