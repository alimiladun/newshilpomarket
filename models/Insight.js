import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['blog', 'news', 'guide', 'announcement'],
      default: 'blog',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      default: 'Admin',
      trim: true,
    },
    publishDate: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: String,
      default: '1 min read',
    },
    featuredImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'Meta title cannot exceed 70 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [170, 'Meta description cannot exceed 170 characters'],
    },
  },
  { timestamps: true }
);

// ——— Auto-generate slug and read time before saving ———
insightSchema.pre('save', async function (next) {
  // Auto-generate slug from title (only on create or title change)
  if (this.isNew || this.isModified('title')) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.models.Insight.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }

  // Auto-calculate read time (~200 words per minute)
  if (this.isNew || this.isModified('content')) {
    const wordCount = this.content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    this.readTime = `${minutes} min read`;
  }

  next();
});

// Indexes for better query performance
insightSchema.index({ status: 1, publishDate: -1 });
insightSchema.index({ category: 1 });
insightSchema.index({ featured: 1 });
insightSchema.index({ trending: 1 });

export default mongoose.models.Insight || mongoose.model('Insight', insightSchema);
