import { BubbleMenuPlugin, BubbleMenu } from 'https://esm.sh/@tiptap/extension-bubble-menu'
import { Lang } from '../../../shared/services/lang.js';

export const BuilderEditorTableBubbleMenu = BubbleMenu.extend({
    addOptions() {
        const createElement = () => {
            const dom = document.createElement('div');
            dom.innerHTML = 'hallo';
        }
        return {
            ...this.parent?.(),
            element: createElement(),
            // Het menu verschijnt alleen als we in een tabel staan
            shouldShow: ({ editor }) => editor.isActive('table'),
            // We plaatsen hem aan de bovenkant
            pluginKey: 'tableTopMenu',
            tippyOptions: {
                placement: 'top-start',
                // Hiermee plakken we hem aan de bovenkant van de gehele tabel
                getReferenceClientRect: () => {
                    const { view } = this.editor;
                    const { selection } = view.state;

                    // Zoek de 'table' node in plaats van de 'td'
                    const dom = view.domAtPos(selection.from).node;
                    const table = dom.nodeType === Node.TEXT_NODE
                        ? dom.parentElement.closest('table')
                        : dom.closest('table');

                    return table ? table.getBoundingClientRect() : null;
                },
            },
        }
    },

    // addProseMirrorPlugins() {
    //     const createBtn = (label, classes, disabled, action) => {
    //         const btn = document.createElement('button');
    //         btn.className = classes;
    //         btn.disabled = disabled;
    //         btn.title = label;
    //         btn.setAttribute('aria-label', label);
    //         btn.onclick = action;
    //         return btn;
    //     }

    //     const element = document.createElement('div');
    //     element.className = 'builder-table-dropdown-btns-container';

    //     element.appendChild(createBtn(
    //         Lang.get('text.editor.table.row.add'),
    //         'btn-primary btn-add-row icon icon-add-row-bottom',
    //         false,
    //         (e) => { this.editor.chain().focus().addRowAfter().run(); }
    //     ));

    //     element.appendChild(createBtn(
    //         Lang.get('text.editor.table.row.delete'),
    //         'btn-primary btn-add-row icon icon-remove-row-bottom',
    //         false,
    //         (e) => { this.editor.chain().focus().deleteRow().run(); }
    //     ));

    //     element.appendChild(createBtn(
    //         Lang.get('text.editor.table.col.add'),
    //         'btn-primary btn-add-col icon icon-add-column-right',
    //         false,
    //         (e) => { this.editor.chain().focus().addColumnAfter().run(); }
    //     ));

    //     element.appendChild(createBtn(
    //         Lang.get('text.editor.table.col.delete'),
    //         'btn-primary btn-add-col icon icon-remove-column-right',
    //         false,
    //         (e) => { this.editor.chain().focus().deleteColumn().run(); }
    //     ));

    //     element.addEventListener('keydown', (e) => {
    //         if (e.key === 'Escape') this.editor.commands.focus();
    //     });

    //     return [
    //         BubbleMenuPlugin({
    //             pluginKey: 'tableBubbleMenu',
    //             editor: this.editor,
    //             element,
    //             shouldShow: this.options.shouldShow,
    //             tippyOptions: {
    //                 placement: 'top-start',
    //                 onShow(instance) {
    //                 instance.setProps({
    //                     getReferenceClientRect: () => {

    //                         const { view } = instance.props.editor; // Gebruik editor uit props
    //                         const { selection } = view.state;

    //                         const dom = view.domAtPos(selection.from).node;
    //                         const cell = dom.nodeType === Node.TEXT_NODE 
    //                             ? dom.parentElement.closest('td, th') 
    //                             : dom.closest('td, th');

    //                         if (cell) {
    //                             return cell.getBoundingClientRect();
    //                         }

    //                         return null;
    //                     }
    //                 });
    //             }
    //             },
    //         }),
    //     ]
    // }
});

