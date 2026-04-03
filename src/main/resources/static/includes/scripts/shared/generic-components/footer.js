import { footerService } from "../services/footer-service.js";

export class Footer {
    
    constructor() {
        this.createContent();

        footerService.subscribe((buttons) => this.render(buttons));
    }


    createContent() {
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'footer';

        this.buttonsContainerLeft = document.createElement('div');
        this.buttonsContainerLeft.className = 'buttons-container-left';
        this.buttonsContainer.appendChild(this.buttonsContainerLeft);

        this.buttonsContainerRight = document.createElement('div');
        this.buttonsContainerRight.className = 'buttons-container-right';
        this.buttonsContainer.appendChild(this.buttonsContainerRight);
    }

    render(buttons) {
        this.buttonsContainerLeft.innerHTML = '';
        this.buttonsContainerRight.innerHTML = '';

        if (buttons) {
            if (buttons.left.length == 0 && buttons.right.length == 0) {
                this.buttonsContainer.parentNode.classList.add('hidden');
            } else {
                this.buttonsContainer.parentNode.classList.remove('hidden');
            }
            for (const button of buttons.left) {
                this.#addButtonLeft(button);
            }
            for (const button of buttons.right) {
                this.#addButtonRight(button);
            }
        }
        // buttons.left: [], right: [] }
    }

    #addButtonLeft(formButton) {
        this.buttonsContainerLeft.appendChild(formButton.getContent());
        
    }

    #addButtonRight(formButton) {
        this.buttonsContainerRight.appendChild(formButton.getContent());
    }

    getContent() {
        return this.buttonsContainer;
    }
}
