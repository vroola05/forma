
export class PageComponent {
    #subViewContainer = null;
    #subView = null;
    subscriptions = [];
    content = '';

    constructor() {

    }

    /**
     * If you want to use a sub-page in the current-page you need to attach
     * a container where the subpage is rendered in.
     * 
     * @param {domElement} element 
     */
    attachSubView(element) {
        this.#subViewContainer = element;
        this.#attachSubView();
    }

    #attachSubView() {
        if (this.#subView && this.#subViewContainer) {
            this.#subViewContainer.innerHTML = '';
            this.#subViewContainer.appendChild(this.#subView.getContent());
            this.#subView.afterInit();
        }
    }

    /**
     * Attach a PageComponent to the current page.
     * @param {PageComponent} component 
     */
    renderSubView(component) {
        if (this.#subView) {
            this.#subView.destroy();
            this.#subView = null;
        }
        this.#subView = component;
        this.#attachSubView();
    }


    afterInit() {
        
    }

    setContent(content) {
        this.content = content;
    }

    getContent() {
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