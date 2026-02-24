const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have the required role.' 
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
