import { Editor, Extension } from '@tiptap/core';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline'; 
import Placeholder from '@tiptap/extension-placeholder';

import { DollarMenuMention } from './builder-dollar-menu';
import { BuilderEditorTableBubbleMenu } from './builder-editor-table-bubble-menu';
import { BuilderTextEditorToolbar } from './builder-editor-toolbar';
import { Lang } from '../../../shared/services/lang';

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
            openMentions: () => ({ commands, editor }) => {
                const { selection } = editor.state;
                const { $from } = selection;

                const charBefore = $from.nodeBefore?.textContent?.slice(-1);

                if (charBefore !== '$') {
                    return commands.insertContent('$');
                }

                return commands.focus();
            }
        }
    }
});


export class BuilderEditor  {
    readonly #content = document.createElement('div');
    readonly #editorElement = document.createElement('div');
    #toolbar: BuilderTextEditorToolbar | null = null;
    readonly #editor: Editor;

    timeout: number | undefined = undefined;
    onValueChanged: (jsonData: any) => void;

    constructor(onValueChanged: (jsonData: any) => void) {
        this.onValueChanged = onValueChanged;

        this.#editor = new Editor({
            element: this.#editorElement,
            extensions: [
                StarterKit,
                
                Placeholder.configure({
                    placeholder: Lang.get('text.editor.placeholder'),
                    emptyEditorClass: 'builder-text-editor-placeholder', 
                }),

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
        this.timeout = window.setTimeout(() => {
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
