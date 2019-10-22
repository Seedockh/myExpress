import fs, { PathLike } from 'fs';
import http, { Server } from 'http';
import { ExpressIncomingMessage, ExpressServerResponse, ExpressMethod, ExpressProperty, ExpressSend, ExpressJson } from './types/Express';
import { DefaultCallback, RenderCallback } from './types/Callback';
import { Route } from './types/Route';
import expressMethods from './methods';

class MyExpress {
  [method:string]:ExpressMethod|ExpressProperty|any;

  public request:ExpressIncomingMessage;
  public response:ExpressServerResponse;
  private server:Server;
  private routes:Route[] = [];

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

      const routeExists = this.routes.find(currentRoute => {
        const { url, method } = this.request;

        console.log(currentRoute);
        console.log(method);
        console.log(url);
        console.log(this._parseQueryUrl(url,currentRoute.path));

        return ( currentRoute.method===method ||
          currentRoute.method==='ALL' ||
          currentRoute.method==='USE') &&
        ( currentRoute.path===url ||
          currentRoute.path===this._parseQueryUrl(url,currentRoute.path) );
      });

      if (routeExists) {
        switch (routeExists.method) {
          case 'USE':
            routeExists.callback(this.request, this.response, () => {return});
            break;
          default:
            routeExists.callback(this.request, this.response);
            break;
        }
      } else {
        this.response.send("Error : this route is not defined.", 404);
      }
    })
  }

  private _createMethods() {
    for (const methods of expressMethods) {
      this[methods.toLowerCase()] = (path:string, clientCall:DefaultCallback):void => {
        this.routes.push({ method: methods, path: path, callback: clientCall });
      }
    }
  }

  private _parseQueryUrl(query:string, route:string) {
    let parsedUrl = '';

    if (/:/.test(route)) {
      const urlParams = query.match(/\/[^\/]*/gi);
      const routeParams = route.match(/\/[^\/]*/gi);
      this.request.params = {};

      for (let i=0;i<urlParams.length;i++) {
        if (urlParams[i]===routeParams[i]) {
          this.request.params[routeParams[i+1].replace('/:','')] = urlParams[i+1].replace('/','');
          //parsedUrl = query.replace(routeParams[i+1], urlParams[i+1]);
          console.log(parsedUrl);
          i++;
        }
      }
      parsedUrl = '';
      routeParams.forEach((route, index) => parsedUrl += routeParams[index])
    }

    if (/\?/.test(query)) {
      const baseUrl = query.split('?')[0];
      const rawParams = query.split('?')[1].split('&');
      let params:{[x:string]: string} = {};
      rawParams.forEach( param => params[param.split('=')[0]] = param.split('=')[1] );

      this.request.qParams = params;
      parsedUrl = baseUrl;
    }

    return parsedUrl;
  }

  private _send:ExpressSend = (message?:string|object, status?:number) => {
    if (!message) message = '';
    if (typeof message!=='string') message = message.toString();
    console.log(`[${status}] - ${message}`);
    this.response.write(`[${status}] - ${message}`);
    this.response.end();
  };

  private _json:ExpressJson = (body:object) => {
    this.request.setEncoding('utf8');
    this.response.send(JSON.stringify(body,null,2), 200);
  };

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
