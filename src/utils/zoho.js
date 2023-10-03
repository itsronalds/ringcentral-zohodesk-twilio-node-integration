const zohoServices = require('../services/zoho');

module.exports.credentials = async (companyId) => {
  try {
    const config = await zohoServices.getConfig(companyId);

    if (!config) {
      throw new Error('No config found');
    }

    const {
      created_at: createdAt,
      refresh_token: refreshToken,
      domain_url: domainURL,
      client_id: clientId,
      client_secret: clientSecret,
      organizationId,
    } = config;

    let accessToken = config.access_token;

    // Calculate elapsed time in minutes
    const elapsedTime = (Date.now() - createdAt) / 60000;

    // Check if access token is expired
    const remainingTime = 60 - elapsedTime;

    // Logic to generate new access token if remaining time is less than 5 minutes
    if (remainingTime <= 5) {
      console.log('Generating new access token');

      const data = await zohoServices.generateAccessToken(clientId, clientSecret, refreshToken);

      if (!data) {
        throw new Error('Error generating access token');
      }

      const { access_token: newAccessToken } = data;
      const newTokenCreatedAt = Date.now().toString();

      config.access_token = newAccessToken;
      config.created_at = newTokenCreatedAt;

      const deskConfig = JSON.stringify(config);

      const result = await zohoServices.updateConfig(companyId, deskConfig);

      if (!result) {
        throw new Error('Error updating config');
      }

      accessToken = newAccessToken;
    }

    return {
      accessToken,
      domainURL,
      organizationId,
    };
  } catch (error) {
    console.log('Error in credentials: ', error);
    return null;
  }
};

module.exports.formatMissedcallTicket = (data) => {
  const phoneNumber = data.body.parties[0].from.phoneNumber;

  return {
    subject: 'RingCentral: Missed call',
    description: `Missed call from: ${phoneNumber}`,
    contactId: '819166000001031001',
    departmentId: '819166000000006907',
    category: 'RingCentral',
    subCategory: 'Missed call',
    phone: '+17866042105',
    status: 'Open',
    assigneeId: '819166000000139001',
    cf: data,
  };
};
