import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserPlan extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  dayType: 'weekday' | 'weekend';
  createdAt: Date;
  updatedAt: Date;
}

const userPlanSchema = new Schema<IUserPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a plan name'],
    },
    description: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    dayType: {
      type: String,
      enum: ['weekday', 'weekend'],
      default: 'weekday',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserPlan ||
  mongoose.model<IUserPlan>('UserPlan', userPlanSchema);
