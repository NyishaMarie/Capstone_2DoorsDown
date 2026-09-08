// server/api/tools.js
import express from 'express';
import { getTools, getToolById } from '../db/queries/tools.js';

const router = express.Router();

// TODO(P-09): GET /tools/mine — must stay above GET /tools/:id
// router.get('/mine', requireUser, async (req, res, next) => { ... });

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

router.get('/:id', async (req, res, next) => {
  try {
    const tool = await getToolById(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(tool);
  } catch (err) {
    next(err);
  }
});

export default router;