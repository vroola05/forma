import { Router } from '../router.js';
import { EventService } from '../services/event-service.js';
import { Lang } from '../util/lang.js';
import { FormButton } from './form-button.js';

export class Footer {
    
    constructor() {
        this.createContent();
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

    

    addButtonLeft(formButton) {
        this.buttonsContainerLeft.appendChild(formButton.getContent());
    }

    addButtonRight(formButton) {
        this.buttonsContainerRight.appendChild(formButton.getContent());
    }

    getContent() {
        return this.buttonsContainer;
    }
}
