const express = require('express');
const Fighter = require('../models/Fighter');
const FighterHistory = require('../models/FighterHistory');
const { authRequired } = require('../middleware/auth');
const { enrichFighter } = require('../services/fighterMetrics');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', '..', 'public', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();
router.use(authRequired);

async function getOwnedFighter(fighterId, coachId) {
  try {
    return await Fighter.findOne({ _id: fighterId, coach_id: coachId });
  } catch (error) {
    return null;
  }
}

router.get('/', async (req, res) => {
  try {
    const fighters = await Fighter.find({ coach_id: req.user.id }).sort({ created_at: -1 });
    const enriched = await Promise.all(fighters.map((f) => enrichFighter(f)));
    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching fighters.' });
  }
});

router.post('/', async (req, res) => {
  const {
    name,
    weight,
    weight_lbs: weightLbs,
    cardio,
    striking,
    grappling,
    training_frequency: trainingFrequency,
    sessions_per_week: sessionsPerWeek,
    weight_class: weightClass,
    training_since: trainingSince,
    photo_url: photoUrl,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Fighter name is required.' });
  }

  try {
    const fighter = await Fighter.create({
      coach_id: req.user.id,
      name,
      weight: weight || weightLbs || null,
      weight_lbs: weightLbs || weight || null,
      weight_class: weightClass || null,
      cardio: Number(cardio || 1),
      striking: Number(striking || 1),
      grappling: Number(grappling || 1),
      training_frequency: Number(trainingFrequency || sessionsPerWeek || 0),
      sessions_per_week: Number(sessionsPerWeek || trainingFrequency || 0),
      training_since: trainingSince ? Number(trainingSince) : null,
      photo_url: photoUrl || null,
    });

    await FighterHistory.create({
      fighter_id: fighter._id,
      field_name: 'profile',
      old_value: null,
      new_value: 'created',
      note: 'Profile created',
    });

    const enriched = await enrichFighter(fighter);
    return res.status(201).json(enriched);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error creating fighter.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fighter = await getOwnedFighter(req.params.id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found.' });
    }

    const enriched = await enrichFighter(fighter);
    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching fighter.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const fighter = await getOwnedFighter(req.params.id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found.' });
    }

    const allowedFields = [
      'name',
      'weight',
      'weight_lbs',
      'weight_class',
      'cardio',
      'striking',
      'grappling',
      'training_frequency',
      'sessions_per_week',
      'training_since',
      'photo_url',
    ];

    const updates = {};
    const changes = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== fighter[field]) {
        updates[field] = req.body[field];
        changes.push({
          fighter_id: fighter._id,
          field_name: field,
          old_value: fighter[field] == null ? null : String(fighter[field]),
          new_value: req.body[field] == null ? null : String(req.body[field]),
          note: null,
        });
      }
    }

    if (!Object.keys(updates).length) {
      const enriched = await enrichFighter(fighter);
      return res.json(enriched);
    }

    const updated = await Fighter.findByIdAndUpdate(fighter._id, updates, { new: true });

    if (changes.length) {
      await FighterHistory.insertMany(changes);
    }

    const enriched = await enrichFighter(updated);
    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error updating fighter.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const fighter = await getOwnedFighter(req.params.id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found.' });
    }

    await Fighter.findByIdAndDelete(fighter._id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error deleting fighter.' });
  }
});

router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    const fighter = await getOwnedFighter(req.params.id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    await Fighter.findByIdAndUpdate(fighter._id, { photo_url: photoUrl });

    return res.json({ photo_url: photoUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error uploading photo.' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const fighter = await getOwnedFighter(req.params.id, req.user.id);
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found.' });
    }

    const history = await FighterHistory.find({ fighter_id: fighter._id })
      .sort({ logged_at: -1 })
      .limit(25);

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching fighter history.' });
  }
});

module.exports = router;
