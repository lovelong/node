const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth'); 

router.get('/demo', (req, res) => {
  res.send('About Us Demo Route');
});

// get about us data
router.get('/', (req, res) => {
  const sql = 'SELECT vision, mission FROM aboutus WHERE id = 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.json({ vision: '', mission: [] });

    const row = results[0];
    let mission = [];

    try {
      if (typeof row.mission === 'string') {
        mission = JSON.parse(row.mission);
      } else if (row.mission !== null) {
        mission = row.mission;
      }
    } catch (e) {
      mission = [];
    }

    res.json({ vision: row.vision, mission });
  });
});

// add or update about us data
router.post('/', auth, (req, res) => {
  const { vision, mission } = req.body;

  if (!vision || !Array.isArray(mission)) {
    return res.status(400).json({ message: 'vision (string) and mission (array) are required' });
  }

  const sql = `
    INSERT INTO aboutus (id, vision, mission)
    VALUES (1, ?, ?)
    ON DUPLICATE KEY UPDATE
      vision = VALUES(vision),
      mission = VALUES(mission)
  `;

  db.query(sql, [vision, JSON.stringify(mission)], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'About Us data saved successfully' });
  });
});


// delete about us data
router.delete('/', auth, (req, res) => {
  const deleteSql = 'DELETE FROM aboutus WHERE id = 1';
  db.query(deleteSql, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'About Us data deleted successfully' });
  });
});

module.exports = router;
