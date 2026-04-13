import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "municipal_officer", "barangay_officer", "member"], 
      default: "member" 
    },
    municipality: { type: String, required: true },
    barangay: { type: String, required: true }
  },
  { timestamps: true }
);

// Automatic password hashing before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;