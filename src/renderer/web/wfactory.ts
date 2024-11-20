import { Socket } from "./wsocket";
import { Main } from "../pages/main"
import { FuncMap } from "../index"

export class Factory {
    socket: Socket;
    main: Main


    public constructor() {
        this.socket = new Socket()
        this.main = new Main(this.socket)
    }

    public Build(): FuncMap {

        const funcMap: FuncMap = {
            "main": this.main,
        };
        return funcMap;
    }

    /*
    public GetBlockStore(): BlockStore { return this.m_blockStore; }
    public GetSession(): Session { return this.m_session; }
    get Logs(): Logger { return this.m_logs }
    */
}