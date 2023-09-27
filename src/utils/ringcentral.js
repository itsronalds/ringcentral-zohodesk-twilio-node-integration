// RingCentral pkg's
const RC = require('@ringcentral/sdk').SDK;

module.exports.constants = {
  SUBSCRIPTION_TIME_REMAINING: 50,
};

module.exports.renewSubscription = async (subscriptionID) => {
  try {
    const rcsdk = new RC({
      server: process.env.RC_SERVER_URL,
      clientId: process.env.RC_CLIENT_ID,
      clientSecret: process.env.RC_CLIENT_SECRET,
    });

    const platform = rcsdk.platform();

    await platform.login({ jwt: process.env.RC_JWT });

    const request = await platform.post(`/restapi/v1.0/subscription/${subscriptionID}/renew`);
    const response = await request.json();

    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};
