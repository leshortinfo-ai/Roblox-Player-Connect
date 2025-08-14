import { Router } from 'express';
import { resolveUsernameToId, getUserProfile, getUserAvatar } from './services/roblox.js';
import { cacheMiddleware } from './cache.js';

export const router = Router();

// Validation server-side simple
function isValidUsername(name='') {
  return /^[A-Za-z0-9_]{3,20}$/.test(name);
}

// POST /api/lookup { username }
router.post('/lookup', cacheMiddleware(60), async (req, res, next) => {
  try {
    const { username } = req.body || {};
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Pseudo invalide. Utilisez 3-20 caractères alphanumériques ou _.' });
    }
    const id = await resolveUsernameToId(username);
    if (!id) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const [profile, avatar] = await Promise.all([
      getUserProfile(id),
      getUserAvatar(id)
    ]);
    return res.json({ userId: id, profile, avatar });
  } catch (e) {
    next(e);
  }
});

// GET /api/users/:id (profil + avatar)
router.get('/users/:id', cacheMiddleware(60), async (req, res, next) => {
  try {
    const id = String(req.params.id || '').replace(/[^0-9]/g,'');
    if (!id) return res.status(400).json({ error: 'ID invalide' });
    const [profile, avatar] = await Promise.all([
      getUserProfile(id),
      getUserAvatar(id)
    ]);
    if (!profile) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json({ userId: id, profile, avatar });
  } catch (e) {
    next(e);
  }
});