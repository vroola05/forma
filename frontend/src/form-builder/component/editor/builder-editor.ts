import { Editor, Extension } from '@tiptap/core';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { default as StarterKit, default as Underline } from '@tiptap/starter-kit';

import { DollarMenuMention } from './builder-dollar-menu';
import { BuilderEditorTableBubbleMenu } from './builder-editor-table-bubble-menu';
import { BuilderTextEditorToolbar } from './builder-editor-toolbar';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mentionTrigger: {
            openMentions: () => ReturnType;
        }
    }
}


const MentionTriggerExtension = Extension.create({
    name: 'mentionTrigger',
    addCommands() {
        return {
            openMentions: () => ({ state, commands }) => {
                const { selection } = state;
                const { $from } = selection;

                const charBefore = $from.nodeBefore?.textContent?.slice(-1);

                if (charBefore !== '$') {
                    // .insertContent() geeft een boolean terug, stuur die door
                    return commands.insertContent('$');
                }
                
                // .focus() geeft een boolean terug, stuur die door
                return commands.focus();
            }
        }
    }
});


export class BuilderEditor  {
    #content = document.createElement('div');
    #editorElement = document.createElement('div');
    #toolbar: BuilderTextEditorToolbar | null = null;
    #editor: Editor;

    timeout: NodeJS.Timeout | undefined = undefined;
    onValueChanged: (jsonData: any) => void;

    constructor(onValueChanged: (jsonData: any) => void) {
        this.onValueChanged = onValueChanged;

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
                MentionTriggerExtension
            ],
            autofocus: true,
            content: '',
            onTransaction: () => this.#toolbar?.updateToolbar(),
            onUpdate: () => this.#updateEditor()
        })

        this.#createContent();
    }

    #createContent() {
        this.#content.className = 'builder-text-editor editor-container';
        this.#editorElement.className = 'editor-content';

        this.#toolbar = new BuilderTextEditorToolbar(this.#editor);

        this.#content.appendChild(this.#toolbar.getContent());
        this.#content.appendChild(this.#editorElement);
    }

    addDataContent(jsonData: any) {
        this.#editor.commands.setContent(jsonData, {
            emitUpdate: false
        });
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
