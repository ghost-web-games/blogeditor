import { IPage, Page } from "../page";
import { Channel } from "../../common/com"
import { CategoryTree, StoreData } from "../../common/common"
import { GlobalData } from "../web/wfactory";
import CategoryView from "./cateview";

export default class RawPost extends Page implements IPage {
    m = new Map<string, StoreData>()

    constructor(private ipc: Channel, private data: GlobalData, private cateView: CategoryView) {
        super("views/rawpost.html")
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
                this.data.postMap.set(post.id ?? "1", post)
            })
            this.ipc.SendMsg("getcategorytree")
        })
    }

    StartUpdate() {
        let html = ""
        this.m = new Map<string, StoreData>()
        this.data.posts.forEach((post) => {
            this.m.set(post.id ?? "1", post)
        })
        html += this.cateView.StartUpdate()

        for (const [id, post] of this.m) {
            html += `<a id="post-${id}">${post.title}</a> <a id="post-del-${id}">X</a><br>`
        }

        const dom = document.getElementById("filelist")
        if (dom) dom.innerHTML = html

        this.data.posts.forEach((post) => {
            const pdom = document.getElementById(`post-${post.id}`)
            if (pdom) pdom.onclick = () => {
                this.modifyMode(post)
            }
            const ddom = document.getElementById(`post-del-${post.id}`)
            if (ddom) ddom.onclick = () => {
                if(confirm("Delete " + post.title)) {
                    this.ipc.SendMsg("deletePost", post);
                }
            }
        })
    }

    modifyMode(post: StoreData) {
        const titleDom = document.getElementById("title") as HTMLInputElement
        const dom = document.getElementById("postmode")
        const textarea = document.getElementById("rawPost") as HTMLTextAreaElement

        if (dom) dom.innerText = 'Modify Post'
        titleDom.value = post.title
        textarea.value = post.data


        const out = document.getElementById("output") as HTMLDivElement
        const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement
        if (saveBtn) saveBtn.onclick = () => {
            const data = textarea.value
            out.innerText = data
            post.data = data
            this.ipc.SendMsg("modifyPost", post);
        }
        this.ipc.SendMsg("getPostList");

    }
    InitTree() {
        this.cateView.param = {
            domId: "catelist",
            nodeBeforeHtmlEvent: (node: CategoryTree, _: number) => {
                let html = ""
                for (const id of node.postIds) {
                    const post = this.m.get(id)
                    if (!post) continue
                    //html += "&nbsp;".repeat(depth + 1)
                    html += `<li class="mb-1">
                        <a id="post-${id}" class="hand">${post.title}</a>
                        <a id="post-del-${id}" class="hand">X</a>
                   </li>`
                    this.m.delete(id)
                }
                return html
            },
            receiveCate: () => {
                this.StartUpdate()
            }
        }
    }

    InitBinding() {
        const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement
        const out = document.getElementById("output") as HTMLDivElement
        out.innerText = "new post ready"
        if (saveBtn) saveBtn.onclick = () => {
            out.innerText = "ChoicePost"
        }
        this.ipc.SendMsg("getPostList");
    }
    async Run(): Promise<boolean> {
        await this.LoadHtml()
        this.InitTree()
        this.InitBinding()

        return false
    }
    Release(): void {

    }
}
