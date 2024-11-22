import { Channel } from "../../common/com";
import { CategoryTree } from "../../common/common";
import { IPage, Page } from "../page";
import { GlobalData } from "../web/wfactory";
import CategoryView from "./cateview";


export default class PostsMap extends Page implements IPage {
    targetId: string = this.data.root.id

    constructor(private ipc: Channel, private data: GlobalData, private cateView: CategoryView) {
        super("views/postsmap.html")
        this.ipc.RegisterMsgHandler("savemap", (ret: boolean) => {
            if (ret) { }
        })
    }
    drawPost() {
        let html = ""
        this.data.posts.forEach((post) => {
            html += `<a id="selpost-${post.id}">${post.title}</a><br>`
        })

        const dom = document.getElementById("postlist")
        if (dom) dom.innerHTML = html

        this.data.posts.forEach((post) => {
            const pdom = document.getElementById(`selpost-${post.id}`)
            if (pdom) pdom.onclick = () => {
                const node = this.cateView.GetNode(this.targetId)
                node.postIds.push(post.id ?? "1")
                this.SelectParent(node.id)
            }
        })
    }
    SelectParent(id: string) {
        const node = this.cateView.GetNode(id)
        this.targetId = node.id
        const dom = document.getElementById("selectcate")
        if (dom) dom.innerText = node.title

        const postIds = node.postIds
        let html = ""
        const sel = document.getElementById("selectedlist") as HTMLDivElement
        if (postIds.length) {
            for (const id of postIds) {
                const post = this.data.postMap.get(id)
                if (post) html += `<a id="post-${id}">${post.title}</a><br>`
            }
            sel.innerHTML = html
        } else {
            sel.innerText = "Empty"
        }
        for(const id of postIds) {
            const pdom = document.getElementById(`post-${id}`)
            if (pdom) pdom.onclick = () => {
                const n = this.cateView.GetNode(node.id)
                const idx = n.postIds.findIndex(i => i == id)
                n.postIds.splice(idx, 1)
                this.SelectParent(node.id)
            }
        }
        this.ipc.SendMsg("setcategorytree", this.data.root)
    }
    InitTree() {
        this.cateView.param = {
            domId: "catelist",
            selectEvent: (node: CategoryTree) => {
                this.SelectParent(node.id)
            },
            receiveCate: () => {
                this.cateView.StartUpdate()
            }
        }
    }
    drawCateList() {
        this.InitTree()
        this.ipc.SendMsg("getcategorytree")
        this.drawPost()
    }

    async Run(): Promise<boolean> {
        await this.LoadHtml()
        this.drawCateList()
        return true
    }

    Release(): void {
        
    }
}