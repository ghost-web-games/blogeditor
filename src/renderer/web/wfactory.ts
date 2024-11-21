import Socket from "./wsocket";
import Main from "../pages/main"
import { FuncMap } from "../index"
import Category from "../pages/category";
import { CategoryTree, StoreData } from "../../common/common";

export type GlobalData = {
    root: CategoryTree
    posts: StoreData[]
}

export default class Factory {
    socket: Socket;
    main: Main
    category: Category
    data: GlobalData = {
        root: {
            id: "root",
            title: "",
            date: 1,
            children: [],
            postIds: []
        },
        posts: []
    }

    public constructor() {
        this.socket = new Socket()
        this.main = new Main(this.socket, this.data)
        this.category = new Category(this.socket, this.data)
    }

    public Build(): FuncMap {

        const funcMap: FuncMap = {
            "main": this.main,
            "category": this.category,
        };
        return funcMap;
    }

    /*
    public GetBlockStore(): BlockStore { return this.m_blockStore; }
    public GetSession(): Session { return this.m_session; }
    get Logs(): Logger { return this.m_logs }
    */
}