const checkRole = (roles = []) => {
  return (req, res, next) => {
   
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized: No user role' });
    }

    const userRole = req.user.role;

    if (roles.length > 0 && !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports = {
  checkRole,
};  