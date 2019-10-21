import http, { Server, IncomingMessage, ServerResponse } from 'http';
import fs, { PathLike } from 'fs';

export interface ExpressIncomingMessage extends IncomingMessage { }
export interface ExpressServerResponse extends ServerResponse {
  send:(message?:string|object, status?:number) => void;
  json:(body?:object) => void;
}

interface ExpressMethod {
  (path:string, clientCall:Callback):void
}
interface ExpressProperty {
  name:string | Server | Route[]
  | ((message?:string|object, status?:number)=>void)
  | ((body:object)=>void)
  | ExpressIncomingMessage | ExpressServerResponse
  | ((port:number, host:string, callback?:()=>void)=>void);
}

interface Callback {
  ( req:ExpressIncomingMessage,
    res:ExpressServerResponse,
    next?:Function
  ):void
}

interface Route {
  method:string,
  path:string,
  callback:(req:ExpressIncomingMessage, res:ExpressServerResponse, next?:Function)=>void;
}

class MyExpress {
  [method:string]:ExpressMethod|ExpressProperty|any;
  private server:Server;
  private routes:Route[] = [];
  private _send:(message?:string|object, status?:number)=>void = (message?:string|object, status?:number) => {
    if (!message) message = '';
    if (typeof message!=='string') message = message.toString();
    console.log(`[${status}]::${message}`);
    this.response.write(message);
    this.response.end();
  };
  private _json:(body:object)=>void = (body:object) => {
    this.request.setEncoding('utf8');
    this.response.send(JSON.stringify(body,null,2), 200);
  };

  public request:ExpressIncomingMessage;
  public response:ExpressServerResponse;

  constructor() {
    this._createMethods();
    this._initialize();
  }

  private _initialize() {
    this.server = http.createServer((req:ExpressIncomingMessage, res:ExpressServerResponse) => {
      this.request = req;
      this.response = res;
      this.response.send = this._send;
      this.response.json = this._json;

      const { url, method } = this.request;
      const routeExists = this.routes.find(currentRoute =>
        ( currentRoute.method === method  ||
          currentRoute.method === 'ALL' ||
          currentRoute.method === 'USE' ) &&
        currentRoute.path === url
      );

      if (routeExists) {
        if (routeExists.method === 'USE') {
          routeExists.callback(this.request, this.response, this.request.resume);
        } else {
          routeExists.callback(this.request, this.response);
        }
      } else {
        this.response.send("Error : this route is not defined.", 404);
      }
    })
  }

  private _createMethods() {
    for (const methods of ['GET', 'POST', 'PUT', 'DELETE']) {
      this[methods.toLowerCase()] = (path:string, clientCall:Callback):void => {
        this.routes.push({ method: methods, path: path, callback: clientCall });
      }
    }
  }

  all(path:string, clientCall:Callback):void {
    this.routes.push({ method: "ALL", path: path, callback: clientCall });
  }

  listen(port:number, host:string, callback?:()=>void):void {
    this.server.listen(port, host, callback);
  }

  use( path:string, clientCall:Callback) {
    this.routes.push({ method: "USE", path: path, callback: clientCall });
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
}

export default () => new MyExpress();
