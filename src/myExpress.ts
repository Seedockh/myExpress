import http from 'http';

class MyExpress {
  constructor() {

  }

  get() {
    console.log("Calling GET");
  }

  post() {
    console.log("Calling POST");
  }

  put() {
    console.log("Calling PUT");
  }

  delete() {
    console.log("Calling DELETE");
  }

  all() {
    console.log("Calling ALL");
  }

  listen() {
    console.log("Calling LISTEN");
  }

  render() {
    console.log("Calling RENDER");
  }

  use() {
    console.log("Calling USE");
  }
}

export default () => new MyExpress();
