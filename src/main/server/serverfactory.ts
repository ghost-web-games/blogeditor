import { Server } from "./server";


export class ServerFactory {
    server = new Server()
    constructor() {
    }
    GetMainProcess() {
        return this.server
    }
}