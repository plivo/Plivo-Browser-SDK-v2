require("dotenv").config();

const env_keys = Object.keys(process.env);

const env = {};

env_keys.forEach((item) => {
  env[item] = process.env[item];
});

export default env;
