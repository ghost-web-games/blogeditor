import EditorJS, { ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header"
import Paragraph from "@editorjs/paragraph";
import { IPage, Page } from "../page";


export class Main extends Page implements IPage {
    editor?: EditorJS
    constructor() {
        super("views/main.html")
    }
    async Run(): Promise<boolean> {
        await this.LoadHtml()
        if (!this.editor) this.editor = new EditorJS({
            autofocus: true,
            holder: "editorjs",
            tools: {
                header: {
                    class: Header as unknown as ToolConstructable,
                    inlineToolbar: true,
                },
                paragraph: {
                    class: Paragraph as unknown as ToolConstructable,
                    inlineToolbar: true,
                }
            },
            
        })

        return false
    }
    Release(): void {

    }
}