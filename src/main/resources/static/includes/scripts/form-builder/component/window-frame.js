export class WindowFrame {
    
    constructor(label) {
        this.frame = document.createElement('div');
        this.frame.className = 'builder-window-frame';

        this.frameHeader = document.createElement('div');
        this.frameHeader.className = 'builder-window-frame-header';
        this.frame.appendChild(this.frameHeader);

        this.frameHeaderTitle = document.createElement('div');
        this.frameHeaderTitle.className = 'builder-window-frame-header-title';
        this.frameHeaderTitle.textContent = label;
        this.frameHeader.appendChild(this.frameHeaderTitle);

        this.frameHeaderBtns = document.createElement('div');
        this.frameHeaderBtns.className = 'builder-window-frame-header-btns';
        this.frameHeader.appendChild(this.frameHeaderBtns);

        this.frameHeaderBtnCollapseOpen = document.createElement('button');
        // this.frameHeaderBtnCollapseOpen.className = 'builder-btn-icon builder-window-frame-header-btn-open';
        this.frameHeaderBtnCollapseOpen.className = 'builder-btn-icon icon icon-chevron-down';
        this.frameHeaderBtns.appendChild(this.frameHeaderBtnCollapseOpen);
        this.frameHeaderBtnCollapseOpen.onclick = () => { this.#toggleOpen() };

        this.frameHeaderBtnCollapseClose = document.createElement('button');
        // this.frameHeaderBtnCollapseClose.className = 'builder-btn-icon builder-window-frame-header-btn-close hidden';
        this.frameHeaderBtnCollapseClose.className = 'builder-btn-icon icon icon-chevron-up hidden';
        this.frameHeaderBtns.appendChild(this.frameHeaderBtnCollapseClose);
        this.frameHeaderBtnCollapseClose.onclick = () => { this.#toggleOpen() };

        this.frameContent = document.createElement('div');
        this.frameContent.className = 'builder-window-frame-content';
        this.frame.appendChild(this.frameContent);
        
    }

    #toggleOpen() {
        if (this.frameHeaderBtnCollapseOpen.classList.contains('hidden')) {
            this.frameHeaderBtnCollapseOpen.classList.remove('hidden');
            this.frameHeaderBtnCollapseClose.classList.add('hidden');
            this.frameContent.classList.remove('hidden');
        } else {
            this.frameHeaderBtnCollapseClose.classList.remove('hidden');
            this.frameHeaderBtnCollapseOpen.classList.add('hidden');
            this.frameContent.classList.add('hidden');
        }
    }
    setContent(content) {
        this.frameContent.appendChild(content);
    }

    getContent() {
        return this.frame;
    }
}