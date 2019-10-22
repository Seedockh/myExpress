import express from './lib/myExpress';
import { ExpressServerResponse, ExpressIncomingMessage } from './lib/types/Express';

const app = express();
const port = 1337;
const host = '127.0.0.1';

app.all('/all', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ all: `This is the response from ${req.method} on /all routes.` });
})

app.use('/use', (req:ExpressIncomingMessage, res:ExpressServerResponse, next:Function) => {
  res.json({ use: `[TIME:${Date.now()}]-This is the response from ${req.method} on /use routes.` })
  next();
})

app.get('/', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  app.render('index', {name: 'myExpress', author: 'Pierre Hérissé', serverName: 'localhost',  weight: 13.36666666666666}, (err, html) => {
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

app.get('/user/:user_id/vehicle/:color', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  const { user_id, color } = req.params;
  res.json({ message: `The user ${user_id} has a ${color} vehicle.` });
  res.end();
})

app.post('/api', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json({ post: 'This is the response from a POST /api request.' });
  res.end();
})

app.post('/users', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json(req.qParams);
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
