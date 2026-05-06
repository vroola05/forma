import { Editor, Extension } from 'https://esm.sh/@tiptap/core'
import StarterKit from 'https://esm.sh/@tiptap/starter-kit'
import CodeBlockLowlight from 'https://esm.sh/@tiptap/extension-code-block-lowlight'
// import { createLowlight, all } from 'https://esm.sh'


export class BuilderCssEditor  {
    content = document.createElement('div');

    constructor() {
        this.createEditor();
    }

    createEditor() {

        // const lowlight = createLowlight(all)
        this.editor = new Editor({
        element: content,
        extensions: [
            StarterKit.configure({
            // Schakel de standaard codeBlock uit om conflicten te voorkomen
            codeBlock: false,
            }),
            // CodeBlockLowlight.configure({
            // lowlight,
            // }),
        ],
        content: '<pre><code>body { color: red; }</code></pre>',
        })

    }

    getContent() {
        return this.content;
    }
}