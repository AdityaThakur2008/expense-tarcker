import { verifyAccessToken } from "../utils/jwt.utils.js";

export const authMiddleware = (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.user = {
      id: payload.userId,
      email: payload.email,
    };
     return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired access token." });
  }
};
