'use strict';

var https = require('https');
var dropbox = require('dropbox');
var authUrl = dropbox.prototype.getAuthenticationUrl;

dropbox.prototype.getAuthenticationUrl = function (redirectUri, state, type) {
  var url = authUrl.call(this,redirectUri, state, type);

  if (type === 'code') {
    url = url.replace('response_type=token', 'response_type=code');
  }

  return url;
}

dropbox.prototype.fetchAccessTokenFromCode = function (option, cb) {
  var tokenUrl = `/oauth2/token?code=${option.code}&grant_type=authorization_code&redirect_uri=${option.redirectUri}`
  var options = getOptions(tokenUrl, option.clientId, option.secret);

  getAccessTokenFromApi(options, accessTokenHandler(cb));
}

function getOptions(tokenUrl, clientId, secret) {
  var authorization = 'Basic ' + new Buffer(clientId + ':' + secret).toString('base64');

  return {
    hostname: 'api.dropboxapi.com',
    path: tokenUrl,
    method: 'POST',
    headers: {
      Authorization: authorization
    }
  };
}

function parseJsonData(cb) {
  return function (data) {
    var rawData = '';
    data.on('data', function (chunk) { rawData += chunk});
    data.on('end', function ()  {
      try {
        var parsedData = JSON.parse(rawData);
        cb(parsedData.error, parsedData);
      } catch (e) {
        cb(e.message);
      }
    });
  };
}

function getAccessTokenFromApi(options, callback) {
  var request = https.request(options, parseJsonData(callback));
  request.end();
}

function accessTokenHandler(callback) {
  return function(err, data) {
    callback(err, data);
  };
}
