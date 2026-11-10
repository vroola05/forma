import Mention from '@tiptap/extension-mention';

import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { BuilderFormServiceRegistry } from '../../../form-builder/services/builder-form-service';
import { ConditionsAutocompleteField } from '../../form-components/conditions-autocomplete-field';

interface FieldMenuConfig {
    editor: any;
    getCoordinates: () => DOMRect | undefined;
    onSelect: (id: string, label: string, fullText?: string) => void;
    initialText?: string;
}

export class FieldMenu {
    popup: HTMLElement | null = null;
    props: SuggestionProps | null = null;
    var1SimpleTextfield: ConditionsAutocompleteField | null = null;
    subscriptions: (() => void)[] = [];
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');

    private activeConfig: FieldMenuConfig | null = null;

    private init(config: FieldMenuConfig) {
        this.activeConfig = config;
        this.popup = document.createElement('div');
        this.popup.className = 'suggestion-menu';
        this.popup.style.cssText = `
            position: fixed;
            z-index: 1000;
        `;
        this.popup.innerHTML = '';
        document.body.appendChild(this.popup);

        this.var1SimpleTextfield = new ConditionsAutocompleteField('var1')
            .setValue(config.initialText)
            .external()
            .setPlaceholder('Formula veld')
            
            .setOnFieldFoundListener((value) => {
                
                const v = value.startsWith('$') || value.startsWith('#') ? value.substring(1) : value;
                this.activeConfig?.onSelect(v, v, value);
            })
            .setOnListItemClickedListener(() => {
                this.activeConfig?.editor.commands.focus();
            })
            .toggle();

        const inputElementParent = this.var1SimpleTextfield?.inputElement?.parentNode as Element;
        inputElementParent.classList.add('hidden');
        this.popup.appendChild(this.var1SimpleTextfield.getContent());

        if (config.initialText && this.var1SimpleTextfield) {
            const cleanText = config.initialText.startsWith('$') || config.initialText.startsWith('#') 
                ? config.initialText.substring(1) 
                : config.initialText;
            this.var1SimpleTextfield.setValue(cleanText, true);
        }



        this.updatePosition();
        this.attachClickEvents();

        this.subscriptions.push(this.#builderFormService.subscribeToForm('variable-form', (variablesForm) => {
            this.var1SimpleTextfield?.setForm(variablesForm);
        }));
    }

    updateText(value: string) {
        if (this.var1SimpleTextfield) {
            this.var1SimpleTextfield.setValue(value, true);
            this.var1SimpleTextfield.toggle()
            setTimeout(() => this.attachClickEvents(), 0);
        }
    }

    updatePosition() {
        const rect = this.activeConfig?.getCoordinates();
        if (rect && this.popup) {
            this.popup.style.left = `${rect.left}px`;
            this.popup.style.top = `${rect.top + 20}px`;
        }
    }

    attachClickEvents() {
        this.popup?.querySelectorAll<HTMLElement>('.sugg-item').forEach((item: HTMLElement) => {
            item.onclick = () => {
                const id = item.dataset.id || '';
                const label = item.innerText;
                this.activeConfig?.onSelect(id, label);
            };
        });
    }

    onStart(props: SuggestionProps) {
        this.props = props;

        this.init({
            editor: props.editor,
            getCoordinates: () => props.clientRect?.() as DOMRect,
            initialText: props.text,
            onSelect: (id, label) => {
                props.command({ id, label });
            }
        });
    }

    onUpdate(props: SuggestionProps) {
        this.props = props;
        this.updateText(props.text);
        this.updatePosition();
    }

    onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === 'Escape') {
            this.destroy();
            return true;
        }
        if (props.event.key.length !== 1) {
            return false;
        }
        return false;
    }

    onExit() {
        this.destroy();
    }

    destroy() {
        this.popup?.remove();
        this.popup = null;
        this.activeConfig = null;
        this.props = null;
        this.subscriptions.forEach(unsubscribe => {
            unsubscribe()
        })
    }
}


export const VariableMenuMention = Mention.extend({
    name: 'page-variable-mention',
}).configure({
    HTMLAttributes: {
        class: 'mention-item',
    },
    suggestion: {
        char: '#',
        render: () => {
            const menu = new FieldMenu();
            return {
                onStart: (props) => menu.onStart(props),
                onUpdate: (props) => menu.onUpdate(props),
                onKeyDown: (props) => menu.onKeyDown(props),
                onExit: () => menu.onExit(),
            };
        }
    }
});

export const FieldMenuMention = Mention.extend({
    name: 'form-field-mention',
}).configure({
    HTMLAttributes: {
        class: 'mention-item',
    },
    suggestion: {
        char: '$',
        render: () => {
            const menu = new FieldMenu();
            return {
                onStart: (props) => menu.onStart(props),
                onUpdate: (props) => menu.onUpdate(props),
                onKeyDown: (props) => menu.onKeyDown(props),
                onExit: () => menu.onExit(),
            };
        }
    }
});
