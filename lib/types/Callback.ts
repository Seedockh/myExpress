import { ExpressIncomingMessage, ExpressServerResponse } from './Express';

export interface DefaultCallback {
  ( req:ExpressIncomingMessage,
    res:ExpressServerResponse,
    next?:Function
  ):void
}

export interface RenderCallback {
  ( err:Error,
    html:string
  ):void
}
