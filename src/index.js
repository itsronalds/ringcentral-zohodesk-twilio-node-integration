const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.get('/webhook', (req, res) => {
  res.status(200).json({ message: '¡Successfully integration!' });
});

app.listen(process.env.PORT, () => console.log(`Server on port: ${process.env.PORT}`));
