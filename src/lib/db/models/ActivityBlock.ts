import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivityBlock extends Document {
  planId: Types.ObjectId;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: string;
  dayType: 'weekday' | 'weekend';
  description?: string;
  createdAt: Date;
}

const activityBlockSchema = new Schema<IActivityBlock>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'UserPlan',
      required: [true, 'Please provide a plan ID'],
    },
    name: {
      type: String,
      required: [true, 'Please provide activity name'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Please provide duration'],
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
    },
    dayType: {
      type: String,
      enum: ['weekday', 'weekend'],
      default: 'weekday',
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ActivityBlock ||
  mongoose.model<IActivityBlock>('ActivityBlock', activityBlockSchema);
