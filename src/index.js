const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// RingCentral pkg's
const RC = require('@ringcentral/sdk').SDK;

// Routes

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
        address: 'https://webhook.site/8396d153-f59c-4b02-9d13-a20adc3424a5',
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
