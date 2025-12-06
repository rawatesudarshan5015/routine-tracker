import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailySummary extends Document {
  userId: Types.ObjectId;
  logDate: Date;
  dsaProblems: number;
  projectHours: number;
  commitsPushed: number;
  systemDesignTopic?: string;
  applicationsSent: number;
  mockInterviews: number;
  energyRating?: number;
  blocker?: string;
  top3Priorities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const dailySummarySchema = new Schema<IDailySummary>(
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
    dsaProblems: {
      type: Number,
      default: 0,
    },
    projectHours: {
      type: Number,
      default: 0,
    },
    commitsPushed: {
      type: Number,
      default: 0,
    },
    systemDesignTopic: String,
    applicationsSent: {
      type: Number,
      default: 0,
    },
    mockInterviews: {
      type: Number,
      default: 0,
    },
    energyRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    blocker: String,
    top3Priorities: [String],
  },
  {
    timestamps: true,
  }
);

dailySummarySchema.index({ userId: 1, logDate: 1 });
dailySummarySchema.index({ userId: 1, logDate: -1 });

export default mongoose.models.DailySummary ||
  mongoose.model<IDailySummary>('DailySummary', dailySummarySchema);
