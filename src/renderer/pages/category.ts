import { Channel } from "../../common/com";
import { CategoryTree } from "../../common/common";
import { IPage, Page } from "../page";
import { GlobalData } from "../web/wfactory";
import CategoryView from "./cateview";


export default class Category extends Page implements IPage {
    treemap = new Map<string, CategoryTree>()
    targetParent: CategoryTree = this.data.root

    constructor(private ipc: Channel, private data: GlobalData, private cateView: CategoryView) {
        super("views/category.html")
        this.treemap.set(this.data.root.id, this.data.root)
    }

    SelectParent(node: CategoryTree) {
        this.targetParent = node
        const dom = document.getElementById("parenttarget")
        if (dom) dom.innerText = node.title
    }
    InitTree() {
        this.cateView.param = {
            domId: "catelist",
            receiveCate: () => {
                this.cateView.StartUpdate()
            },
            selectEvent: (node: CategoryTree) => {
                this.SelectParent(node)
            },
            deleteEvent: () => {
                this.cateView.StartUpdate()
                this.ipc.SendMsg("setcategorytree", this.data.root)
            }
        }
    }
    
    LoadCategory() {
        this.ipc.SendMsg("getcategorytree")
    }
    bindingEvent() {
        const name = document.getElementById("catetitle") as HTMLInputElement
        const dom = document.getElementById("submitBtn")
        if(dom) dom.onclick = () => {
            this.cateView.AddChild(this.targetParent.id, name.value)
            this.ipc.SendMsg("setcategorytree", this.data.root)
        }
    }
    async Run(): Promise<boolean> {
        await this.LoadHtml()
        this.bindingEvent()
        this.InitTree()
        this.LoadCategory()

        return true
    }
    Release(): void {
        
    }
}