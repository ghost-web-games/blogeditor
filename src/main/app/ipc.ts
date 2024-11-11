import { ipcRenderer } from "electron"; // ES import 

export class Ipc {
    public RegisterMsgHandler(eventName: string, params: any) {
        ipcRenderer.on(eventName, (_: any, args: any) => {
            params(args)
        });
    }

    public SendMsg(eventName: string, ...params: any[]) {
        ipcRenderer.send(eventName, ...params);
    }
}