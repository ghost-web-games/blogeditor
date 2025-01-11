import { Channel } from "../../common/com"
import { CategoryTree } from "../../common/common"
import { GlobalData } from "../web/wfactory"

export type CateParam = {
    domId?: string,
    receiveCate?:Function
    selectEvent?:Function
    deleteEvent?:Function
    nodeBeforeHtmlEvent?: Function
}

export default class CategoryView {
    treemap = new Map<string, CategoryTree>()
    skinHtmlS: string = `<ul class="list-unstyled ps-0">`
    skinHtmlE: string = `</ul>`

    constructor(
        private ipc: Channel, 
        private data: GlobalData, 
        public param: CateParam
    ) {
        this.ipc.RegisterMsgHandler("categorytree", (ret: CategoryTree) => {
            if (ret) {
                this.data.root = ret
                this.param.receiveCate?.()
            }
        })
    }
    GetNode(id: string) {
        const ret = this.treemap.get(id)
        if (!ret) throw new Error("undefined node key = " + id);
        return ret
    }

    openPostCate(id: string, node: CategoryTree, path: string[]) {
        if (node.id != "root") {
            const ret = node.postIds.findIndex((f) => f == id)
            path.push(node.id)
            if (ret >= 0) return true
        }
        for(const child of node.children){
            if(this.openPostCate(id, child, path)) {
                return true
            }
            path.pop()
        }
        return false
    }
    StartUpdate(openPostId?: string) {
        if(!this.param.domId) throw new Error("undefined dom id");
        
        this.treemap.set(this.data.root.id, this.data.root)
        let html = this.skinHtmlS
        for(const node of this.data.root.children){
            html += this.UpdateCategory(node, 0)
        }
        html += this.skinHtmlE

        const dom = document.getElementById(this.param.domId)
        if (dom) dom.innerHTML = html
        for (const [_, node] of this.treemap) {
            const ldom = document.getElementById(`category-${node.id}`)
            if (ldom) ldom.onclick = () => {
                this.param.selectEvent?.(node)
            }
            const delDom = document.getElementById(`catedel-${node.id}`)
            if (delDom) delDom.onclick = () => {
                this.DelCategory(node.id)
                this.param.deleteEvent?.(node.id)
            }
        }
        if (openPostId) {
            const paths: string[] = []
            this.openPostCate(openPostId, this.data.root, paths)
            paths.forEach((path) => {
                const dom = document.getElementById(`btn-${path}`)
                if (dom) dom.click()
            })
        }
        return html
    }
    UpdateCategory(node: CategoryTree, depth: number): string {
        const padding = "&nbsp;".repeat(depth)
        let html = `
        <li class="mb-1">${padding}
        <button id="btn-${node.id}" class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed"
            data-bs-toggle="collapse" data-bs-target="#h${node.id}-collapse" aria-expanded="false">
            ${node.title}
        </button>
            <a id="category-${node.id}" class="hand">O</a> <a id="catedel-${node.id}" class="hand">X</a><br>
        <div class="collapse" id="h${node.id}-collapse">
            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
        `
        this.treemap.set(node.id, node)
        for(const child of node.children){
            html += this.UpdateCategory(child, depth + 1)
        }
        html += `</ul>
            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                ${this.param.nodeBeforeHtmlEvent?.(node, depth) ?? ""}
                </ul>
                </div>
            </il>`
        return html
    }
    AddChild(parentId: string, title: string) {
        const node = this.treemap.get(parentId)
        if (!node) return
        const time = Date.now() 
        node.children.push({
            id: `${time}-${node.children.length}`,
            title: title,
            date: time,
            parentId: node.id,
            children: [],
            postIds: []
        })
    }
    ModifyCategory(nodeId: string, title: string) {
        const node = this.treemap.get(nodeId)
        if (!node) return
        node.title = title
    }
    DelCategory(id: string) {
        const node = this.treemap.get(id)
        if (!node || !node.parentId) return
        const parent = this.treemap.get(node.parentId)
        if (!parent) return
        const idx = parent.children.findIndex(child => child.id == id)
        if(idx !== -1) {
            parent.children.splice(idx, 1)
        }
        this.treemap.delete(id)
    }
}