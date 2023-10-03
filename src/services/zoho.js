/* ---------------------------------------- API Call Functions ---------------------------------------- */
const axios = require('axios');

/**
 *
 * @param {String} clientId
 * @param {String} clientSecret
 * @param {String} refreshToken
 * @returns {Promise<Object>}
 */
module.exports.generateAccessToken = async (clientId, clientSecret, refreshToken) => {
  const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&scope=Desk.tickets.READ,Desk.tickets.CREATE,Desk.basic.READ,Desk.contacts.READ&grant_type=refresh_token`;
  try {
    const request = await axios.post(url);
    return request.data;
  } catch (error) {
    console.log('Error in generateAccessToken: ', error);
    return null;
  }
};

/**
 *
 * @param {String} domainURL
 * @param {String} organizationId
 * @param {String} accessToken
 * @returns {Promise<Object>}
 */
module.exports.getTickets = async (domainURL, organizationId, accessToken) => {
  const url = `https://${domainURL}/api/v1/tickets`;

  try {
    const request = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: organizationId,
      },
    });
    return request.data;
  } catch (error) {
    console.log('Error in getTickets: ', error);
    return null;
  }
};

/**
 *
 * @param {String} domainURL
 * @param {String} organizationId
 * @param {String} accessToken
 * @param {Object} ticket
 * @returns
 */
module.exports.createTicket = async (domainURL, organizationId, accessToken, ticket) => {
  const url = `https://${domainURL}/api/v1/tickets`;

  try {
    const request = await axios.post(url, ticket, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: organizationId,
      },
    });
    return request.data;
  } catch (error) {
    console.log('Error in createTicket: ', error);
    return null;
  }
};

/* ---------------------------------------- DB Query Functions ---------------------------------------- */

const mssql = require('mssql');

/**
 *
 * @param {Number} companyId
 * @returns {Promise<Object>}
 */
module.exports.getConfig = async (companyId) => {
  let pool = null;
  try {
    pool = await mssql.connect(process.env.DB_CONNECTION_STRING);

    const request = await pool
      .request()
      .input('CompanyID', mssql.SmallInt, companyId)
      .query(
        `
        SELECT DeskConfig FROM company_integration WHERE CompanyID = @CompanyID AND IsActived = 1
        `
      );

    return JSON.parse(request.recordset[0].DeskConfig);
  } catch (error) {
    console.log('Error in getConfig: ', error);
    return null;
  }
};

/**
 *
 * @param {Number} companyId
 * @param {object} deskConfig
 * @returns {Promise<Number>}
 */
module.exports.updateConfig = async (companyId, deskConfig) => {
  let pool = null;
  try {
    pool = await mssql.connect(process.env.DB_CONNECTION_STRING);

    const request = await pool
      .request()
      .input('CompanyID', mssql.SmallInt, companyId)
      .input('DeskConfig', mssql.Text, deskConfig)
      .query(
        `
        UPDATE company_integration 
        SET DeskConfig = @DeskConfig
        WHERE CompanyID = @CompanyID AND IsActived = 1
        `
      );

    return request.rowsAffected[0];
  } catch (error) {
    console.log('Error in updateConfig: ', error);
    return null;
  }
};
