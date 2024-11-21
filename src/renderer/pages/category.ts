import { Channel } from "../../common/com";
import { CategoryTree } from "../../common/common";
import { IPage, Page } from "../page";
import { GlobalData } from "../web/wfactory";


export default class Category extends Page implements IPage {
    treemap = new Map<string, CategoryTree>()
    constructor(private ipc: Channel, private data: GlobalData) {
        super("views/category.html")
        this.treemap.set(this.data.root.id, this.data.root)
        this.ipc.RegisterMsgHandler("categorytree", (ret: CategoryTree) => {
            if (ret) {
                this.data.root = ret
                this.treemap.set(this.data.root.id, this.data.root)
            }

            this.StartUpdate()
        })
    }
    targetParent: CategoryTree = this.data.root

    SelectParent(node: CategoryTree) {
        this.targetParent = node
        const dom = document.getElementById("parenttarget")
        if (dom) dom.innerText = node.title
    }
    StartUpdate() {
        let html = ""
        for(const node of this.data.root.children){
            html += this.UpdateCategory(node, 0)
        }
        const dom = document.getElementById("catelist")
        if (dom) dom.innerHTML = html
        for (const [_, node] of this.treemap) {
            const ldom = document.getElementById(`category-${node.id}`)
            if (ldom) ldom.onclick = () => {
                this.SelectParent(node)
            }
            const delDom = document.getElementById(`catedel-${node.id}`)
            if (delDom) delDom.onclick = () => {
                this.DelCategory(node.id)
            }
        }
    }
    UpdateCategory(node: CategoryTree, depth: number): string {
        let html = "&nbsp;".repeat(depth)
        html += `<a id="category-${node.id}">${node.title}</a> <a id="catedel-${node.id}">X</a><br>`
        this.treemap.set(node.id, node)
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
        this.ipc.SendMsg("setcategorytree", this.data.root)
    }
    LoadCategory() {
        this.ipc.SendMsg("getcategorytree")
    }
    bindingEvent() {
        const name = document.getElementById("catetitle") as HTMLInputElement
        const dom = document.getElementById("submitBtn")
        if(dom) dom.onclick = () => {
            this.AddChild(this.targetParent.id, name.value)
            this.ipc.SendMsg("setcategorytree", this.data.root)
        }
    }
    async Run(): Promise<boolean> {
        await this.LoadHtml()
        this.bindingEvent()
        this.LoadCategory()

        return true
    }
    Release(): void {
        
    }
}