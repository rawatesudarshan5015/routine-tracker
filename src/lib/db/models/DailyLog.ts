import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailyLog extends Document {
  userId: Types.ObjectId;
  logDate: Date;
  activityBlockId: Types.ObjectId;
  completed: boolean;
  actualStartTime?: Date;
  actualEndTime?: Date;
  notes?: string;
  energyLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

const dailyLogSchema = new Schema<IDailyLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logDate: {
      type: Date,
      required: true,
    },
    activityBlockId: {
      type: Schema.Types.ObjectId,
      ref: 'ActivityBlock',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    actualStartTime: Date,
    actualEndTime: Date,
    notes: String,
    energyLevel: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

dailyLogSchema.index({ userId: 1, logDate: 1 });

export default mongoose.models.DailyLog ||
  mongoose.model<IDailyLog>('DailyLog', dailyLogSchema);
