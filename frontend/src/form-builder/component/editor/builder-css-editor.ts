import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export class BuilderCssEditor  {
    content = document.createElement('div');

    editor: Editor
    constructor() {
             this.editor = new Editor({
        element: this.content,
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