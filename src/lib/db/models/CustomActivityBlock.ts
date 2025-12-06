import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomActivityBlock extends Document {
  planId: Types.ObjectId;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: string;
  description?: string;
  order: number;
  createdAt: Date;
}

const customActivityBlockSchema = new Schema<ICustomActivityBlock>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'UserPlan',
      required: true,
      onDelete: 'CASCADE',
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
    description: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CustomActivityBlock ||
  mongoose.model<ICustomActivityBlock>('CustomActivityBlock', customActivityBlockSchema);
