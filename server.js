require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const userRoutes = require('./routes/user');
const aboutRoutes = require('./routes/about');

const app = express();


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'https://yourfrontend.com';

// security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "https:"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "no-referrer" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  xssFilter: false,
}));

app.use(cors({
  origin: FRONTEND_ORIGIN, 
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/about', aboutRoutes);


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// start server
app.listen(PORT, HOST, () => {
  console.log(`API Server running securely at http://${HOST}:${PORT}`);
  console.log(`CORS Origin allowed: ${FRONTEND_ORIGIN}`);
});
