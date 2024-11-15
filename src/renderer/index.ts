import { IPage } from './page';
import { Main } from './pages/main';

declare global {
  interface Window {
    ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
  }
}
type FuncMap = {
  [key: string]: IPage
}

class Index {
  funcMap: FuncMap = {
    "main": new Main()
  }
  CurrentPage?: IPage
  beforPage: string = ""

  constructor() {
    window.ClickLoadPage = async (key: string, fromEvent: boolean, ...args: string[]) => {
      //if (getPageIdParam() == key) return;

      const state = {
        'url': window.location.href,
        'key': key,
        'fromEvent': fromEvent,
        'args': args
      };
      console.log(`page change : ${this.beforPage} ==> ${key}`)
      this.beforPage = key;

      history.pushState(state, "login", "./?pageid=" + key + args)

      const beforePageObj = this.CurrentPage
      if (beforePageObj != undefined) {
        beforePageObj.Release();
      }

      this.CurrentPage = this.funcMap[key]
      if (this.CurrentPage != undefined) {
        await this.CurrentPage.Run();
      }
    };
  }
  getPageIdParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageid = urlParams.get("pageid");
    const key = (pageid == null) ? "main" : pageid;
    this.beforPage ??= key
    return key;
  }
  async includeContentHTML() {
    const key = this.getPageIdParam();
    this.beforPage = key;

    const beforePageObj = this.CurrentPage
    beforePageObj?.Release();

    this.CurrentPage = this.funcMap[key];
    await this.CurrentPage?.Run();
  }
  Run() {
    const tag = document.getElementById("contents");
    if (tag != null) {
        this.includeContentHTML()
    }
  }
}

const main = new Index()

addEventListener("load", () => {
  main.Run()
})

