import express from './src/myExpress';

const app = express();

app.get('/', (req, res) => {
  app.render('index', {name: 'myExpress', author: 'Pierre Hérissé', serverName: 'myExpress'}, (err, html) => {
      res.setHeader('Content-Type', 'text/html');
      res.write(html)
      res.json({ get: 'This is the response from a GET / request.' });
      res.end();
  });
})

app.all('/api', (req, res) => {
  console.log('creating /api all()');
})

app.get('/home', (req, res) => {
  res.json({ get: 'This is the response from a GET HOME request.' });
  res.end();
})

app.get('/api', (req, res) => {
  res.json({ get: 'This is the response from a GET API request.' });
  res.end();
})

app.post('/api', (req, res) => {
  res.json({ post: 'This is the response from a POST API request.' });
  res.end();
})

app.put('/api', (req, res) => {
  res.json({ put: 'This is the response from a PUT API request.' });
  res.end();
})

app.delete('/api', (req, res) => {
  res.json({ delete: 'This is the response from a DELETE API request.' });
  res.end();
})

app.listen(1337, '127.0.0.1');
