const express = require('express');
const dotenv = require('dotenv');

// Utils
const ringcentralUtils = require('./utils/ringcentral');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// RingCentral pkg's
const RC = require('@ringcentral/sdk').SDK;

// Routes

/**
 * Receive webhooks
 */
app.post('/api/webhook', async (req, res) => {
  try {
    // RingCentral webhook test
    if (req.headers['validation-token']) {
      // Set validation token to response header
      res.setHeader('Validation-Token', req.headers['validation-token'] || '');

      return res.json({ message: '¡Webhook is work!' });
    }

    // Renew webhook
    if (req.body?.body?.expiresIn <= ringcentralUtils.constants.SUBSCRIPTION_TIME_REMAINING) {
      await ringcentralUtils.renewSubscription(req.body?.subscriptionId);
      return res.status(204);
    }

    res.json({ message: '¡Successfully!' });
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
 * Get subscription by id
 */
app.get('/api/subscription/:id', async (req, res) => {
  try {
    const subscriptionID = req.params?.id;

    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.get(`/restapi/v1.0/subscription/${subscriptionID}`);
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
app.post('/api/subscription', async (req, res) => {
  try {
    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.post('/restapi/v1.0/subscription', req.body);
    const response = request.json();

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Update subscription by id
 */
app.put('/api/subscription/:id', async (req, res) => {
  try {
    const subscriptionID = req.params?.id;

    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.put(`/restapi/v1.0/subscription/${subscriptionID}`);
    const response = await request.json();

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Delete subscription by id
 */
app.delete('/api/subscription/:id', async (req, res) => {
  try {
    const subscriptionID = req.params?.id;

    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.delete(`/restapi/v1.0/subscription/${subscriptionID}`);

    if (request.status === 202) {
      res.json({ message: '¡Operation competed!' });
    }

    res.status(request.status).json({ message: 'An error ocurred' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Renew subscription
 */
app.post('/api/subscription/:id/renew', async (req, res) => {
  try {
    const subscriptionID = req.params?.id;

    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.post(`/restapi/v1.0/subscription/${subscriptionID}/renew`);
    const response = await request.json();

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Server listen
app.listen(process.env.PORT, () => console.log(`Server on port: ${process.env.PORT}`));
