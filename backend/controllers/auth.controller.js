import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import { generateAccessToken } from "../utils/jwt.utils.js";
import {
  validateLoginInput,
  validateSignupInput,
} from "../utils/validation.utils.js";

const COOKIE_SECURE =
  process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
const COOKIE_SAME_SITE =
  process.env.COOKIE_SAME_SITE ?? (COOKIE_SECURE ? "none" : "lax");
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAME_SITE,
  maxAge,
  path: "/",
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const validationError = validateSignupInput(name, email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(
      user._id,
      req.get("user-agent") || "unknown",
    );

    setAuthCookies(res, accessToken, refreshToken.token);

    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validationError = validateLoginInput(email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(
      user._id,
      req.get("user-agent") || "unknown",
    );

    setAuthCookies(res, accessToken, refreshToken.token);

    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenValue } = req.cookies;
    if (!refreshTokenValue) {
      return res.status(401).json({ message: "Refresh token is required." });
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshTokenValue,
    }).populate("userId");
    if (!storedToken || !storedToken.userId) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    if (storedToken.expiresAt < new Date()) {
      await storedToken.deleteOne();
      return res.status(401).json({ message: "Refresh token expired." });
    }

    const user = storedToken.userId;
    await storedToken.deleteOne();

    const newRefreshToken = await RefreshToken.createToken(
      user._id,
      req.get("user-agent") || "unknown",
    );
    const accessToken = generateAccessToken(user);
    setAuthCookies(res, accessToken, newRefreshToken.token);

    res.status(200).json({ message: "Token refreshed successfully." });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenValue } = req.cookies;

    if (refreshTokenValue) {
      await RefreshToken.deleteOne({
        token: refreshTokenValue,
        userId: req.user.id,
      });
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    res.status(200).json({ message: "Logged out from current device." });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.deleteMany({ userId: req.user.id });

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    res.status(200).json({ message: "Logged out from all devices." });
  } catch (error) {
    next(error);
  }
};
