const sha1 = require('sha1');

function pwdHashed(pwd) {
    return sha1(pwd);
}

function getAuthHeader(req) {
    let authHeader = req.headers['authorization'];
    if (auth && typeof auth === 'string') {
        return authHeader;
    }
    return null;
}

function getToken(authHeader) {
    let tokenType = authHeader.subString(0, 6);
    if  (tokenType !== "Basic ") {
        return null;
    }
    return authHeader.substring(6).trim();
}

function decodeToken(token) {
    const decodedToken = Buffer.from(token, 'base64').toString('utf8');
    if (!decodedToken.includes(':')) {
      return null;
    }
    return decodedToken;
  };
  
  function getCredentials(decodedToken) {
    const [email, password] = decodedToken.split(':');
    if (!email || !password) {
      return null;
    }
    return { email, password };
  };

module.exports = {
    pwdHashed,
    getAuthHeader,
    getToken,
    decodeToken,
    getCredentials,
}
