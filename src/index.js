const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// RingCentral pkg's
const RC = require('@ringcentral/sdk').SDK;

// Routes

app.post('/api/webhook', async (req, res) => {
  try {
    // Set validation token to response header
    res.setHeader('Validation-Token', req.headers['validation-token'] || '');

    res.json({ message: '¡Webhook is work!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Get subscription list
 */
app.get('/api/subscription', async (_req, res) => {
  try {
    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.get('/restapi/v1.0/subscription');
    const response = await request.json();

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Create subscription
 */
app.post('/api/subscription', async (_req, res) => {
  try {
    const body = {
      eventFilters: ['/restapi/v1.0/account/~/extension/~/telephony/sessions?missedCall=true'],
      deliveryMode: {
        transportType: 'WebHook',
        address: 'https://9fee-206-1-237-156.ngrok.io/api/webhook',
      },
      expireIn: 3600,
    };

    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.post('/restapi/v1.0/subscription', body);
    const response = request.json();

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Server listen
app.listen(process.env.PORT, () => console.log(`Server on port: ${process.env.PORT}`));
