import Socket from "./wsocket";
import Main from "../pages/main"
import { FuncMap } from "../index"
import Category from "../pages/category";
import { CategoryTree, StoreData } from "../../common/common";
import CategoryView from "../pages/cateview";
import PostsMap from "../pages/postsmap";
import RawPost from "../pages/rawpost";

export type GlobalData = {
    root: CategoryTree
    posts: StoreData[]
    postMap: Map<string, StoreData>
}

export default class Factory {
    socket: Socket;
    main: Main
    category: Category
    postsmap: PostsMap
    rawPost: RawPost
    data: GlobalData = {
        root: {
            id: "root",
            title: "",
            date: 1,
            children: [],
            postIds: []
        },
        posts: [],
        postMap: new Map<string, StoreData>()
    }
    cateView: CategoryView

    public constructor() {
        this.socket = new Socket()
        this.cateView = new CategoryView(this.socket, this.data, {})
        this.category = new Category(this.socket, this.data, this.cateView)
        this.postsmap = new PostsMap(this.socket, this.data, this.cateView)
        this.rawPost = new RawPost(this.socket, this.data, this.cateView)
        this.main = new Main(this.socket, this.data, this.cateView)
    }

    public Build(): FuncMap {

        const funcMap: FuncMap = {
            "main": this.main,
            "category": this.category,
            "postsmap": this.postsmap,
            "rawpost": this.rawPost,
        };
        return funcMap;
    }

    /*
    public GetBlockStore(): BlockStore { return this.m_blockStore; }
    public GetSession(): Session { return this.m_session; }
    get Logs(): Logger { return this.m_logs }
    */
}