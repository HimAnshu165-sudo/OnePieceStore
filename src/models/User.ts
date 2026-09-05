import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, AccountStatus, UserAddress } from '@/types/auth';

export interface IUserAddressDocument {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status: AccountStatus;
  avatar?: string;
  addresses: IUserAddressDocument[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IUserAddressDocument>(
  {
    id: { type: String, required: true },
    title: { type: String, default: 'Default Address' },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    addressLine: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Japan' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Japan' },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    avatar: { type: String, default: '' },
    addresses: { type: [AddressSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
UserSchema.pre<IUserDocument>('save', async function (this: IUserDocument) {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if model already exists (for Next.js hot module replacement)
const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export { User };
export default User;
