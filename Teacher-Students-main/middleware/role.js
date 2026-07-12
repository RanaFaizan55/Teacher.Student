

export const roleCheck = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.json({ message: "User not found in request" });
        }
        if (!roles.includes(req.user.role)) {
            return res.json({
                success: false,
                message: "Access denied. You don't have permission"
            });
        }
        next();
    };
};