import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    const err = new Error('Only PNG, JPG, WEBP or GIF images are allowed');
    err.status = 400;
    cb(err);
  },
});

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const parseTags = (raw = '') =>
  [...new Set(String(raw).split(',').map((t) => t.trim()).filter(Boolean))].slice(0, 10);

const makeSlug = (title = '') => {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'project';
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
};

const removeFiles = (files = []) =>
  files.forEach((f) => fs.unlink(path.join(uploadDir, path.basename(f)), () => {}));

const keyMatches = (a = '', b = '') => {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

const publicView = (doc) => {
  const obj = doc.toObject();
  delete obj.editKey;
  return obj;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/projects?q=react&tag=Node.js  -> list / search
router.get(
  '/',
  wrap(async (req, res) => {
    const filter = {};
    if (req.query.tag) filter.tags = String(req.query.tag);
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
      filter.$or = [{ title: rx }, { internName: rx }, { tags: rx }];
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(60);
    res.json(projects);
  })
);

// GET /api/projects/:slug  -> single project (powers the shareable link)
router.get(
  '/:slug',
  wrap(async (req, res) => {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  })
);

// POST /api/projects  (multipart/form-data)
router.post(
  '/',
  upload.array('images', 5),
  wrap(async (req, res) => {
    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
    try {
      const { title, description, internName, liveUrl, repoUrl, tags } = req.body;
      const editKey = crypto.randomBytes(16).toString('hex');
      const project = await Project.create({
        title,
        description,
        internName,
        liveUrl,
        repoUrl,
        tags: parseTags(tags),
        images,
        slug: makeSlug(title),
        editKey,
      });
      // editKey is returned ONCE here; the client stores it to allow later edits.
      res.status(201).json({ project: publicView(project), editKey });
    } catch (err) {
      removeFiles(images);
      throw err;
    }
  })
);

// PUT /api/projects/:slug  (header: x-edit-key)
router.put(
  '/:slug',
  upload.array('images', 5),
  wrap(async (req, res) => {
    const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
    try {
      const project = await Project.findOne({ slug: req.params.slug }).select('+editKey');
      if (!project) {
        removeFiles(newImages);
        return res.status(404).json({ message: 'Project not found' });
      }
      if (!keyMatches(project.editKey, req.get('x-edit-key'))) {
        removeFiles(newImages);
        return res.status(403).json({ message: 'You are not allowed to edit this project' });
      }

      let toRemove = [];
      try {
        toRemove = JSON.parse(req.body.removeImages || '[]').filter((i) => project.images.includes(i));
      } catch {
        toRemove = [];
      }
      const kept = project.images.filter((i) => !toRemove.includes(i));
      if (kept.length + newImages.length > 5) {
        removeFiles(newImages);
        return res.status(400).json({ message: 'You can have at most 5 images' });
      }

      ['title', 'description', 'internName', 'liveUrl', 'repoUrl'].forEach((f) => {
        if (req.body[f] !== undefined) project[f] = req.body[f];
      });
      if (req.body.tags !== undefined) project.tags = parseTags(req.body.tags);
      project.images = [...kept, ...newImages];

      await project.save();
      removeFiles(toRemove);
      res.json(publicView(project));
    } catch (err) {
      removeFiles(newImages);
      throw err;
    }
  })
);

// DELETE /api/projects/:slug  (header: x-edit-key)
router.delete(
  '/:slug',
  wrap(async (req, res) => {
    const project = await Project.findOne({ slug: req.params.slug }).select('+editKey');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!keyMatches(project.editKey, req.get('x-edit-key'))) {
      return res.status(403).json({ message: 'You are not allowed to delete this project' });
    }
    removeFiles(project.images);
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  })
);

export default router;
