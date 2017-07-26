if (process.env.DATABASE_URL === undefined) {
  console.log('DATABASE_URL not found, loading from .env file if present');

  let dotenv = require('dotenv');
  dotenv.load();
  if (process.env.DATABASE_URL === undefined) {
    // console.log('DATABASE_URL not found in .env file, exiting');
    throw('DATABASE_URL not found in .env file, exiting');
  } else {
    console.log('connecting to database: ', process.env.DATABASE_URL)
  }

} else {
  console.log('process.env.DATABASE_URL', process.env.DATABASE_URL);
}

module.exports = {
  "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  },
  "test": {
    "database": "law_map_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  }
};
