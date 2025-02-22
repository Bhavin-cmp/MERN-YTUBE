import mongoose, { Schema } from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // One who ise subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // One to whom Subscriber is subscribing
      ref: "User",
    },
  },
  { timeStamp: true }
);

export const Subscription = mongoose.model("Subcription", subscriptionSchema);
