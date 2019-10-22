import fs, { PathLike } from 'fs';
import http, { Server, RequestListener } from 'http';
import { ExpressIncomingMessage, ExpressServerResponse, ExpressMethod, ExpressProperty, ExpressSend, ExpressJson } from './types/Express';
import { DefaultCallback, RenderCallback } from './types/Callback';
import { Route } from './types/Route';
import expressMethods from './methods';

class MyExpress {
  [method:string]:ExpressMethod|ExpressProperty|any;

  public request:ExpressIncomingMessage;
  public response:ExpressServerResponse;
  private server:Server;
  private listenners:RequestListener[] = [];
  private routes:Route[] = [];

  constructor() {
    this._createMethods();
    this._initialize();
  }

  listen(port:number, host:string, callback?:()=>void):void {
    this.server.listen(port, host, callback);
  }

  render(view:string, callback:object|RenderCallback, options?:object|RenderCallback) {
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
            let renderedHTML:string = this._formatHTMLView(data.toString(), options);
            callback(null, renderedHTML);
          }
        });
      }
    } catch(err) {
      console.error(err)
    }
  }

  /**
  ** @init_server
  */
  private _initialize() {
    this.server = http.createServer((req:ExpressIncomingMessage, res:ExpressServerResponse) => {
      this.request = req;
      this.response = res;
      this.response.send = this._send;
      this.response.json = this._json;

      const routeExists = this._getCalledRoute();

      if (routeExists) {
        if (routeExists.method==='USE') {
          routeExists.callback(this.request, this.response, () => {return});
        } else {
          routeExists.callback(this.request, this.response);
        }
      } else {
        this.response.send("Error : this route is not defined.", 404);
      }
    })
  }

  /**
  ** @dynamically_creates_methods_with_the_same_pattern
  */
  private _createMethods() {
    for (const methods of expressMethods) {
      this[methods.toLowerCase()] = (path:string, clientCall:DefaultCallback):void => {
        this.routes.push({ method: methods, path: path, callback: clientCall });
      }
    }
  }

  /**
  ** @identify_current_route_with_already_set_routes
  */
  private _getCalledRoute() {
    return this.routes.find(route => {
      const { url, method } = this.request;
      return ( route.method===method ||
        route.method==='ALL' ||
        route.method==='USE') &&
      ( route.path===url ||
        route.path===this._parseQueryUrl(url, route.path) );
    });
  }

  /**
  ** @make_html_items_being_replaced_by_given_options
  */
  private _formatHTMLView(html:string, options:object) {
    const dynamicFields:string[] = html.match(/{{*.*}}/gm);
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
                html = html.replace(`{{${option}|${rule[i]}}}`, value)
              }
            } else {
              html = html.replace(`{{${option}}}`, value)
            }
          });
        })
      })
    }
    return html;
  }

  /**
  ** @parse_given_url_to_synchronize_its_parameters_with_her_route
  */
  private _parseQueryUrl(query:string, route:string) {
    let parsedUrl = '';

    // Checks for extractable parameters
    if (/:/.test(route)) {
      const urlParams = query.match(/\/[^\/]*/gi);
      const routeParams = route.match(/\/[^\/]*/gi);
      this.request.params = {};

      for (let i=0;i<urlParams.length;i++) {
        if (urlParams[i]===routeParams[i]) {
          this.request.params[routeParams[i+1].replace('/:','')] = urlParams[i+1].replace('/','');
          i++;
        }
      }
      parsedUrl = '';
      routeParams.forEach((route, index) => parsedUrl += routeParams[index])
    }

    // Checks for query paramete
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

  /**
  ** @define_send_method_for_server_response
  */
  private _send:ExpressSend = (message?:string|object, status?:number) => {
    if (!message) message = '';
    if (typeof message!=='string') message = message.toString();
    console.log(`[${status}] - ${message}`);
    this.response.write(`[${status}] - ${message}`);
    this.response.end();
  };

  /**
  ** @define_json_method_for_server_response
  */
  private _json:ExpressJson = (body:object) => {
    this.request.setEncoding('utf8');
    this.response.send(JSON.stringify(body,null,2), 200);
  };
}

export default () => new MyExpress();
