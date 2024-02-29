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
  if(payload.role==="Admin"){
return false;  
  }
  if(payload.role==="entreprise"){
if (req.method ==="POST" && req.path ==="/api/v1/products"){
  return false;
} 
return true;
  }
  if(payload.role==="client"){
    if(
      req.method === "GET" && req.path === "/api/v1/products"||
      req.method === "GET" && req.path === "/api/v1/categories"||
      req.method === "GET" && req.path === "/api/v1/orders"

    ){
      return false;
    }
    return true;

  }
return true;
}

module.exports = authJwt;