import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Routes from './api';
import { sequelize } from './configs';
import { GlobalReqStore } from './api/middlewares/golbalReqStore';
import { ICredentialTokenPayload } from './api/modules/credentials/types';

const {MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_ROOT_PASSWORD, DB_HOST, DB_PORT} = process.env;

const app = express();
app.use(GlobalReqStore);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('👍 Hello from TubeManager API!');
});

const PORT = process.env.PORT || 9050;
app.listen(PORT, () => {
  console.log(`👍 Backend Server running on port ${PORT}`);
});

app.use('/v1', Routes());

(async () => {
  try {
    if(!MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE || !MYSQL_ROOT_PASSWORD || !DB_HOST || !DB_PORT) throw new Error("❌ One or more DB environment variables are missing, kindly check!");
    await sequelize.sync({alter: true});
    console.log("✅ Database connection was successful");
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();

  // app.all('*', (req, _res, next) => {
  //   next();
  // });

  declare global {
    namespace Express {
      interface Request {
        auth?: ICredentialTokenPayload
      }
    }
  }
