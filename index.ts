import express, { ExpressServerResponse, ExpressIncomingMessage } from './lib/myExpress';

const app = express();
const port = 1337;
const host = '127.0.0.1';

app.all('/all', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ all: `This is the response from ${req.method} on /all routes.` });
  res.end();
})

app.use('/use', (req, res, next) => {
  res.json({ use: `[TIME:${Date.now()}]-This is the response from ${req.method} on /use routes.` })
  next();
})

app.get('/', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  app.render('index', {name: 'myExpress', author: 'Pierre Hérissé', serverName: 'myExpress'}, (err, html) => {
    res.setHeader('Content-Type', 'text/html');
    res.write(html)
    res.json({ get: 'This is the response from a GET / request.' });
    res.end();
  });
})

app.get('/home', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ get: 'This is the response from a GET /home request.' });
  res.end();
})

app.get('/api', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ get: 'This is the response from a GET /api request.' });
  res.end();
})

app.post('/api', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ post: 'This is the response from a POST /api request.' });
  res.end();
})

app.put('/api', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ put: 'This is the response from a PUT /api request.' });
  res.end();
})

app.delete('/api', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ delete: 'This is the response from a DELETE /api request.' });
  res.end();
})

app.listen(port, host, () => {
  console.log(`This server is now listening on http://${host}:${port}`);
});
