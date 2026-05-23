/**
 * Middleware to protect routes and check user roles
 */

// 1. Check if user is logged in
export const protect = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            message: "You are not logged in! Please log in to get access."
        });
    }
    next();
};

// 2. Check if user has specific role (e.g. Admin only)
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                message: "You are not logged in! Please log in to get access."
            });
        }
        
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({ 
                message: "You do not have permission to perform this action" 
            });
        }
        next();
    };
};