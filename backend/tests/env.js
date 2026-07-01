require('dotenv').config({ path: '../.env' });

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);