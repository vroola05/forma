export class FormButton {
    button = document.createElement('button');
    label = '';
    classes = '';
    path = '';
    event = null;
    

    constructor(label, classes, path, event, show = true) {
        this.label = label;
        this.classes = classes;
        this.path = path;
        this.event = event;
        
        this.createContent();
        if (!show) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.button.classList.remove('hidden');
    }
    hide() {
        this.button.classList.add('hidden');
    }

    createContent() {
        this.button.className = (this.classes ? ' ' + this.classes : '');
        this.button.innerText = this.label;
        if (this.path !== null) {
            this.button.href = this.path;
        }
        if (this.event) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                this.event();
            });
        }
    }

    getContent() {
        return this.button;
    }
}
