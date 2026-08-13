import { BubbleMenu, BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';

import { Lang } from '../../../shared/services/lang';

export const BuilderEditorTableBubbleMenu = BubbleMenu.extend({
    addOptions() {
        const createElement = () => {
            const dom = document.createElement('div');
            dom.innerHTML = 'hallo';
        }
        return {
            ...this.parent?.(),
            element: createElement(),
            shouldShow: ({ editor }) => editor.isActive('table'),
            pluginKey: 'tableTopMenu',
            tippyOptions: {
                placement: 'top-start',
                getReferenceClientRect() {

                    // TODO: This shouldn't work??
                    const self = this as any; 
                    if (!self.editor) return new DOMRect();

                    const { view } = self.editor;
                    const { selection } = view.state;

                    const dom = view.domAtPos(selection.from).node;

                    const table = dom.nodeType === Node.TEXT_NODE
                        ? (dom.parentElement?.closest('table') ?? null)
                        : (dom as HTMLElement).closest('table');

                    return table 
                        ? table.getBoundingClientRect() 
                        : view.dom.getBoundingClientRect();
                },
            },
        }
    },

    addProseMirrorPlugins() {
        const createBtn = (label: string, classes: string, disabled: boolean, action: () => void) => {
            const btn = document.createElement('button');
            btn.className = classes;
            btn.disabled = disabled;
            btn.title = label;
            btn.setAttribute('aria-label', label);
            btn.onclick = action;
            return btn;
        }

        const element = document.createElement('div');
        element.className = 'builder-table-dropdown-btns-container';

        const editorAny = (this.editor as any);

        element.appendChild(createBtn(
            Lang.get('text.editor.table.row.add'),
            'btn-primary btn-add-row icon icon-add-row-bottom',
            false,
            () => { editorAny.chain().focus().addRowAfter().run(); }
        ));

        element.appendChild(createBtn(
            Lang.get('text.editor.table.row.delete'),
            'btn-primary btn-add-row icon icon-remove-row-bottom',
            false,
            () => { editorAny.chain().focus().deleteRow().run(); }
        ));

        element.appendChild(createBtn(
            Lang.get('text.editor.table.col.add'),
            'btn-primary btn-add-col icon icon-add-column-right',
            false,
            () => { editorAny.chain().focus().addColumnAfter().run(); }
        ));

        element.appendChild(createBtn(
            Lang.get('text.editor.table.col.delete'),
            'btn-primary btn-add-col icon icon-remove-column-right',
            false,
            () => { editorAny.chain().focus().deleteColumn().run(); }
        ));

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.editor.commands.focus();
        });

        return [
            BubbleMenuPlugin({
                pluginKey: 'tableBubbleMenu',
                editor: this.editor,
                element,
                shouldShow: this.options.shouldShow,
                
                getReferencedVirtualElement: () => {
                    const { view } = this.editor;
                    const { selection } = view.state;
                    const dom = view.domAtPos(selection.from).node;
                    const cell = dom.nodeType === Node.TEXT_NODE ? dom.parentElement?.closest('td, th') : (dom as HTMLElement).closest('td, th');
                    return cell ? { getBoundingClientRect: () => cell.getBoundingClientRect() } : null;
                },

                options: {
                    placement: 'top-start',
                    onShow() {
                        const { view } = editorAny;
                        const { selection } = view.state;

                        const dom = view.domAtPos(selection.from).node;
                        const cell = dom.nodeType === Node.TEXT_NODE 
                            ? dom.parentElement?.closest('td, th') 
                            : (dom as HTMLElement).closest('td, th');

                        if (cell) {
                            const rect = cell.getBoundingClientRect();
                            
                            Object.assign(element.style, {
                                position: 'absolute',
                                left: `${rect.left + window.scrollX}px`,
                                top: `${rect.top + window.scrollY - element.offsetHeight}px`,
                            });
                        }
                    }
                }
            }),
        ]
    }
});

