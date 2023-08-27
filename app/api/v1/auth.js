import jwt from "jsonwebtoken";

import { configuration } from "../../config.js";

const { token } = configuration;
const { secret, expires } = token;

export const signToken = (payload, expiresIn = expires) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const auth = (req, res, next) => {
  let token = req.headers.authorization || "";
  if (token.startsWith("Bearer")) {
    token = token.substring(7);
  }
  if (!token) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return next({
        message: "Prohibido",
        status: 403,
      });
    }
    req.decoded = decoded;
    next();
  });
};

export const me = (req, res, next) => {
  const { decoded = {}, params = {} } = req;
  const { id: userID } = decoded;
  const { id } = params;
  if (userID !== id) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }
  next();
};

export const owner = (req, res, next) => {
  const { decoded = {}, data = {} } = req;
  const { idType: ownerId } = decoded;
  const { id_empresa: idEmpresa } = data;

  if (ownerId !== idEmpresa) {
    return next({
      message: "Prohibido",
      status: 403,
    });
  }

  next();
};
