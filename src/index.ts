import express, { Application } from 'express';
import bodyParser from 'body-parser';

import { getOpenGraphTags } from './scrappers';

const app: Application = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/scrapper', async (req: any, res) => {
  const response = await getOpenGraphTags({ url: decodeURI(req.query.url) });
  res.status(200).send({ data: response });
});

try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}
