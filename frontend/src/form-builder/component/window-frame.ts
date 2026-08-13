export class WindowFrame {
    frame = document.createElement('div');
    frameHeaderTitle = document.createElement('div');
    frameHeaderBtnCollapseOpen = document.createElement('button');
    frameHeaderBtnCollapseClose = document.createElement('button');
    frameHeaderBtnClose = document.createElement('div');
    frameContent = document.createElement('div');

    constructor(label: string, collapsed: boolean = false) {
        this.frame.className = 'builder-window-frame';

        const frameHeader = document.createElement('div');
        frameHeader.className = 'builder-window-frame-header';
        this.frame.appendChild(frameHeader);

        this.frameHeaderTitle.className = 'builder-window-frame-header-title';
        this.frameHeaderTitle.textContent = label;
        frameHeader.appendChild(this.frameHeaderTitle);

        const frameHeaderBtns = document.createElement('div');
        frameHeaderBtns.className = 'builder-window-frame-header-btns';
        frameHeader.appendChild(frameHeaderBtns);

        this.frameHeaderBtnCollapseOpen.className = 'builder-btn-icon icon icon-chevron-down';
        frameHeaderBtns.appendChild(this.frameHeaderBtnCollapseOpen);
        this.frameHeaderBtnCollapseOpen.onclick = () => { this.#toggleOpen() };

        this.frameHeaderBtnCollapseClose.className = 'builder-btn-icon icon icon-chevron-up hidden';
        frameHeaderBtns.appendChild(this.frameHeaderBtnCollapseClose);
        this.frameHeaderBtnCollapseClose.onclick = () => { this.#toggleOpen() };

        this.frameHeaderBtnClose.className = 'builder-btn-icon icon icon-x-lg hidden';
        frameHeaderBtns.appendChild(this.frameHeaderBtnClose);

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

    show() {
        if (this.frame.classList.contains('hidden')) {
            this.frame.classList.remove('hidden');
        }
    }

    hide() {
        this.frame.classList.add('hidden');
    }

    onClose(callback: () => void) {
        this.frameHeaderBtnClose.classList.remove('hidden');
        this.frameHeaderBtnClose.addEventListener('click', (event) => {
            event.preventDefault();
            callback();
        });
    }

    setContent(content: HTMLElement) {
        this.frameContent.appendChild(content);
    }

    setLabel(label: string) {
        this.frameHeaderTitle.textContent = label;
    }

    getContent() {
        return this.frame;
    }
}