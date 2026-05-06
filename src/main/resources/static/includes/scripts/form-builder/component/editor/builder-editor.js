import { Editor, Extension } from 'https://esm.sh/@tiptap/core'
import StarterKit from 'https://esm.sh/@tiptap/starter-kit'
import Underline from 'https://esm.sh/@tiptap/extension-underline'
import { Table } from 'https://esm.sh/@tiptap/extension-table'
import { TableRow } from 'https://esm.sh/@tiptap/extension-table-row'
import { TableCell } from 'https://esm.sh/@tiptap/extension-table-cell'
import { TableHeader } from 'https://esm.sh/@tiptap/extension-table-header'

import { DollarMenuMention } from './builder-dollar-menu.js'
import { BuilderEditorTableBubbleMenu } from './builder-editor-table-bubble-menu.js' 
import { BuilderTextEditorToolbar } from './builder-editor-toolbar.js'

export class BuilderEditor  {
    #content = document.createElement('div');
    #editorElement = document.createElement('div');
    #toolbar = null;
    #editor = null;

    constructor(onValueChanged) {
        this.onValueChanged = onValueChanged;

        this.#createEditor();
        this.#createContent();
    }

    #createContent() {
        this.#content.className = 'builder-text-editor editor-container';
        this.#editorElement.className = 'editor-content';

        this.#toolbar = new BuilderTextEditorToolbar(this.#editor);

        this.#content.appendChild(this.#toolbar.getContent());
        this.#content.appendChild(this.#editorElement);
    }

    #createEditor() {
        this.#editor = new Editor({
            element: this.#editorElement,
            extensions: [
                StarterKit,
                Underline,
                Table.configure({ resizable: true }),
                TableRow,
                TableHeader,
                TableCell,
                DollarMenuMention,
                BuilderEditorTableBubbleMenu,
                Extension.create({
                    name: 'mentionTrigger',
                    addCommands() {
                        return {
                            openMentions: () => (editor) => {
                                const { state } = editor;
                                const { selection } = state;
                                const { $from } = selection;

                                const charBefore = $from.nodeBefore?.textContent?.slice(-1);

                                if (charBefore !== '$') {
                                    return editor.chain().focus().insertContent('$').run();
                                } else {
                                    return editor.chain().focus().run();
                                }
                            }
                        }
                    }
                })
            ],
            autofocus: true,
            content: '',
            onTransaction: () => this.#toolbar.updateToolbar(),
            onUpdate: () => this.#updateEditor()
        })
    }

    addDataContent(data) {
        this.#editor.commands.setContent(data, false);
    }

    #updateEditor() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            if (this.onValueChanged) {
                this.onValueChanged(this.#editor.getJSON());
            }
        }, 400);
    }
    

    getContent() {
        return this.#content;
    }

    tableDinges() {
        
        // this.editor.chain().focus().addRowAfter().run();
        // this.editor.chain().focus().addColumnAfter().run();
        // this.editor.chain().focus().deleteColumn().run();
        // this.editor.chain().focus().deleteRow().run();
        // this.editor.chain().focus().deleteTable().run();
    }
}
