const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Fighter = require('./models/Fighter');
const Goal = require('./models/Goal');
const Attendance = require('./models/Attendance');
const FighterHistory = require('./models/FighterHistory');
const Report = require('./models/Report');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sweet_science';

const COACH = {
  name: 'Coach Demo',
  email: 'coach@sweetscience.com',
  password: 'coach123',
  gym_name: 'Sweet Science Gym',
};

const FIGHTERS = [
  { name: 'Khabib Nurmagomedov', weight_lbs: 155, weight_class: 'Lightweight',    cardio: 5, striking: 3, grappling: 5, sessions_per_week: 6, training_since: 2008 },
  { name: 'Conor McGregor',      weight_lbs: 155, weight_class: 'Lightweight',    cardio: 3, striking: 5, grappling: 2, sessions_per_week: 4, training_since: 2007 },
  { name: 'Israel Adesanya',     weight_lbs: 185, weight_class: 'Middleweight',   cardio: 4, striking: 5, grappling: 3, sessions_per_week: 5, training_since: 2010 },
  { name: 'Amanda Nunes',        weight_lbs: 135, weight_class: 'Bantamweight',   cardio: 5, striking: 5, grappling: 4, sessions_per_week: 6, training_since: 2008 },
  { name: 'Jon Jones',           weight_lbs: 248, weight_class: 'Heavyweight',    cardio: 4, striking: 4, grappling: 5, sessions_per_week: 5, training_since: 2008 },
  { name: 'Max Holloway',        weight_lbs: 145, weight_class: 'Featherweight',  cardio: 5, striking: 5, grappling: 3, sessions_per_week: 6, training_since: 2010 },
  { name: 'Charles Oliveira',    weight_lbs: 155, weight_class: 'Lightweight',    cardio: 4, striking: 4, grappling: 5, sessions_per_week: 5, training_since: 2010 },
  { name: 'Valentina Shevchenko',weight_lbs: 125, weight_class: 'Flyweight',      cardio: 5, striking: 4, grappling: 4, sessions_per_week: 5, training_since: 2003 },
  { name: 'Alexander Volkanovski',weight_lbs: 145, weight_class: 'Featherweight', cardio: 5, striking: 4, grappling: 4, sessions_per_week: 6, training_since: 2012 },
  { name: 'Kamaru Usman',        weight_lbs: 170, weight_class: 'Welterweight',   cardio: 5, striking: 4, grappling: 4, sessions_per_week: 5, training_since: 2012 },
];

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split('T')[0];
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Seeding database...\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Fighter.deleteMany({}),
    Goal.deleteMany({}),
    Attendance.deleteMany({}),
    FighterHistory.deleteMany({}),
    Report.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // Create coach user
  const passwordHash = await bcrypt.hash(COACH.password, 10);
  const coach = await User.create({
    name: COACH.name,
    email: COACH.email,
    password_hash: passwordHash,
    gym_name: COACH.gym_name,
  });
  console.log(`Created coach: ${coach.email} (password: ${COACH.password})`);

  // Create fighters
  const createdFighters = [];
  for (const f of FIGHTERS) {
    const fighter = await Fighter.create({
      coach_id: coach._id,
      name: f.name,
      weight: f.weight_lbs,
      weight_lbs: f.weight_lbs,
      weight_class: f.weight_class,
      cardio: f.cardio,
      striking: f.striking,
      grappling: f.grappling,
      training_frequency: f.sessions_per_week,
      sessions_per_week: f.sessions_per_week,
      training_since: f.training_since,
    });
    createdFighters.push(fighter);

    // Add creation history
    await FighterHistory.create({
      fighter_id: fighter._id,
      field_name: 'profile',
      old_value: null,
      new_value: 'created',
      note: 'Profile created during seeding',
    });

    console.log(`  Created fighter: ${fighter.name} (${fighter.weight_class}, ${fighter.weight_lbs} lbs)`);
  }

  // Create goals for each fighter
  const goalTypes = ['weight', 'skill', 'consistency'];
  const goalTemplates = [
    { type: 'weight',      description: 'Make weight for next bout',     target: 155, currentOffset: 8  },
    { type: 'skill',       description: 'Improve striking accuracy',     target: 5,   currentOffset: -2 },
    { type: 'consistency', description: 'Maintain training consistency',  target: 90,  currentOffset: -25 },
  ];

  for (const fighter of createdFighters) {
    // Give each fighter 1-2 goals
    const numGoals = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numGoals; i++) {
      const template = goalTemplates[i % goalTemplates.length];
      const targetValue = template.type === 'weight' ? fighter.weight_lbs : template.target;
      const currentValue = Math.max(0, targetValue + template.currentOffset);

      await Goal.create({
        coach_id: coach._id,
        fighter_id: fighter._id,
        type: template.type,
        description: template.description,
        target_value: targetValue,
        current_value: currentValue,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    }
  }
  console.log(`\nCreated goals for all fighters.`);

  // Create attendance records (last 30 days)
  let attendanceCount = 0;
  for (const fighter of createdFighters) {
    const sessionsPerWeek = fighter.sessions_per_week;
    // Generate ~4 weeks of attendance
    for (let day = 0; day < 28; day++) {
      // Only log on training days (roughly matching sessions_per_week)
      if (Math.random() < sessionsPerWeek / 7) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const sessionDate = date.toISOString().split('T')[0];
        // 80-95% attendance rate
        const attended = Math.random() < 0.85;

        try {
          await Attendance.create({
            coach_id: coach._id,
            fighter_id: fighter._id,
            session_date: sessionDate,
            attended,
            status: attended ? 'present' : 'absent',
            note: attended ? null : 'Missed session',
          });
          attendanceCount++;
        } catch (err) {
          // Skip duplicate date entries
        }
      }
    }
  }
  console.log(`Created ${attendanceCount} attendance records.`);

  console.log('\n--- Seed Complete ---');
  console.log(`Coach login: ${COACH.email} / ${COACH.password}`);
  console.log(`Fighters: ${createdFighters.length}`);
  console.log('');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
