import { Sequelize } from '@sequelize/core';

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT)
  throw new Error(
    `DB env variables are missing, required variables are - DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT`,
  );

export const sequelize = new Sequelize({
  dialect: "postgres",
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  logging: false,
  retry: {
    max: 3,
  },
  pool: {
    max: 3, // Reduce max connections per pod
    min: 1,
    acquire: 20000, // Allow longer time to acquire a connection
    idle: 5000, // Reduce idle time to free up connections faster
  },
});


