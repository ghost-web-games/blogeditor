export type Handler = { [key: string]: Function }
export type S2CMsg = { types: string, params: any }
export type C2SMsg = { types: string, params: any[] }

export class Socket {
    m_opend: boolean;
    m_ws: WebSocket;
    m_handler: Handler;
    
    public constructor() {
        this.m_ws = new WebSocket(`ws://${window.location.hostname}:8091`);
        this.m_opend = false;
        this.m_handler = {};

        this.m_ws.onopen = () => {
            this.m_opend = true;
            this.m_ws.onmessage = (evt) => {
                const msg: S2CMsg = JSON.parse(evt.data);
                switch (msg.types) {
                    case "gwserr":
                    case "gwsout":
                        break;
                    default:
                        console.log(evt.data);
                        break;
                }
                this.m_handler[msg.types](msg.params);
            }
        };
        this.m_ws.onclose = () => {
            this.m_handler["close"]();
        }
    }

    public RegisterMsgHandler(eventName: string, callback: any) {
        this.m_handler[eventName] = (params: any) => {
            callback(params);
        }
    }

    public SendMsg(eventName: string, ...params: any[]) {
        const msg: C2SMsg = {
            types: eventName,
            params: [...params],
        }
        this.m_ws.send(JSON.stringify(msg))
    }
}