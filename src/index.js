const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');

// Activate environment
dotenv.config();

// Utils
const ringcentralUtils = require('./utils/ringcentral');
const zohoUtils = require('./utils/zoho');
const twilioUtils = require('./utils/twilio');

// Services
const zohoServices = require('./services/zoho');

const app = express();

// Middlewares
app.use(express.json());

// RingCentral pkg's
const RC = require('@ringcentral/sdk').SDK;

// Routes

/**
 * Send webhook
 */
app.post('/api/webhook/send', async (req, res) => {
  try {
    await axios.post(process.env.ZOHO_SERVER_URL, req.body);
    res.json({ message: '¡Sended!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Receive webhooks
 */
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('body ===> ', req.body);
    console.log('parties body ===> ', req.body?.body?.parties?.[0]);

    // re-send validation token to RingCentral
    if (req.headers.hasOwnProperty('validation-token')) {
      res.setHeader('Validation-Token', req.headers['validation-token'] || '');
      return res.json({ message: '¡Webhook is work!' });
    }

    // Renew webhook
    if (req.body?.body?.expiresIn <= ringcentralUtils.constants.SUBSCRIPTION_TIME_REMAINING) {
      await ringcentralUtils.renewSubscription(req.body?.subscriptionId);
      return res.status(204);
    }

    // Missed call webhook
    if (req.body?.body?.parties?.[0]?.missedCall === true) {
      const phoneNumber = req.body?.body?.parties?.[0]?.from?.phoneNumber;

      // Validate if phone number is valid
      if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }

      // Get Zoho Desk config
      const config = await zohoUtils.credentials(process.env.COMPANY_ID);

      if (!config) {
        throw new Error('No config found');
      }

      const { accessToken, domainURL, organizationId } = config;

      // Create ticket in Zoho
      const ticket = zohoUtils.formatMissedcallTicket(req.body);

      // Send ticket to Zoho Desk
      const zohoResponse = await zohoServices.createTicket(domainURL, organizationId, accessToken, ticket);

      if (!zohoResponse) {
        throw new Error('Error creating ticket');
      }

      // Send message through of Twilio
      const twilioResponse = await twilioUtils.sendMessage(phoneNumber);

      if (!twilioResponse || !twilioResponse?.sid) {
        throw new Error('Error sending message');
      }

      return res.json({ message: '!Successfully!' });
    }

    // Voicemail webhook
    if (req.body?.body?.type === 'VoiceMail') {
      const phoneNumber = data.body.from.phoneNumber;

      // Validate if phone number is valid
      if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Invalid phone number' });
      }

      // Get Zoho Desk config
      const config = await zohoUtils.credentials(process.env.COMPANY_ID);

      if (!config) {
        throw new Error('No config found');
      }

      const { accessToken, domainURL, organizationId } = config;

      // Create ticket in Zoho
      const ticket = zohoUtils.formatVoicemailTicket(req.body);

      // Send ticket to Zoho Desk
      const zohoResponse = await zohoServices.createTicket(domainURL, organizationId, accessToken, ticket);

      if (!zohoResponse) {
        throw new Error('Error creating ticket');
      }

      // Send message through of Twilio
      const twilioResponse = await twilioUtils.sendMessage(phoneNumber);

      if (!twilioResponse || !twilioResponse?.sid) {
        throw new Error('Error sending message');
      }

      return res.json({ message: '!Successfully!' });
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

/**
 * Send message through of Twilio
 */
app.post('/api/messages', async (req, res) => {
  try {
    const response = await twilioUtils.sendMessage(req.body.phoneNumber);

    if (response?.sid) {
      return res.json({ message: '¡Operation completed!' });
    }

    res.status(response.status).json({ message: response.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Get tickets from Zoho
 */
app.get('/api/tickets', async (_req, res) => {
  try {
    const config = await zohoUtils.credentials(process.env.COMPANY_ID);

    if (!config) {
      throw new Error('No config found');
    }

    const { accessToken, domainURL, organizationId } = config;

    const response = await zohoServices.getTickets(domainURL, organizationId, accessToken);

    if (!response) {
      throw new Error('Error getting tickets');
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Create ticket in Zoho
 */
app.post('/api/tickets', async (req, res) => {
  try {
    const config = await zohoUtils.credentials(process.env.COMPANY_ID);

    if (!config) {
      throw new Error('No config found');
    }

    const { accessToken, domainURL, organizationId } = config;

    const response = await zohoServices.createTicket(domainURL, organizationId, accessToken, req.body);

    if (!response) {
      throw new Error('Error creating ticket');
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Server listen
app.listen(process.env.PORT, () => console.log(`Server on port: ${process.env.PORT}`));
