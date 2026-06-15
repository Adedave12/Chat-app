const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : "";

    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            message: "Authentication required",
            error: true
        });
    }

    const user = await getUserDetailsFromToken(token);

    if (user.logout) {
      return res.status(401).json({
          message: "Session expired",
          error: true
      });
    }

    req.userId = user._id.toString();
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error during authentication",
      error: true,
    });
  }
};

module.exports = authMiddleware;
