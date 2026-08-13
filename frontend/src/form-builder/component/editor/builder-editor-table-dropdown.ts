
import { Editor } from '@tiptap/core';
import { Lang } from '../../../shared/services/lang';

export class BuilderEditorTableDropdown {
    content: HTMLElement = document.createElement('div');
    inputRows = document.createElement('input');
    inputCols = document.createElement('input');

    editor: Editor | null = null;
    
    constructor(editor: Editor) {
        if(document.getElementById('builder-table-dropdown')) return;

        this.editor = editor;

        if (!this.editor) {
            return;
        }

        this.content.className = 'builder-table-dropdown';
        this.content.id = 'builder-table-dropdown';

        const inputContainer = document.createElement('div');
        inputContainer.className = 'builder-table-dropdown-input-container';

        this.inputRows.type = 'number';
        this.inputRows.value = '3';
        this.inputRows.min = '1';

        this.inputCols.type = 'number';
        this.inputCols.value = '3';
        this.inputCols.min = '1';

        const xLabel = document.createTextNode(' x ');

        const createBtn = document.createElement('button');
        createBtn.className = 'btn-primary btn-create-table';
        createBtn.textContent = Lang.get('text.editor.table.create');

        createBtn.onclick = () => {
            const rows = parseInt(this.inputRows.value);
            const cols = parseInt(this.inputCols.value);

            if (!this.editor) return;
            (this.editor.chain().focus() as any).insertTable({ rows, cols }).run();
        };

        const hr = document.createElement('hr');

        const btnsContainer = document.createElement('div');
        btnsContainer.className = 'builder-table-dropdown-btns-container';
        
        btnsContainer.appendChild(this.createBtn(
            Lang.get('text.editor.table.row.add'),
            'btn-primary btn-add-row icon icon-add-row-bottom',
            !this.editor?.can().addRowAfter(),
            () => {
                this.editor?.chain().focus().addRowAfter().run();
            }
        ));

        btnsContainer.appendChild(this.createBtn(
            Lang.get('text.editor.table.row.delete'),
            'btn-primary btn-add-row icon icon-remove-row-bottom',
            !this.editor?.can().deleteRow(),
            () => {
                this.editor?.chain().focus().deleteRow().run();
            }
        ));

        btnsContainer.appendChild(this.createBtn(
            Lang.get('text.editor.table.col.add'),
            'btn-primary btn-add-col icon icon-add-column-right',
            !this.editor?.can().addColumnAfter(),
            () => {
                this.editor?.chain().focus().addColumnAfter().run();
            }
        ));
        btnsContainer.appendChild(this.createBtn(
            Lang.get('text.editor.table.col.delete'),
            'btn-primary btn-add-col icon icon-remove-column-right',
            !this.editor?.can().deleteRow(),
            () => {
                this.editor?.chain().focus().deleteColumn().run();
            }
        ));

   

        inputContainer.append(this.inputRows, xLabel, this.inputCols, createBtn);
        this.content.append(inputContainer, hr, btnsContainer);

        this.updatePosition();
 
        document.body.appendChild(this.content);

        this.inputRows.focus();

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('click', this.closeDropdown);
        window.addEventListener('keydown', this.closeDropdown);

    }

    createBtn(label: string, classes: string, disabled: boolean, action: () => void) {
        const btn = document.createElement('button');
        btn.className = classes;
        btn.disabled = disabled;
        btn.title = label;
        btn.setAttribute('aria-label', label);
        btn.onclick = action;
        return btn;
    }

    closeDropdown = (e: PointerEvent | KeyboardEvent) => {
        const tableBtn = document.querySelector('.builder-table-button');

        if ((e instanceof KeyboardEvent && e.key === 'Escape') ||
            (e instanceof PointerEvent && e.type === 'click' && !this.content.contains(e.target as HTMLElement) && e.target !== tableBtn)) {
            this.removeDropdown();
        }
    }

    handleResize = () => {
        if (this.content) {
            this.updatePosition();
        }
    }

    updatePosition() {
        const tableBtn = document.querySelector('.builder-table-button');
        if (!tableBtn || !this.content) return;

        const rect = tableBtn.getBoundingClientRect();
        
        this.content.style.top = `${rect.bottom + window.scrollY}px`;
        this.content.style.left = `${rect.left + window.scrollX}px`;
    }

    removeDropdown() {
        if (this.content) {
            this.content.remove();
            
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('click', this.closeDropdown);
            window.removeEventListener('keydown', this.closeDropdown);
        }
    }
}