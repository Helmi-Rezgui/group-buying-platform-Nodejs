const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, default: "client" },
  isVerified: { type: Boolean, default: false }
});



userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
userSchema.set("toJSON", {
  virtuals: true,
});



exports.User = mongoose.model("user", userSchema);
