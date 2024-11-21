import EditorJS, { OutputData, ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header"
import Paragraph from "@editorjs/paragraph";
import { IPage, Page } from "../page";
import { Channel } from "../../common/com"
import { CategoryTree, StoreData } from "../../common/common"
import { GlobalData } from "../web/wfactory";


export default class Main extends Page implements IPage {
    editor?: EditorJS

    constructor(private ipc: Channel, private data: GlobalData) {
        super("views/main.html")
        ipc.RegisterMsgHandler("saveResult", (ret: boolean) => {
            if (ret) {
                const out = document.getElementById("output") as HTMLDivElement
                out.innerText = "save complete"
                this.ipc.SendMsg("getPostList");
            }
        })
        ipc.RegisterMsgHandler("PostList", (ret: StoreData[]) => {
            this.data.posts = ret
            this.data.posts.forEach((post) => {
                console.log(post.title)
            })
            this.drawPosts()
        })
    }
    drawPosts() {
        let html = ""
        this.data.posts.forEach((post, i) => {
            html += `<a id="post-${i}">${post.title}</a><br>`
        })
        const dom = document.getElementById("filelist")
        if (dom) dom.innerHTML = html

        this.data.posts.forEach((post, i) => {
            const pdom = document.getElementById(`post-${i}`)
            if (pdom) pdom.onclick = () => {
                this.modifyMode(post)
            }
        })
    }
    StartUpdate() {
        let html = ""
        const tmpMap = new Map<string, StoreData>()
        this.data.posts.forEach((post) => {
            tmpMap.set(post.id ?? "1", post)
        })
        for(const node of this.data.root.children){
            html += this.UpdateCategory(tmpMap, node, 0)
        }
        for (const [id, post] of tmpMap) {
            html += `<a id="post-${id}">${post.title}</a><br>`
        }

        const dom = document.getElementById("filelist")
        if (dom) dom.innerHTML = html
        
        this.data.posts.forEach((post) => {
            const pdom = document.getElementById(`post-${post.id}`)
            if (pdom) pdom.onclick = () => {
                this.modifyMode(post)
            }
        })
    }
    UpdateCategory(m: Map<string, StoreData>, node: CategoryTree, depth: number): string {
        let html = "&nbsp;".repeat(depth)
        html += `<a id="category-${node.id}">${node.title}</a> <a id="catedel-${node.id}">X</a><br>`
        for(const id of node.postIds) {
            const post = m.get(id)
            if(!post) continue
            html += "&nbsp;".repeat(depth + 1)
            html += `<a id="post-${id}">${post.title}</a><br>`
            m.delete(id)
        }
        for(const child of node.children){
            html += this.UpdateCategory(m, child, depth + 1)
        }
        return html
    }
    modifyMode(post: StoreData) {
        const titleDom =document.getElementById("title") as HTMLInputElement
        const dom = document.getElementById("postmode")
        if (dom) dom.innerText = 'Modify Post'
        titleDom.value = post.title
        this.editor?.render(JSON.parse(post.data))

        const out = document.getElementById("output") as HTMLDivElement
        const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement
        if (saveBtn) saveBtn.onclick = () => {
            if (!this.editor || !titleDom.value.length) return
            out.innerText = "save"
            this.editor.save()
                .then((saveData: OutputData) => {
                    const data = JSON.stringify(saveData, null, 2)
                    out.innerText = data
                    post.data = data
                    this.ipc.SendMsg("modifyPost", post);
                })
        }
        this.ipc.SendMsg("getPostList");

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
        await this.LoadHtml()
        this.InitBinding()

        return false
    }
    Release(): void {

    }
}