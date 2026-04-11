import crypto from "crypto";
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    device: {
      type: String,
      trim: true,
      default: "unknown",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.createToken = async function (userId, device) {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return this.create({
    userId,
    token,
    device,
    expiresAt,
  });
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
