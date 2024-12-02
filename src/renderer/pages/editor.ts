import EditorJS, { OutputData, ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header"
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";
import EditorjsList from "@editorjs/list";
import Table from "@editorjs/table";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import CodeTool from "@editorjs/code"

const editorjsColumns = require('@calumk/editorjs-columns')
const editorjsCodeflask = require('@calumk/editorjs-codeflask')
const ToggleBlock = require('editorjs-toggle-block')
const Delimiter = require('@coolbytes/editorjs-delimiter')
const Marker = require("@editorjs/marker")
const Strikethrough = require('@sotaproject/strikethrough')
const Annotation = require('editorjs-annotation')
const TextVariantTune = require('@editorjs/text-variant-tune')
const Undo = require("editorjs-undo")

const option = {
    header: {
        class: Header as unknown as ToolConstructable,
        inlineToolbar: true,
    },
    paragraph: {
        class: Paragraph as unknown as ToolConstructable,
        inlineToolbar: true,
            tunes: ['textVariant'],
    },
    image: {
        class: ImageTool,
        config: {
            endpoints: { byFile: "/uploads", byUrl: "/uploads"
            }
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+Q",
    },
    warning: { class: Warning, inlineToolbar: true, },
    delimiter: {
        class: Delimiter,
        config: {
            styleOptions: ['stat', 'dash', 'line'],
            lineWithOptions: [8, 15, 25, 35, 50, 60],
            lineThicknessOptions: [1, 2, 3, 4, 5, 6],
            defaultLineThickness: 2,
        }
    },
    toggle: { class: ToggleBlock, inlineToolbar: true, },
    list: {
        class: EditorjsList as unknown as ToolConstructable,
        inlineToolbar: true,
        config: { defaultStyle: 'unordered' }
    },
    table: {
        class: Table as unknown as ToolConstructable,
        inlineToolbar: true,
        config: { rows: 2, cols: 3,
        }
    },
    code: editorjsCodeflask,
    codeTool: CodeTool,
    Marker: { class: Marker, },
    underline: Underline, 
    strikethrough: Strikethrough,
    annotation: Annotation,
    textVariant: TextVariantTune,
    embed: {
      class: Embed as unknown as ToolConstructable,
      config: {
        services: {
          youtube: true,
          coub: true,
          codepen: {
            regex: /https?:\/\/codepen.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
            embedUrl: 'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
            html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
            height: 300,
            width: 600,
            id: (groups: any) => groups.join('/embed/')
          }
        }
      }
    },
}

export default class Editor {
    editor?: EditorJS

    NewEditor(domId: string, OnReady?:Function) {
        this.editor = new EditorJS({
            autofocus: true,
            holder: domId,
            tools: {
                ...option,
                columns: {
                    class: editorjsColumns,
                    config: {
                        EditorJsLibrary: EditorJS,
                        tools: {
                            ...option
                        }
                    }
                }
            },
            onReady: () => {
                new Undo({ editor: this.editor })
                OnReady?.()
            }
        })
    }
    Render(data: OutputData) {
        this.editor?.render(data)
    }
    Save(callback: Function) {
        this.editor?.save()
            .then((saveData: OutputData) => {
                callback(saveData)
            })
    }
}