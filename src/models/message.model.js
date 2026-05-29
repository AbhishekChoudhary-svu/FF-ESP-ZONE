import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  text: {
    type: String,
    required: [true, "Message text cannot be empty"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Important: Next.js uses hot-reloading, so we check if the model 
// already exists before creating a new one to avoid "OverwriteModelError"
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export { Message };