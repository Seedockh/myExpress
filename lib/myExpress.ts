import fs, { PathLike } from 'fs';
import http, { Server } from 'http';
import { ExpressIncomingMessage, ExpressServerResponse, ExpressMethod, ExpressProperty, ExpressSend, ExpressJson } from './types/Express';
import { DefaultCallback, RenderCallback } from './types/Callback';
import { Route } from './types/Route';

class MyExpress {
  [method:string]:ExpressMethod|ExpressProperty|any;

  public request:ExpressIncomingMessage;
  public response:ExpressServerResponse;

  private server:Server;
  private routes:Route[] = [];
  private _send:ExpressSend = (message?:string|object, status?:number) => {
    if (!message) message = '';
    if (typeof message!=='string') message = message.toString();
    console.log(`[${status}]::${message}`);
    this.response.write(message);
    this.response.end();
  };
  private _json:ExpressJson = (body:object) => {
    this.request.setEncoding('utf8');
    this.response.send(JSON.stringify(body,null,2), 200);
  };

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

      console.log(url);

      if (routeExists) {
        if (routeExists.method === 'USE') {
          routeExists.callback(this.request, this.response, () => {return});
        } else {
          routeExists.callback(this.request, this.response);
        }
      } else {
        this.response.send("Error : this route is not defined.", 404);
      }
    })
  }

  private _createMethods() {
    for (const methods of ['GET', 'POST', 'PUT', 'DELETE', 'ALL', 'USE']) {
      this[methods.toLowerCase()] = (path:string, clientCall:DefaultCallback):void => {
        this.routes.push({ method: methods, path: path, callback: clientCall });
      }
    }
  }

  listen(port:number, host:string, callback?:()=>void):void {
    this.server.listen(port, host, callback);
  }

  render(
    view:string,
    callback:object|RenderCallback,
    options?:object|RenderCallback )
  {
    if (typeof callback==='object') {
      const backupDefaultCallback = options;
      options = callback;
      callback = backupDefaultCallback;
    }

    try {
      if (fs.existsSync(`./pages/${view}.html`)) {
        fs.readFile(`./pages/${view}.html`, (err:NodeJS.ErrnoException, data:Buffer) => {
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
