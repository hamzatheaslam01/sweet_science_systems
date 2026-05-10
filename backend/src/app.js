const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const fighterRoutes = require('./routes/fighters');
const goalRoutes = require('./routes/goals');
const attendanceRoutes = require('./routes/attendance');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'Sweet Science API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/fighters', fighterRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Serve existing frontend pages from /frontend
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
const uploadsPath = path.join(__dirname, '..', '..', 'public', 'uploads');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(uploadsPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
