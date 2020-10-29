import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import jwt from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import { resolve } from "path";

require("dotenv").config({
  path: resolve(process.cwd(), "src", "server", ".env"),
});

const app = express();

const port = process.env.API_PORT;
const appOrigin = process.env.APP_ORIGIN;
const audience = process.env.AUTH0_AUDIENCE;
const issuer = process.env.AUTH0_ISSUER;

if (!issuer || !audience) {
  throw new Error("Please make sure that .env is in place and populated");
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuer}.well-known/jwks.json`,
  }),

  audience: audience,
  issuer: issuer,
  algorithms: ["RS256"],
});

app.get("/api/public-message", (req, res) => {
  res.send({
    msg: "The API doesn't require an access token to share this message.",
  });
});

app.get("/api/private-message", checkJwt, (req, res) => {
  res.send({
    msg: "The API successfully validated your access token.",
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
