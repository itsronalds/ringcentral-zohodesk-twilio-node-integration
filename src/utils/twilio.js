const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports.sendMessage = async (clientNumber) => {
  try {
    return await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: clientNumber,
      body: 'Hi! you will soon be attended by one of our agents.',
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};
