# dropbox-client-oauth2
Extension functions to Dropbox SDK to enabling OAuth2 with responsetype code.

An example how to use this library:

```javascript
'use strict';

const app = require('express')();
const hostname = 'localhost';
const port = 3000;
const https = require('https');
const config = {
  clientId: '[yourClientId]',
  secret: '[yourSecret]'
};

const dropbox = new (require('dropbox'))(config);
require('dropbox-client-oauth2');

const redirectUri = `http://${hostname}:${port}/auth`;
const url = dropbox.getAuthenticationUrl(redirectUri, null, 'code');

app.get('/', (req, res) => {
  res.writeHead(302, { 'Location': url });
  res.end();
});

app.get('/auth', (req, res) => {
  let code = req.query.code;
  var options = Object.assign({
    code,
    redirectUri
  }, config);

  dropbox.fetchAccessTokenFromCode(options, (err, token) => {
      if (err) {
        console.log(err);
      } else {
        dropbox.setAccessToken(token);
      }
    });
});

app.listen(port);
```
