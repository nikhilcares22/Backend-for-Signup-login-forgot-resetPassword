const config = require('../config/config');
const client = require('twilio')(config.twilio.ACCOUNTSID, config.twilio.AUTHTOKEN);

module.exports = function (data) {
    return new Promise((resolve, reject) => {
        client.messages.create(data)
            .then(message => {
                resolve(message);
            })
            .catch(err => {
                console.log(err);
            });

    });
};
