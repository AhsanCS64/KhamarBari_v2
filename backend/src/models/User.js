import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    contact: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^01[3-9]\d{8}$/,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    avatar: { type: String, default: null },
    roleTitle: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'manager', 'worker', 'admin'],
      default: 'owner',
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
)

userSchema.index({ farmId: 1, role: 1 })

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    farmId: this.farmId,
    name: this.name,
    contact: this.contact,
    email: this.email,
    avatar: this.avatar,
    roleTitle: this.roleTitle,
    bio: this.bio,
    role: this.role,
    branchId: this.branchId,
    status: this.status,
    createdAt: this.createdAt,
  }
}

export const User = mongoose.model('User', userSchema)