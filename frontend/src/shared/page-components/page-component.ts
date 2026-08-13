export class PageComponent {
    #subViewContainer: HTMLElement | null = null;
    #subView: PageComponent | null = null;
    subscriptions: (() => void)[] = [];
    content: HTMLElement = document.createElement('div');

    constructor() {
    }

    /**
     * If you want to use a sub-page in the current-page you need to attach
     * a container where the subpage is rendered in.
     * 
     * @param {domElement} element 
     */
    attachSubView(element: HTMLElement) {
        this.#subViewContainer = element;
        this.#attachSubView();
    }

    #attachSubView() {
        if (this.#subView && this.#subViewContainer) {
            this.#subViewContainer.innerHTML = '';
            if (this.#subView && this.#subView.getContent()) {
                this.#subViewContainer.appendChild(this.#subView.getContent());
                this.#subView.afterInit();
            }
        }
    }

    /**
     * Attach a PageComponent to the current page.
     * @param {PageComponent} component 
     */
    renderSubView(component: PageComponent) {
        this.#subView = component;
        this.#attachSubView();
    }


    afterInit() {
        
    }

    setContent(content: HTMLElement) {
        this.content = content;
    }

    getContent(): HTMLElement | DocumentFragment  {
        return this.content;
    }

    destroy() {
        
        if (this.subscriptions) {
            this.subscriptions.forEach(unsubscribe => {
                unsubscribe();
            });
            this.subscriptions = [];
        }
    }
}