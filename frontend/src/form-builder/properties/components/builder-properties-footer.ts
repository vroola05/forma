export class BuilderPropertiesFooter {
    content = document.createElement('div');
    builderPropertiesFooterBtn = document.createElement('div');
    buttons: Map<string, () => void> = new Map();

    constructor(label = '') {
        this.createContent(label);
    }

    createContent(label: string) {
        this.content.className = 'builder-properties-footer';

        const builderPropertiesFooterLabel = document.createElement('div');
        builderPropertiesFooterLabel.className = 'builder-properties-footer-label';

        builderPropertiesFooterLabel.innerHTML = label;
        this.content.appendChild(builderPropertiesFooterLabel);
        
        this.builderPropertiesFooterBtn.className = 'builder-properties-footer-btn';
        this.content.appendChild(this.builderPropertiesFooterBtn);
    }

    addButton(id: string, label: string, classes: string, func: () => void) {
        this.buttons.set(id, func);

        const builderPropertiesBtnAdd = document.createElement('button');
        builderPropertiesBtnAdd.className = 'builder-btn-icon icon icon-plus-lg' + (classes && classes !== '' ? ' ' + classes : '');
        
            
        builderPropertiesBtnAdd.setAttribute('data-id', id);
        builderPropertiesBtnAdd.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target && target.dataset.id && this.buttons.has(target.dataset.id)) {
                const fnc = this.buttons.get(target.dataset.id);
                if (fnc) {
                    fnc();
                }
            }
        });

        this.builderPropertiesFooterBtn.appendChild(builderPropertiesBtnAdd);
        return this;
    }

    show(show = true) {
        if (show) {
            this.content.classList.remove('hidden');
        } else {
            this.content.classList.add('hidden');
        }
    }

    getContent() {
        return this.content;
    }
}