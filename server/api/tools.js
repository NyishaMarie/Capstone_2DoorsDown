import express from 'express';
import { requireUser } from '../middleware/auth.js';
import {
  getTools,
  getToolById,
  getToolsByOwnerId,
  createTool,
  updateTool,
  deleteTool,
  hasActiveBorrow,
} from '../db/queries/tools.js';

const router = express.Router();

// GET /tools/mine — must stay above GET /tools/:id, or "mine" gets read as an id

router.get('/mine', requireUser, async (req, res, next) => {
  try {
    const tools = await getToolsByOwnerId(req.user.id);
    res.json(tools);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const tools = await getTools({
      category,
      availableOnly: available === 'true',
    });
    res.json(tools);
  } catch (err) {
    next(err);
  }
});

// POST /tools — logged in neighbors list a tool they own

router.post('/', requireUser, async (req, res, next) => {
  try {
    const { name, description, category, condition, photoUrl } = req.body;

    if (!name?.trim() || !description?.trim() || !category || !condition) {
      return res
        .status(400)
        .json({ error: 'Name, description, category, and condition are all required.' });
    }

    const tool = await createTool({
      owner_id: req.user.id,
      name,
      description,
      category,
      condition,
      photo_url: photoUrl,
    });

    res.status(201).json(tool);
  } catch (err) {
    next(err);
  }
});

// Loads the tool once for every route below that takes :id, 404s early if it's missing

router.param('id', async (req, res, next, id) => {
  try {
    const tool = await getToolById(id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    req.tool = tool;
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res) => {
  res.json(req.tool);
});

// PATCH /tools/:id — owner only

router.patch('/:id', requireUser, async (req, res, next) => {
  try {
    if (req.tool.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own tools.' });
    }

    const { name, description, category, condition, photoUrl } = req.body;
    const tool = await updateTool(req.params.id, {
      name,
      description,
      category,
      condition,
      photo_url: photoUrl,
    });

    res.json(tool);
  } catch (err) {
    next(err);
  }
});

//  DELETE /tools/:id — owner only, and not while it's out on loan

router.delete('/:id', requireUser, async (req, res, next) => {
  try {
    if (req.tool.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own tools.' });
    }

    if (await hasActiveBorrow(req.params.id)) {
      return res.status(409).json({ error: 'That tool is currently borrowed.' });
    }

    await deleteTool(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;