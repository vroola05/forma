import { FormButton } from "../form-components/components/form-button";
import { footerService } from "../services/footer-service";

export class Footer {
    footerContainer: HTMLElement = document.createElement('footer');
    buttonsContainer: HTMLDivElement = document.createElement('div');
    buttonsContainerLeft: HTMLDivElement = document.createElement('div');
    buttonsContainerRight: HTMLDivElement = document.createElement('div');

    constructor() {
        this.createContent();
        footerService.clear();
        footerService.subscribe((buttons: { left: FormButton[], right: FormButton[] }) => this.render(buttons));
    }


    createContent() {
        this.footerContainer.className = 'footer-container';

        this.buttonsContainer.className = 'footer-buttons';
        this.footerContainer. appendChild(this.buttonsContainer);
        
        this.buttonsContainerLeft.className = 'buttons-container-left';
        this.buttonsContainer.appendChild(this.buttonsContainerLeft);
        
        this.buttonsContainerRight.className = 'buttons-container-right';
        this.buttonsContainer.appendChild(this.buttonsContainerRight);
    }

    render(buttons: { left: FormButton[], right: FormButton[] }) {
        this.buttonsContainerLeft.innerHTML = '';
        this.buttonsContainerRight.innerHTML = '';

        if (buttons) {
            if (buttons.left.length === 0 && buttons.right.length === 0) {
                this.buttonsContainer?.parentElement?.classList.add('hidden');
            } else {
                this.buttonsContainer?.parentElement?.classList.remove('hidden');
            }
            
            for (const button of buttons.left) {
                this.#addButtonLeft(button);
            }
            for (const button of buttons.right) {
                this.#addButtonRight(button);
            }
        }
    }

    #addButtonLeft(formButton: FormButton) {
        this.buttonsContainerLeft.appendChild(formButton.getContent());
        
    }

    #addButtonRight(formButton: FormButton) {
        this.buttonsContainerRight.appendChild(formButton.getContent());
    }

    getContent() {
        return this.footerContainer;
    }
}
