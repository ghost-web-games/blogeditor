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

    StartUpdate() {
        if(!this.param.domId) throw new Error("undefined dom id");
        
        this.treemap.set(this.data.root.id, this.data.root)
        let html = ""
        for(const node of this.data.root.children){
            html += this.UpdateCategory(node, 0)
        }
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
        return html
    }
    UpdateCategory(node: CategoryTree, depth: number): string {
        let html = "&nbsp;".repeat(depth)
        html += `<a id="category-${node.id}">${node.title}</a> <a id="catedel-${node.id}">X</a><br>`
        this.treemap.set(node.id, node)
        html += this.param.nodeBeforeHtmlEvent?.(node, depth) ?? ""
        for(const child of node.children){
            html += this.UpdateCategory(child, depth + 1)
        }
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