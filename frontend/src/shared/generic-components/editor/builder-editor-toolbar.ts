import { ChainedCommands, Editor } from '@tiptap/core';
import { BuilderEditorTableDropdown } from './builder-editor-table-dropdown';

export class BuilderTextEditorToolbar {
    content = document.createElement('div');
    #editor!: Editor;
    buttons: { cmd?: string, label?: string, classes?: string, options?: any, type?: 'divider' | 'action', fnc?: () => void, dependsOn?: string, extension?: string }[] = [
        { cmd: 'toggleBold', label: 'B' },
        { cmd: 'toggleItalic', label: 'I' },

        { cmd: 'toggleUnderline', label: 'U', extension: 'underline' },
        { type: 'divider', dependsOn: 'underline' },

        { cmd: 'toggleHeading', label: 'H1', options: { level: 1 } },
        { cmd: 'toggleHeading', label: 'H2', options: { level: 2 } },
        { type: 'divider' },
        { cmd: 'toggleBulletList', classes: ' icon icon-list-ul', label: '' },
        { cmd: 'toggleOrderedList', classes: ' icon icon-list-ol', label: '' },
        { type: 'divider' },
        {
            type: 'action',
            extension: 'table',
            classes: ' icon icon-table builder-table-button',
            label: '',
            fnc: () => { new BuilderEditorTableDropdown(this.#editor) }
        },
        { cmd: 'openMentions', label: '$', extension: 'mentionTrigger' }
    ];

    constructor(editor: Editor) {
        this.#editor = editor;
        this.content.className = 'builder-text-editor-toolbar';

        this.#initializeToolbar()
    
    }

    /**
     * Returns true if the editor has an extension with the given name, false otherwise.
     * This method is case-insensitive and checks the editor's extension manager for the specified extension.
     * 
     * @param name 
     * @returns 
     */
    #hasExtension(name: string) {
        return this.#editor.extensionManager.extensions.some(
            ext => ext.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Returns an array of buttons that are active based on the editor's extensions.
     * @returns 
     */
    #getActiveButtons() {
        const activeButtons = this.buttons.filter(btn => {
            if (btn.extension) {
                return this.#hasExtension(btn.extension);
            }

            if (btn.dependsOn) {
                return this.#hasExtension(btn.dependsOn);
            }

            return true;
        });
        return activeButtons;
    }


    #initializeToolbar() {
        this.content.innerHTML = '';
        
        
        this.#getActiveButtons().forEach(btn => {
            const classes = btn?.classes ?? '';

            if (btn.type === 'divider') {
                const divider = document.createElement('span');
                divider.className = `divider ${classes}`;
                this.content.appendChild(divider);
            } else if (btn.type === 'action' && btn.fnc) {
                this.#createActionButton(btn.label ?? '', classes, btn.fnc);
            } else if (btn.cmd) {
                this.#createCommandButton(btn.label ?? '', classes, btn.cmd, btn.options);
            }
        });
    }

    #createActionButton(label: string, classes: string, action: () => void) {
        const button = document.createElement('button') as HTMLButtonElement;
        if (label) {
            button.textContent = label;
        }
        button.className = `${classes}`;
        button.onclick = action;
        this.content.appendChild(button);
    }

    #createCommandButton(label: string, classes: string, command: string, options: any = {}) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');

            if (label) {
                button.textContent = label;
            }

            button.className = `${classes}`;
            button.dataset.command = command.replace('toggle', '').toLowerCase();

            if (options) {
                button.dataset.options = JSON.stringify(options);
            }

            button.onclick = (event: MouseEvent) => {
                event.preventDefault();

                const freshChain = this.#editor.chain().focus();
                const commandKey = command as keyof ChainedCommands;

                if (typeof freshChain[commandKey] === 'function') {
                    const commandFunction = freshChain[commandKey] as any;
                    commandFunction(options ?? {}).run();
                }

            };

            this.content.appendChild(button);
            
    }

    setEditor(editor: Editor) {
        this.#editor = editor;
    }

    /**
     * Update the state of the toolbar buttons based on the current selection in the editor.
     * This method checks if each command is active and updates the button's class accordingly.
     * Active buttons will have the 'is-active' class added, while inactive buttons will have it removed.
     * This provides visual feedback to the user about the current formatting state of the selected text.
     * 
     * Note: This method should be called whenever the editor's selection changes to ensure the toolbar reflects the current state.
     * 
     * @example
     * // Call this method in the editor's onTransaction or onUpdate callback
     * editor.onTransaction(() => {
     *     toolbar.updateToolbar();
     * });
     */
    updateToolbar() {
        const buttons = this.content.querySelectorAll('button');
        buttons.forEach(button => {

            const command = button.dataset.command;
            const options = JSON.parse(button.dataset.options || '{}');

            if (!command) return;

            if (this.#editor.isActive(command, options)) {
                button.classList.add('is-active');
            } else {
                button.classList.remove('is-active');
            }
        });
    }

    getContent() {
        return this.content;
    }
}