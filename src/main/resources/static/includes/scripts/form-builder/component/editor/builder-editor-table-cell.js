import { TableCell } from 'https://esm.sh/@tiptap/extension-table-cell'
import { Lang } from '../../../shared/services/lang.js';

export const BuilderEditorTableCell = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
        }
    },

    onTransaction( event ) {
        
        if (event.transaction.docChanged || event.transaction.selectionSet) {
             const isFocusedInCell = this.editor.isActive('tableCell') || this.editor.isActive('tableHeader');
        }
    },

    addNodeView() {
        return ({ node, editor, getPos }) => {

            const dom = document.createElement('td')
            dom.className = 'builder-editor-td';
            const contentDOM = document.createElement('div')
            contentDOM.className = 'builder-editor-td-content';

            const tdMenu = document.createElement('div')
            tdMenu.className = 'builder-editor-td-menu';

            const createBtn = (label, classes, disabled, action) => {
                const btn = document.createElement('button');
                btn.className = classes;
                btn.disabled = disabled;
                btn.title = label;
                btn.setAttribute('aria-label', label);
                btn.onclick = action;
                return btn;
            }

            tdMenu.appendChild(createBtn(
                Lang.get('text.editor.table.row.add'),
                'btn-primary btn-add-row icon icon-add-row-bottom',
                !this.editor.can().addRowAfter(),
                (e) => { this.editor.chain().focus().addRowAfter().run(); }
            ));
            

            dom.appendChild(contentDOM)
            dom.appendChild(tdMenu)

            return {
                dom,
                contentDOM
            }
        }
    },
})
