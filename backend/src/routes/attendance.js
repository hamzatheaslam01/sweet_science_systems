const express = require('express');
const Fighter = require('../models/Fighter');
const Attendance = require('../models/Attendance');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/today', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const records = await Attendance.find({
      coach_id: req.user.id,
      session_date: todayStr
    }).select('fighter_id attended status note');

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching today\'s attendance.' });
  }
});

router.post('/batch', async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'records array is required.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const operations = records.map(rec => ({
      updateOne: {
        filter: { fighter_id: rec.fighter_id, session_date: todayStr },
        update: {
          fighter_id: rec.fighter_id,
          coach_id: req.user.id,
          session_date: todayStr,
          attended: rec.attended,
          status: rec.attended ? 'present' : 'absent',
          note: rec.note || null
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    return res.json({ message: `Successfully processed ${records.length} records.` });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error batch logging attendance.' });
  }
});

async function verifyFighterOwnership(fighterId, coachId) {
  try {
    return await Fighter.findOne({ _id: fighterId, coach_id: coachId }).select('_id');
  } catch (error) {
    return null;
  }
}

router.post('/', async (req, res) => {
  const { fighter_id: fighterId, date, status } = req.body;
  if (!fighterId || !date || !status) {
    return res.status(400).json({ error: 'fighter_id, date, and status are required.' });
  }

  const attended = String(status).toLowerCase() === 'present';

  try {
    const fighter = await verifyFighterOwnership(fighterId, req.user.id);
    if (!fighter) return res.status(404).json({ error: 'Fighter not found for this coach.' });

    const record = await Attendance.findOneAndUpdate(
      { fighter_id: fighterId, session_date: date },
      {
        fighter_id: fighterId,
        coach_id: req.user.id,
        session_date: date,
        attended,
        status: attended ? 'present' : 'absent',
        note: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error logging attendance.' });
  }
});

router.post('/single', async (req, res) => {
  const { fighter_id: fighterId, session_date: sessionDate, attended, note } = req.body;
  if (!fighterId || !sessionDate || typeof attended !== 'boolean') {
    return res.status(400).json({ error: 'fighter_id, session_date, and attended are required.' });
  }

  try {
    const fighter = await verifyFighterOwnership(fighterId, req.user.id);
    if (!fighter) return res.status(404).json({ error: 'Fighter not found for this coach.' });

    const record = await Attendance.findOneAndUpdate(
      { fighter_id: fighterId, session_date: sessionDate },
      {
        fighter_id: fighterId,
        coach_id: req.user.id,
        session_date: sessionDate,
        attended,
        status: attended ? 'present' : 'absent',
        note: note || null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error logging attendance.' });
  }
});

router.get('/:fighter_id/summary', async (req, res) => {
  try {
    const fighter = await verifyFighterOwnership(req.params.fighter_id, req.user.id);
    if (!fighter) return res.status(404).json({ error: 'Fighter not found for this coach.' });

    const records = await Attendance.find({
      fighter_id: req.params.fighter_id,
      coach_id: req.user.id,
    }).sort({ session_date: -1 });

    const total = records.length;
    const attended = records.filter((row) => row.attended).length;
    const missed = total - attended;
    const attendancePct = total ? Math.round((attended / total) * 100) : 0;

    return res.json({
      total_sessions: total,
      attended,
      missed,
      attendance_pct: attendancePct,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching attendance summary.' });
  }
});

router.get('/:fighter_id', async (req, res) => {
  try {
    const fighter = await verifyFighterOwnership(req.params.fighter_id, req.user.id);
    if (!fighter) return res.status(404).json({ error: 'Fighter not found for this coach.' });

    const records = await Attendance.find({
      fighter_id: req.params.fighter_id,
      coach_id: req.user.id,
    })
      .select('_id fighter_id session_date attended note created_at')
      .sort({ session_date: -1 });

    return res.json(
      records.map((row) => ({
        id: row._id,
        fighter_id: row.fighter_id,
        session_date: row.session_date,
        attended: row.attended ? 1 : 0,
        note: row.note,
        created_at: row.created_at,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error fetching attendance logs.' });
  }
});

module.exports = router;
