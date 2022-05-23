const common = require('./env/common');

const env = process.env.EXPRESS_ENV || 'development';
const config = require(`./env/${env}`);

module.exports = { ...common, ...config };
