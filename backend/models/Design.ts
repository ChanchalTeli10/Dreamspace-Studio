
import mongoose from 'mongoose';

const furnitureSchema = new mongoose.Schema({
  id: String,
  type: String,
  width: Number,
  depth: Number,
  height: Number,
  x: Number,
  y: Number,
  rotation: Number,
  color: String,
  material: { type: String, enum: ['Wood', 'Fabric', 'Metal', 'Glass', 'Plastic'] }
});

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  roomData: {
    photo: String,
    measurements: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  furniture: [furnitureSchema],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Design', designSchema);
