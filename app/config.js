import * as dotenv from "dotenv";

dotenv.config();

export const configuration = {
  server: {
    port: process.env.PORT,
  },
  pagination: {
    limit: 10,
    offset: 0,
  },
  order: {
    options: ["asc", "desc"],
    direction: "desc",
    orderBy: "id",
    date: "asc",
  },
  token: {
    secret: process.env.TOKEN_SECRET,
    expires: process.env.TOKEN_EXPIRES,
  },
};
