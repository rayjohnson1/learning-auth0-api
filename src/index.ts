import "@babel/polyfill";
import express from 'express'
const app = express();
import jwt from 'express-jwt'
import jwtAuthz from 'express-jwt-authz';
import jwksRsa from 'jwks-rsa';

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://rays-auth.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'learning-auth0',
  issuer: `https://rays-auth.auth0.com/`,
  algorithms: ['RS256']
});

app.get('/', (req, res) => {
    res.json({ message: 'This is a public route :)'})
})

app.get('/private', checkJwt, (req, res) => {
    res.json({message: 'This is a private route :)'})
})

const checkScopes = jwtAuthz([ 'read:private:route' ]);

app.get('/private-scoped', checkJwt, checkScopes, function(req, res) {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:private:route to see this.'
  });
});

app.listen(3000, () => console.log('App started on port 3000.'))