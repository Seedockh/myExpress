# myExpress
The purpose of this challenge is to (re)create a HTTP client server. Using TypeScript and the http node package

https://github.com/makiboto/myExpress


# Author
{
  "username": "pierre hérissé"
}

# Steps 

  - [X] Use default Express top-level implementation 
  - [X] Define `app.get()`
  - [X] Define `app.post()`
  - [X] Define `app.put()`
  - [X] Define `app.delete()`
  - [X] Define `app.all()`
  - [X] Define `app.render()`
  - [X] Create template engine with `{{ }}`
  - [X] Add modifier with `{{ | }}` for `upper`, `lower`
  - [ ] Add `fixed:n` modifier
  - [ ] Define `app.use()`
  - [ ] Handle query parameters sent by client
  - [ ] Bonus: add if/else, for/loops etc. in template engine
  - [ ] Add more `express` features
    

# Default HomePage

## Template render

```js
app.render('index', {name: 'myExpress', author: 'Pierre Hérissé', serverName: 'myExpress'}, (err, html) => {
  // some things here
})  
```

## Template values
```html
<h1>🛠 {{name}} toolbox 🛠</h1>
```

```html
<h2>SEND REQUESTS TO {{serverName|upper}}</h2>
```

```html
<code>Author: {{author|lower}}</code>
```

## View

![https://image.noelshack.com/fichiers/2019/43/1/1571642692-screenshot-from-2019-10-21-09-24-24.png](https://image.noelshack.com/fichiers/2019/43/1/1571642692-screenshot-from-2019-10-21-09-24-24.png)


## Queries

You can query the **Server** directly from the **View** (thanks to `XMLHttpRequest()`), by typing the route path. **Client** will send it with the corresponding *method*.

![https://image.noelshack.com/fichiers/2019/43/1/1571650128-screenshot-from-2019-10-21-11-28-30.png](https://image.noelshack.com/fichiers/2019/43/1/1571650128-screenshot-from-2019-10-21-11-28-30.png)


## Parameters

You can send **parameters** directly through the URL, with 2 methods :

#### /path/:parameter :

```js
app.get('/user/:user_id/vehicle/:color', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  const { user_id, color } = req.params;
  res.json({ message: `The user ${user_id} has a ${color} vehicle.` });
  res.end();
})
```

![https://image.noelshack.com/fichiers/2019/43/2/1571738290-screenshot-from-2019-10-22-11-57-45.png](https://image.noelshack.com/fichiers/2019/43/2/1571738290-screenshot-from-2019-10-22-11-57-45.png)

#### ?parameter=value

```js
app.post('/users', (req:ExpressIncomingMessage, res:ExpressServerResponse) => {
  res.json(req.qParams);
  res.end();
})
```

![https://image.noelshack.com/fichiers/2019/43/2/1571745848-screenshot-from-2019-10-22-14-03-45.png](https://image.noelshack.com/fichiers/2019/43/2/1571745848-screenshot-from-2019-10-22-14-03-45.png)


