const fetch = require('node-fetch');
require('dotenv').config();

async function testEmail() {
  console.log('Testing Microsoft Graph API email...');
  
  try {
    // Get token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.AZURE_CLIENT_ID,
          client_secret: process.env.AZURE_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials'
        })
      }
    );
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('❌ Token failed:', tokenData);
      return;
    }
    console.log('✅ Got access token!');

    // Send email
    const sendResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/info@gogmi.org.gh/sendMail`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            subject: 'Test from GoGMI Intranet',
            body: { contentType: 'HTML', content: '<h1>Graph API Works!</h1>' },
            toRecipients: [{ emailAddress: { address: 'ellise@gogmi.org.gh' } }]
          }
        })
      }
    );

    if (sendResponse.status === 202) {
      console.log('✅ EMAIL SENT SUCCESSFULLY via Graph API!');
    } else {
      const err = await sendResponse.json();
      console.error('❌ Send failed:', JSON.stringify(err, null, 2));
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testEmail();
