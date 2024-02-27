const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked : isRevoked
  }).unless({
    path:[
      {url:  /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
      {url:  /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
      {url:  /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
      `${api}/users/login`,
      `${api}/users/register`
    ]
  })
}
async function isRevoked(req,jwt){
  const payload = jwt.payload;
  //TODO:
  if(payload.role==="Admin" || payload.role==="entrprise"){
return false; 
  }
return true;

}

module.exports = authJwt;