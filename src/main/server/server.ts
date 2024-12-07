import { MainProcess } from "../index"
import fs from 'fs'
import http from 'http'
import { WebSocketServer } from 'ws'
import { Handler, C2SMsg } from "../../common/com"
import { Mime } from "mime"
import path from "path"
import FileManager from './filemanager'
import { CategoryTree, StoreData } from "../../common/common"
import Busboy from 'busboy'

const mime = new Mime()
const port = 8020
const categoryFileName = "category.json"

export class Server implements MainProcess {
    fileMgr = new FileManager("./posts")
    server = http.createServer(function (
        req: http.IncomingMessage, res: http.ServerResponse) {
        let url = req.url
        if (req.method === 'POST' && req.url === '/uploads') {
            const busboy = Busboy({ headers: req.headers });

            // 업로드할 디렉토리 경로
            const uploadDir = './src/renderer/uploads';
            let gfilename = ""

            // 업로드된 파일을 처리하는 로직
            busboy.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: any) => {
                const { filename, encoding, mimetype } = info
                console.log(`Field name: ${fieldname}`);
                console.log(`Filename: ${filename}, encoding: ${encoding}`);
                console.log(`Mimetype: ${mimetype}`);
                gfilename = filename

                // 파일을 저장할 경로 설정
                const filePath = path.join(uploadDir, filename);
                const writeStream = fs.createWriteStream(filePath);

                // 파일을 writeStream에 파이프하여 저장
                file.pipe(writeStream);

                writeStream.on('finish', () => {
                    console.log(`File uploaded to: ${filePath}`);
                });
            });

            // 폼 필드 데이터를 처리
            busboy.on('field', (fieldname: string, val: string) => {
                console.log(`Field name: ${fieldname}, Value: ${val}`);
            });

            // 업로드 완료 후 호출되는 이벤트
            busboy.on('finish', () => {
                //const fullUrl = "http://" + req.headers.host + "/" + path.join("./uploads", gfilename)
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify({
                    success:1,
                    file: {
                        url: path.join("./uploads", gfilename),
                    }
                }));
            });

            // 요청 본문을 busboy로 파이프
            req.pipe(busboy);
        } else {

            if (req.url == '/' || req.url?.startsWith("/?")) {
                url = '/index.html'
            }
            try {
                const type = mime.getType("." + url)
                if (type) res.setHeader("Content-Type", type)
                const file = fs.readFileSync(path.join("./src/renderer", url ?? ""))
                res.writeHead(200)
                res.end(file)
            } catch (err) {
                console.log(err)
                res.writeHead(404)
                res.end()
            }
        }
    })
    postfiles: string[] = []
    posts: StoreData[] = []
    categoryRoot?: CategoryTree
    async LoadFiles() {
        this.postfiles = await this.fileMgr.listFiles()
        console.log(this.postfiles)
        this.posts.length = 0
        this.postfiles.forEach(async (f) => {
            if (f == "category.json") return
            const data = await this.fileMgr.readFile<StoreData>(f)
            console.log("Title: ", data.title)
            this.posts.push(data)
        })
        if (await this.fileMgr.fileExists(categoryFileName)) {
            this.categoryRoot = await this.fileMgr.readFile<CategoryTree>(categoryFileName)
        }
    }
    OnCreate(): void {
        const wss = new WebSocketServer({ port: port + 1 })
        const g_handler: Handler = {
            "savePost": async (ws: any, data: StoreData) => {
                try {
                    data.id = `${Date.now()}_${this.postfiles.length + 1}`
                    await this.fileMgr.saveFile(`${data.id}.json`, data)
                    this.LoadFiles()
                } catch (err) {
                    ws.send(JSON.stringify({ types: "saveResult", params: false }));
                }
                ws.send(JSON.stringify({ types: "saveResult", params: true }));
            },
            "modifyPost": async (ws: any, data: StoreData) => {
                try {
                    const filename = `${data.id}.json`
                    if (await this.fileMgr.fileExists(filename)) {
                        await this.fileMgr.saveFile(`${data.id}.json`, data)
                    } else {
                        throw new Error("not exist file: " + filename);
                    }
                    this.LoadFiles()
                } catch (err) {
                    ws.send(JSON.stringify({ types: "saveResult", params: false }));
                }
                ws.send(JSON.stringify({ types: "saveResult", params: true }));
            },
            "deletePost": async (ws: any, data: StoreData) => {
                try {
                    const filename = `${data.id}.json`
                    if (await this.fileMgr.fileExists(filename)) {
                        await this.fileMgr.deleteFile(`${data.id}.json`)
                    } else {
                        throw new Error("not exist file: " + filename);
                    }
                    this.LoadFiles()
                } catch (err) {
                    ws.send(JSON.stringify({ types: "saveResult", params: false }));
                }
                ws.send(JSON.stringify({ types: "saveResult", params: true }));
            },
            "getPostList": (ws: any) => {
                ws.send(JSON.stringify({ types: "PostList", params: this.posts }));
            },
            "getcategorytree": (ws: any) => {
                if (this.categoryRoot)
                    ws.send(JSON.stringify({ types: "categorytree", params: this.categoryRoot }));
            },
            "setcategorytree": async (ws: any, category: CategoryTree) => {
                this.categoryRoot = category
                await this.fileMgr.saveFile(categoryFileName, category)
                ws.send(JSON.stringify({ types: "categorytree", params: this.categoryRoot }));
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
        this.LoadFiles()
    }
    OnRun(): void {
        this.server.listen(port)
    }
}
