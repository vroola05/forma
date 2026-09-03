import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

import { BuilderTextEditorToolbar } from './builder-editor-toolbar';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mentionTrigger: {
            openMentions: () => ReturnType;
        }
    }
}

export const MentionTriggerExtension = Extension.create({
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

export class BuilderEditor {
    readonly #content = document.createElement('div');
    readonly #editorElement = document.createElement('div');
    #toolbar!: BuilderTextEditorToolbar;
    #editor!: Editor;

    activeExtensions: any[] = [
        StarterKit
    ];

    timeout: number | undefined = undefined;
    onValueChanged: (jsonData: any) => void;

    constructor(onValueChanged: (jsonData: any) => void, extensions: any[] = []) {
        this.onValueChanged = onValueChanged;

        if (extensions.length > 0) {
            this.activeExtensions.push(...extensions);
        }

        this.#initializeEditor();

        this.#createContent();
    }

    #initializeEditor() {
        this.#editor = new Editor({
            element: this.#editorElement,
            extensions: [
                ...this.activeExtensions
            ],
            autofocus: true,
            content: '',
            onTransaction: () => this.#toolbar?.updateToolbar(),
            onUpdate: () => this.#updateEditor()
        });
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
    
    getJsonData() {
        return this.#editor.getJSON();
    }

    getContent() {
        return this.#content;
    }
}
