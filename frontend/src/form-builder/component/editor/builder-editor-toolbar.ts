import { ChainedCommands, Editor } from '@tiptap/core';
import { BuilderEditorTableDropdown } from './builder-editor-table-dropdown';

export class BuilderTextEditorToolbar {
    content = document.createElement('div');
    editor: Editor;
    
    constructor(editor: Editor) {
        this.editor = editor;

        this.content.className = 'builder-text-editor-toolbar';

        // Definieer de knoppen (actie, label, opties)
        const buttons = [
            { cmd: 'toggleBold', label: 'B' },
            { cmd: 'toggleItalic', label: 'I' },
            { cmd: 'toggleUnderline', label: 'U' },
            { type: 'divider' },
            { cmd: 'toggleHeading', label: 'H1', options: { level: 1 } },
            { cmd: 'toggleHeading', label: 'H2', options: { level: 2 } },
            { type: 'divider' },
            { cmd: 'toggleBulletList', classes: ' icon icon-list-ul', label: '' },
            { cmd: 'toggleOrderedList', classes: ' icon icon-list-ol', label: '' },
            { type: 'divider' },
            { type: 'action', classes: ' icon icon-table builder-table-button', label: '', fnc: () => {new BuilderEditorTableDropdown(this.editor)} },
            { cmd: 'openMentions', label: '$' }
        ];

        buttons.forEach(btn => {
            const classes = btn?.classes ?? '';

            if (btn.type === 'divider') {
                const divider = document.createElement('span');
                divider.className = `divider ${classes}`;
                this.content.appendChild(divider);
            } else if (btn.type === 'action' && btn.fnc) {
                const button = document.createElement('button') as HTMLButtonElement;
                if (btn.label) {
                    button.textContent = btn.label;
                }
                button.className = `${classes}`;
                button.onclick = btn.fnc;
                this.content.appendChild(button);
            } else if (btn.cmd) {
                const button = document.createElement('button');
                if (btn.label) {
                    button.textContent = btn.label;
                }

                button.className = `${classes}`;
                button.setAttribute('data-command', btn.cmd.replace('toggle', '').toLowerCase());

                if (btn.options) {
                    button.setAttribute('data-options', JSON.stringify(btn.options));
                }

                const chain = this.editor.chain().focus();

                const commandKey = btn.cmd as keyof ChainedCommands;
                
                if (typeof chain[commandKey] === 'function') {
                    button.onclick = () => (chain[commandKey] as any)(btn.options || {}).run();
                }

                this.content.appendChild(button);
            }
        });
    }

    /**
     * 
     */
    updateToolbar() {
        const buttons = this.content.querySelectorAll('button');
        buttons.forEach(button => {

            const command = button.getAttribute('data-command');
            const options = JSON.parse(button.getAttribute('data-options') || '{}');

            if (!command) return;

            if (this.editor.isActive(command, options)) {
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