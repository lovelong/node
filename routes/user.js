// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const db = require('../db');

// const router = express.Router();
// const SECRET = 'supersecretkey';

// router.post('/login', (req, res) => {
//     console.log('Login request body:', req.body);
//   const { name, password } = req.body || {};

//    if (!name || !password) {
//     return res.status(400).json({ message: 'Name and password are required' });
//   }
//   db.query(
//     'SELECT * FROM users WHERE name=? AND password=?',
//     [name, password],
//     (err, results) => {
//       if (err) return res.status(500).json({ message: 'DB error' });
//       if (results.length === 0)
//         return res.status(401).json({ message: 'Invalid name or password' });

//       const user = results[0];
//       const token = jwt.sign({ id: user.id, name: user.name }, SECRET, { expiresIn: '15m' });
//       res.json({ message: 'Login successful', token });
//     }
//   );
// });

// //  Middleware for JWT verification
// function verifyToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   if (!authHeader) return res.status(403).json({ message: 'Token missing' });

//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ message: 'Invalid token' });
//     req.user = decoded;
//     next();
//   });
// }

// //  Add user 
// router.post('/add', verifyToken, (req, res) => {
//   const { id, name, message, date } = req.body;
//   if (!name)
//     return res.status(400).json({ message: 'name are required' });

//     const defaultPassword = "Pass123";
//     db.query(
//       'INSERT INTO users (name, message, date, password) VALUES (?, ?, ?, ?)',
//       [name, message, date, defaultPassword],
//       (err) => {
//         if (err) return res.status(500).json({ message: 'Error inserting user', error: err });
//         res.json({ message: 'User added successfully' });
//       });
// });

// //  View users 
// router.get('/view', verifyToken, (req, res) => {
//   db.query('SELECT id, name, message, date FROM users WHERE id != 1', (err, results) => {
//     if (err) return res.status(500).json({ message: 'Error fetching users' });
//     res.json(results);
//   });
// });

// // Update user
// router.post('/update', verifyToken, (req, res) => {
//   const { id, name, message, date } = req.body;
//   if (!id) return res.status(400).json({ message: 'ID required' });
//   if (parseInt(id) === 1) return res.status(403).json({ message: 'Cannot update admin' });

//   db.query(
//     'UPDATE users SET name=?, message=?, date=? WHERE id=?',
//     [name, message, date, id],
//     (err) => {
//       if (err) return res.status(500).json({ message: 'Error updating user' });
//       res.json({ message: 'User updated successfully' });
//     }
//   );
// });

// router.post('/delete', verifyToken, (req, res) => {
//   const { id } = req.body;
//   if (!id) return res.status(400).json({ message: 'ID required' });
//   if (parseInt(id) === 1) return res.status(403).json({ message: 'Cannot delete admin' });

//   db.query('DELETE FROM users WHERE id=?', [id], (err, results) => {
//     if (err) return res.status(500).json({ message: 'Error deleting user' });

//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   });
// });
// module.exports = router;



const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth'); 

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecretkey'; 

// login 
router.post('/login', (req, res) => {
  const { name, password } = req.body || {};

  if (!name || !password)
    return res.status(400).json({ message: 'Name and password are required' });

  db.query('SELECT * FROM users WHERE name=?', [name], async (err, results) => {
    console.log('DB results:', results);
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid name or password' });

    const user = results[0];
    const valid =password=== user.password;
    if (!valid)
      return res.status(401).json({ message: 'Invalid name or password' });

    const token = jwt.sign({ id: user.id, name: user.name }, SECRET, { expiresIn: '15m' });
    res.json({ message: 'Login successful', token });
  });
});

// add user
router.post('/add', auth, async (req, res) => {
  const { name, password, message, date } = req.body;
  if (!name || !password)
    return res.status(400).json({ message: 'Name and password required' });

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`hashPassword`);
  db.query(
    'INSERT INTO users (name, message, date, password) VALUES (?, ?, ?, ?)',
    [name, message, date, hashedPassword],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error inserting user' });
      res.json({ message: 'User added successfully' });
    }
  );
});

// view users
router.get('/view', auth, (req, res) => {
  db.query('SELECT id, name, message, date FROM users WHERE id != 1', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(results);
  });
});

// -------------------- UPDATE USER --------------------
router.post('/update', auth, (req, res) => {
  const { id, name, message, date } = req.body;
  if (!id) return res.status(400).json({ message: 'ID required' });
  if (parseInt(id) === 1) return res.status(403).json({ message: 'Cannot update admin' });

  db.query(
    'UPDATE users SET name=?, message=?, date=? WHERE id=?',
    [name, message, date, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating user' });
      res.json({ message: 'User updated successfully' });
    }
  );
});

// -------------------- DELETE USER --------------------
router.post('/delete', auth, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'ID required' });
  if (parseInt(id) === 1) return res.status(403).json({ message: 'Cannot delete admin' });

  db.query('DELETE FROM users WHERE id=?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error deleting user' });

    if (results.affectedRows === 0)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
