import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 2000 },
    internName: { type: String, required: [true, 'Intern name is required'], trim: true, maxlength: 60 },
    tags: { type: [String], default: [] },
    images: {
      type: [String],
      default: [],
      validate: [(v) => v.length <= 5, 'You can upload at most 5 images'],
    },
    liveUrl: { type: String, trim: true, default: '' },
    repoUrl: { type: String, trim: true, default: '' },
    slug: { type: String, required: true, unique: true, index: true },
    // Secret that lets the creator edit/delete. Never returned by normal queries.
    editKey: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
