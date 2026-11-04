import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

import { BuilderTextEditorToolbar } from './builder-editor-toolbar';
import { FieldMenu } from './builder-field-mention-menu';

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
                commands.focus();

                // 2. Haal de cursorpositie op
                const { selection } = editor.state;
                const { from } = selection;

                try {
                    // 3. Haal de coördinaten (DOMRect) van de cursor op
                    const coords = editor.view.coordsAtPos(from);
                    
                    // 4. Maak een instantie van je menu
                    const menu = new FieldMenu();
                    menu.toggle();
                    
                    // 5. Bouw de SuggestionProps na (mocken) die updatePosition verwacht
                    const mockedProps = {
                        clientRect: () => new DOMRect(
                            coords.left, 
                            coords.top + window.scrollY, // Rekening houden met scroll als je popup absolute is t.o.v. de body
                            coords.right - coords.left, 
                            coords.bottom - coords.top
                        ),
                        // Voeg eventuele andere verplichte props toe die je FieldMenu vereist, bijv:
                        // editor: editor,
                        // command: (item) => { ... }
                    };

                    // 6. Geef het door aan je bestaande functie
                    menu.updatePosition(mockedProps as any);
                    console.log('yes', mockedProps);
                    return true;
                } catch (error) {
                    console.error("Kon cursorpositie niet bepalen:", error);
                    return false;
                }
                
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

    addData(jsonData: any) {
        if (!jsonData || Object.keys(jsonData).length === 0) {
            this.#editor.commands.clearContent();
            return;
        }

        this.#editor.commands.setContent(jsonData, {
            emitUpdate: false
        });
    }

    setInline() {
        this.#toolbar.getContent().remove();
        this.#content.classList.add('text-editor-inline');
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

    isEmpty() {
        return this.#editor.isEmpty;
    }
    
    getJsonData() {
        return this.#editor.getJSON();
    }

    getContent() {
        return this.#content;
    }
}
