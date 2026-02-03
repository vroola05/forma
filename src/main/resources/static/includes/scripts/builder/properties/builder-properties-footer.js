export class BuilderPropertiesFooter {
    buttons = {};
    constructor(label = '') {
        this.createContent(label);
    }

    createContent(label) {
        this.content = document.createElement('div');
        this.content.className = 'builder-properties-footer';

        const builderPropertiesFooterLabel = document.createElement('div');
        builderPropertiesFooterLabel.className = 'builder-properties-footer-label';

        builderPropertiesFooterLabel.innerHTML = label;
        this.content.appendChild(builderPropertiesFooterLabel);
        
        this.builderPropertiesFooterBtn = document.createElement('div');
        this.builderPropertiesFooterBtn.className = 'builder-properties-footer-btn';
        this.content.appendChild(this.builderPropertiesFooterBtn);
    }

    addButton(id, label, classes, func) {
        this.buttons[id] = func;

        const builderPropertiesBtnAdd = document.createElement('button');
        builderPropertiesBtnAdd.className = 'builder-properties-btn-add';
        builderPropertiesBtnAdd.setAttribute('data-id', id);
        builderPropertiesBtnAdd.addEventListener('click', (event) => {
            if (event.target.dataset.id in this.buttons) {
                this.buttons[event.target.dataset.id]();
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