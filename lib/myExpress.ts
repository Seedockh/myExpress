import http, { Server, IncomingMessage, ServerResponse } from 'http';
import fs, { PathLike } from 'fs';

interface ExpressServerResponse extends ServerResponse {
  send:(message:string|object, status?:number) => void;
  json:(body?:object) => void;
}

interface Route {
  method:string,
  path:string,
  callback:(req:IncomingMessage, res:ExpressServerResponse)=>void;
}

class MyExpress {
  public server:Server;
  public request:IncomingMessage;
  public response:ExpressServerResponse;
  public routes:Array<Route> = [];

  constructor() {
    this.server = http.createServer((req:IncomingMessage, res:ExpressServerResponse) => {
      this.request = req;
      this.response = res;

      // Adding method .send() to ServerResponse object
      this.response.send = (message:string|object, status:number) => {
        if (typeof message!=='string') message = message.toString();
        console.log(`[${status}]::${message}`);
        this.response.write(message);
        this.response.end();
      };

      // Adding method .json() to ServerResponse object
      this.response.json = (body:object) => {
        this.request.setEncoding('utf8');
        this.response.send(JSON.stringify(body,null,2), 200);
      };

      // Looking for the requested route
      const { url, method } = this.request;
      const routeExists = this.routes.find(currentRoute =>
        ( currentRoute.method === method  ||
          currentRoute.method === 'ALL' ||
          currentRoute.method === 'USE' ) &&
        currentRoute.path === url
      );

      if (routeExists) {
        routeExists.callback(this.request, this.response);
      } else {
        this.response.send("Error : this route is not defined.", 404);
      }
    })
  }

  get(path:string, clientCall:(req:IncomingMessage, res:ExpressServerResponse)=>void):void {
    this.routes.push({ method: "GET", path: path, callback: clientCall });
  }

  post(path:string, clientCall:(req:IncomingMessage, res:ExpressServerResponse)=>void):void {
    this.routes.push({ method: "POST", path: path, callback: clientCall });
  }

  put(path:string, clientCall:(req:IncomingMessage, res:ExpressServerResponse)=>void):void {
    this.routes.push({ method: "PUT", path: path, callback: clientCall });
  }

  delete(path:string, clientCall:(req:IncomingMessage, res:ExpressServerResponse)=>void):void {
    this.routes.push({ method: "DELETE", path: path, callback: clientCall });
  }

  all(path:string, clientCall:(req:IncomingMessage, res:ExpressServerResponse)=>void):void {
    this.routes.push({ method: "ALL", path: path, callback: clientCall });
  }

  listen(port:number, host:string, callback?:()=>void):void {
    this.server.listen(port, host, callback);
  }

  render(
    view:string,
    callback:object|((err:Error, html:string)=>void),
    options?:object|((err:Error, html:string)=>void) )
  {
    if (typeof callback==='object') {
      const backupCallback = options;
      options = callback;
      callback = backupCallback;
    }

    try {
      if (fs.existsSync(`./pages/${view}.html`)) {
        fs.readFile(`./pages/${view}.html`, (err:NodeJS.ErrnoException, data:any) => {
          if (typeof callback!=='object') {
            if (err) return callback(err, null);

            let renderedHTML:string = data.toString();
            const dynamicFields:string[] = renderedHTML.match(/{{*.*}}/gm);
            let instructions:Array<string[]> = [];

            if (typeof options==='object') {
              dynamicFields.forEach( (field:string) => {
                if (/|/.test(field)) {
                  field = field.replace('{{','').replace('}}','');
                  instructions.push(field.split('|'));
                }
                Object.keys(options).map((option,index) => {
                  let value = options[option];

                  instructions.forEach( rule => {
                    if (rule[0]===option && rule.length>1) {
                      for (let i=1; i<rule.length; i++) {
                        switch(rule[i]) {
                          case 'upper':
                            value = value.toUpperCase();
                            break;
                          case 'lower':
                            value = value.toLowerCase();
                            break;
                          default: break;
                        }
                        renderedHTML = renderedHTML.replace(`{{${option}|${rule[i]}}}`, value)
                      }
                    } else {
                      renderedHTML = renderedHTML.replace(`{{${option}}}`, value)
                    }
                  });
                })
              })
            }
            callback(null, renderedHTML);
          }
        });
      }
    } catch(err) {
      console.error(err)
    }
  }

  use() {
    console.log("Calling USE");
  }
}

export default () => new MyExpress();
