import { IPage } from './page';
import { Factory } from './web/wfactory'

declare global {
  interface Window {
    ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
  }
}
export type FuncMap = {
  [key: string]: IPage
}
const factory = new Factory()

class Index {
  funcMap: FuncMap = factory.Build()
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
      
      const dom = document.getElementById("status-msg")
      if (!dom) return

      factory.socket.RegisterMsgHandler("open", () => {
        dom.innerText = "Connect"
      })
      factory.socket.RegisterMsgHandler("close", () => {
        dom.innerText = "Disconnect"
      })
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
window.addEventListener("unhandledrejection", (ev) => {
  console.log(ev)
  errPrint(ev.reason.message + ev.reason.stack)
})
window.onerror = function (message, source, lineno, colno, error) {
  const errorMessage = `Error: ${message} at ${source}:${lineno}:${colno}\n${error?.message}\n${error?.stack}`;
  errPrint(errorMessage)
  // 에러 로그를 콘솔에도 출력
  console.error(message, source, lineno, colno, error);
  // true를 반환하여 기본 동작을 방지할 수 있음
  return true;
};

function errPrint(msg: string) {
  // 웹 페이지에 에러 메시지 추가
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '10px';
  errorDiv.style.zIndex = '1000';
  errorDiv.innerText = msg;

  document.body.appendChild(errorDiv);
}


const main = new Index()

addEventListener("load", () => {
  main.Run()
})

