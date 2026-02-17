const nodemailer = require('nodemailer');

console.log('Testing with ADMIN account: gogmiadmin@gogmi.onmicrosoft.com');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'gogmiadmin@gogmi.onmicrosoft.com',
    pass: 'cdctE@M2O25'
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

transporter.sendMail({
  from: 'GoGMI Admin <gogmiadmin@gogmi.onmicrosoft.com>',
  to: 'ellise@gogmi.org.gh',
  subject: 'Test from Admin Account',
  html: '<h1>Testing SMTP with admin account</h1>'
}).then(() => {
  console.log('✅ SUCCESS with admin account!');
  process.exit(0);
}).catch(err => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});
