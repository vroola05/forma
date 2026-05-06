import Mention from 'https://esm.sh/@tiptap/extension-mention'
import { BuilderConditionsAutocompleteField } from '../../properties/components/builder-conditions-autocomplete-field.js';

export class DollarMenu {
    constructor() {
        this.popup = null;
        this.props = null;
    }

    onStart(props) {
        this.props = props;

        this.popup = document.createElement('div');
        this.popup.className = 'suggestion-menu';
        this.popup.style.cssText = `
      position: fixed;
      
      z-index: 1000;
    `;

        this.popup.innerHTML = '';

        document.body.appendChild(this.popup);

        this.var1SimpleTextfield = new BuilderConditionsAutocompleteField('var1','')
            .setPlaceholder('Formula veld')
            .setOnFieldFoundListener((value) => {
                value = `{${value.startsWith('$.') ? value.substring(2) : value}}`;
                props.command({
                    id: value,
                    label: value
                });

            })
            .setOnListItemClickedListener(() => {
                this.props.editor.commands.focus();
            })
            .toggle();
            this.var1SimpleTextfield.inputElement.parentNode.classList.add('hidden');
            this.popup.appendChild(this.var1SimpleTextfield.getContent());
        this.updatePosition(props);
        this.attachClickEvents(props);
    }

    onUpdate(props) {
        this.props = props;
        
    }

    updatePosition(props) {
        const rect = props.clientRect?.();
        if (rect && this.popup) {
            this.popup.style.left = `${rect.left}px`;
            this.popup.style.top = `${rect.top + 20}px`;
        }
    }

    attachClickEvents(props) {
        this.popup.querySelectorAll('.sugg-item').forEach(item => {
            item.onclick = () => {
                props.command({
                    id: item.getAttribute('data-id'),
                    label: item.innerText
                });
            };
        });
    }

    onKeyDown(props) {

        if (props.event.key === 'Escape') {
            this.destroy();
            return true;
        }

        if (props.event.key.length !== 1) {
            return false;
        }

        const tekst = props.view.state.doc.textBetween(this.props.range.from, this.props.range.to);


        return false;
    }

    onExit() {
        this.destroy();
    }

    destroy() {
        this.popup?.remove();
        this.popup = null;
    }
}

export const DollarMenuMention = Mention.configure({
    HTMLAttributes: {
        class: 'mention-item',
    },
    suggestion: {
        char: '$',
        render: () => {
            const menu = new DollarMenu();
            return {
                onStart: (props) => menu.onStart(props),
                onKeyDown: (props) => menu.onKeyDown(props),
                onExit: (props) => menu.onExit(props),
            };
        }
    }
});