import { ExpressIncomingMessage, ExpressServerResponse } from './Express'

export interface Route {
  method:string,
  path:string,
  callback:(req:ExpressIncomingMessage, res:ExpressServerResponse, next?:Function)=>void;
}
