const nodemailer = require('nodemailer');

console.log('Testing with info@gogmi.org.gh...');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@gogmi.org.gh',
    pass: 'GoGTeam25'
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

transporter.sendMail({
  from: 'GoGMI Intranet <info@gogmi.org.gh>',
  to: 'ellise@gogmi.org.gh',
  subject: 'Password Reset Test - GoGMI Intranet',
  html: '<h1>SUCCESS!</h1><p>Password reset emails are working!</p>'
}).then(() => {
  console.log('✅ SUCCESS! Check ellise@gogmi.org.gh inbox!');
  process.exit(0);
}).catch(err => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});
