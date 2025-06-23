
// backend/server.js
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { readFile, utils } from 'xlsx';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/upload', upload.single('file'), (req, res) => {
  const workbook = readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = utils.sheet_to_json(sheet);

  const summary = {
    rowCount: data.length,
    columns: Object.keys(data[0] || {}),
  };

  res.json({ summary, data });
});

app.listen(5000, () => console.log('Server running on port 5000'));
