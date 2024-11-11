import { MainProcess } from "../index"
import fs from 'fs'
import http from 'http'
import { WebSocketServer } from 'ws'
import { Handler, C2SMsg } from "./socket"
import { Mime } from "mime"
import path from "path"

const mime = new Mime()

export class Server implements MainProcess {
    server = http.createServer(function (
        req: http.IncomingMessage, res: http.ServerResponse) {
            let url = req.url
            if(req.url == '/' || req.url?.startsWith("/?")) {
                url = '/index.html'
            }
            try {
                const type = mime.getType("." + url)
                if (type) res.setHeader("Content-Type", type)
                const file = fs.readFileSync(path.join("./src/renderer", url ?? ""))
                res.writeHead(200)
                res.end(file)
            } catch(err) {
                console.log(err)
                res.writeHead(404)
                res.end()
            }
        })
    port = 8020
    OnCreate(): void {
        const wss = new WebSocketServer({ port: this.port + 1 })
        const g_handler: Handler = {
            "test" : () =>{

            }
        }
        wss.on("connection", (ws: any) => {
            console.log("connect")
            ws.on("message", (data: any) => {
                const msg: C2SMsg = JSON.parse(data)
                g_handler[msg.types](ws, ...msg.params)
            })
            ws.on("close", () => {
                console.log("disconnect")
            })
            ws.onerror = function () {
                console.log("error occurred")
            }
        })
        
    }
    OnRun(): void {
        this.server.listen(this.port)
    }
}