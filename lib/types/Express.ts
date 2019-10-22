import { Server, ServerResponse, IncomingMessage } from 'http';
import { Route } from './Route'
import { DefaultCallback } from './Callback';

export interface ExpressIncomingMessage extends IncomingMessage { }
export interface ExpressServerResponse extends ServerResponse {
  send:(message?:string|object, status?:number) => void;
  json:(body?:object) => void;
}

export interface ExpressMethod {
  (path:string, clientCall:DefaultCallback):void
}

export interface ExpressProperty {
  name:string | Server | Route[]
  | ((message?:string|object, status?:number)=>void)
  | ((body:object)=>void)
  | ExpressIncomingMessage | ExpressServerResponse
  | ((port:number, host:string, callback?:()=>void)=>void);
}

export interface ExpressSend {
  ( message?:string|object,
    status?:number
  ):void
}

export interface ExpressJson {
  (body:object):void
}
