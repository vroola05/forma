import Mention, { MentionNodeAttrs } from '@tiptap/extension-mention';

import { BuilderConditionsAutocompleteField } from '../../properties/components/builder-conditions-autocomplete-field';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';

export class DollarMenu {
    popup: HTMLElement | null = null;
    props: SuggestionProps | null = null;;

    var1SimpleTextfield: BuilderConditionsAutocompleteField | null = null;

    constructor() {
        
    }

    onStart(props: SuggestionProps) {
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
                this.props?.editor.commands.focus();
            })
            .toggle();

            const inputElementParent = this.var1SimpleTextfield?.inputElement?.parentNode as Element;

            inputElementParent.classList.add('hidden');
            this.popup.appendChild(this.var1SimpleTextfield.getContent());
        this.updatePosition(props);
        this.attachClickEvents(props);
    }

    onUpdate(props: SuggestionProps) {
        this.props = props;
    }

    updatePosition(props: SuggestionProps) {
        const rect = props.clientRect?.();
        if (rect && this.popup) {
            this.popup.style.left = `${rect.left}px`;
            this.popup.style.top = `${rect.top + 20}px`;
        }
    }

    attachClickEvents(props: SuggestionProps) {
        this.popup?.querySelectorAll<HTMLElement>('.sugg-item').forEach((item: HTMLElement) => {
            item.onclick = () => {
                props.command({
                    id: item.getAttribute('data-id'),
                    label: item.innerText
                });
            };
        });
    }

    onKeyDown(props: SuggestionKeyDownProps) {

        if (props.event.key === 'Escape') {
            this.destroy();
            return true;
        }

        if (props.event.key.length !== 1) {
            return false;
        }

        if (this.props) {
            const tekst = props.view.state.doc.textBetween(this.props.range.from, this.props.range.to);
        }


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
                onExit: () => menu.onExit(),
            };
        }
    }
});