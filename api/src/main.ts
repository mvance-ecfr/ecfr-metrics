import express from 'express';
import { getDates, getMetrics } from 'db';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.get('/', (req, res) => {
  res.send('eCFR Metrics API is live');
});

app.get('/metrics/dates/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const metrics = await getMetrics(date);
    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

app.get('/metrics/dates', async (req, res) => {
  res.json(await getDates());
});

app.get('/metrics', async (req, res) => {
  res.json(await getMetrics());
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
