import EditorJS, { OutputData, ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header"
import Paragraph from "@editorjs/paragraph";
import { IPage, Page } from "../page";
import { Channel } from "../../common/com"
import { StoreData } from "../../common/common"


export class Main extends Page implements IPage {
    editor?: EditorJS
    posts: StoreData[] = []

    constructor(private ipc: Channel) {
        super("views/main.html")
        ipc.RegisterMsgHandler("saveResult", (ret: boolean) => {
            if (ret) {
                const out = document.getElementById("output") as HTMLDivElement
                out.innerText = "save complete"
                this.ipc.SendMsg("getPostList");
            }
        })
        ipc.RegisterMsgHandler("PostList", (ret: StoreData[]) => {
            this.posts = ret
            this.posts.forEach((post) => {
                console.log(post.title)
            })
            this.drawPosts()
        })
    }
    drawPosts() {
        let html = ""
        this.posts.forEach((post, i) => {
            html += `<a id="post-${i}">${post.title}</a><br>`
        })
        const dom = document.getElementById("filelist")
        if (dom) dom.innerHTML = html

        const titleDom =document.getElementById("title") as HTMLInputElement
        this.posts.forEach((post, i) => {
            const pdom = document.getElementById(`post-${i}`)
            if (pdom) pdom.onclick = () => {
                titleDom.value = post.title
                this.editor?.render(JSON.parse(post.data))
                this.modifyMode(post)
            }
        })
    }
    modifyMode(post: StoreData) {
    }
    InitBinding() {
        if (!this.editor) this.editor = new EditorJS({
            autofocus: true,
            holder: "editorjs",
            tools: {
                header: {
                    class: Header as unknown as ToolConstructable,
                    inlineToolbar: true,
                },
                paragraph: {
                    class: Paragraph as unknown as ToolConstructable,
                    inlineToolbar: true,
                }
            },
            onReady: () => {
                const editcss = document.getElementById("editorjs")
                if (editcss) editcss.style.width = "100%"
            }
        })
        const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement
        const out = document.getElementById("output") as HTMLDivElement
        const titleDom =document.getElementById("title") as HTMLInputElement
        out.innerText = "new post ready"
        if (saveBtn) saveBtn.onclick = () => {
            if (!this.editor || !titleDom.value.length) return

            out.innerText = "save"
            this.editor.save()
                .then((saveData: OutputData) => {
                    const data = JSON.stringify(saveData, null, 2)
                    out.innerText = data
                    const storeData: StoreData = {
                        title: titleDom.value,
                        date: Date.now(),
                        data: data
                    }
                    this.ipc.SendMsg("savePost", storeData);
                })
        }
        this.ipc.SendMsg("getPostList");
    }
    async Run(): Promise<boolean> {
        await this.LoadHtml().then(() => {
            this.InitBinding()
        })

        return false
    }
    Release(): void {

    }
}