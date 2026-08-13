import { FormButton } from "../../../../shared/form-components/components/form-button";
import { Storage } from '../../../../shared/services/storage-service';

export class BuilderSpacer {
    content = document.createElement('div');
    spacerBtnsTop = document.createElement('div');
    spacerBtnsCenter = document.createElement('div');
    
    spacerLine = document.createElement('div');

    panel: HTMLElement;
    identifier: string;

    inverted: boolean = false;
    minWidth = 10;
    maxWidth = 50;

    toggleRelative: FormButton;
    toggleAbsolute: FormButton;
    toggleExpand: FormButton;
    toggleCollapse: FormButton;

    state: {
        isRelative: boolean,
        isExpanded: boolean,
        width: number| undefined} = {
        isRelative: true,
        isExpanded: false,
        width: undefined
    };

    onMoveEvent = (e: MouseEvent) => {
        e.preventDefault();

        const parent = this.content.parentNode as HTMLElement
        if (!parent) {
            return;
        }

        const startX = e.clientX;
        const startWidth = this.panel.getBoundingClientRect().width;

        document.body.classList.add('is-resizing');

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (this.inverted) {
                const deltaX = startX - moveEvent.clientX;
                this.#setWidth(startWidth + deltaX);
            } else {
                const deltaX = startX - moveEvent.clientX;
                this.#setWidth(startWidth - deltaX);
            }

            
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            document.body.classList.remove('is-resizing');

            this.setState();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    constructor(identifier: string, panel: HTMLElement, inverted: boolean = false) {
        this.inverted = inverted;
        this.identifier = identifier;


        const state = Storage.getSessionItem(this.identifier);
        if (state) {
            this.state = JSON.parse(state);
        }

        //////////////////////////////
        // Spacer 
        //////////////////////////////
        this.panel = panel;

        this.content.className = 'builder-page-spacer spacer-relative';
        

        //////////////////////////////
        // Spacer buttons top
        //////////////////////////////
        this.spacerBtnsTop.className = 'builder-page-spacer-btns';
        this.content.appendChild(this.spacerBtnsTop);

        this.toggleRelative = new FormButton('', 'builder-page-spacer-btn icon icon-pin-angle')
            .setEvent(() => {
                this.setAbsolute();
            });
        this.spacerBtnsTop.appendChild(this.toggleRelative.getContent());

        this.toggleAbsolute = new FormButton('', 'builder-page-spacer-btn icon icon-pin-angle-fill')
            .setEvent(() => {
                this.setRelative();
                
            });

        this.spacerBtnsTop.appendChild(this.toggleAbsolute.getContent());

        //////////////////////////////
        // Spacer buttons line
        //////////////////////////////
        
        this.spacerLine.className = 'builder-page-spacer-line hidden';
        this.content.appendChild(this.spacerLine);

        //////////////////////////////
        // Spacer buttons center
        //////////////////////////////
        this.spacerBtnsCenter.className = 'builder-page-spacer-btns spacer-btns-center';
        this.content.appendChild(this.spacerBtnsCenter);

        this.toggleExpand = new FormButton('', 'builder-page-spacer-btn icon ' + (this.inverted ? 'icon-chevron-left' : 'icon-chevron-right'))
            .setEvent(() => {
                this.setExpanded(true);
                this.setState();
            });

        this.toggleCollapse = new FormButton('', 'builder-page-spacer-btn icon ' + (this.inverted ? 'icon-chevron-right' : 'icon-chevron-left'))
            .setEvent(() => {
                this.setExpanded(false);

                this.setState();
            })
            .hide();

        this.spacerBtnsCenter.appendChild(this.toggleExpand.getContent());
        this.spacerBtnsCenter.appendChild(this.toggleCollapse.getContent());

        requestAnimationFrame(() => {
            
            if (this.state.isRelative) {
                this.setRelative(false);
                this.setExpanded(this.state.isExpanded);
            } else {
                this.setAbsolute(false);
                if (this.state.width) {
                    this.#setWidth(this.state.width);
                }
            }
        });
    }

    setExpanded(expanded: boolean) {
        if (expanded) {
            this.panel.classList.add('expanded');
            this.toggleExpand.hide();
            this.toggleCollapse.show();
            this.state.isExpanded = true;
        } else {
            this.panel.classList.remove('expanded');
            this.toggleCollapse.hide();
            this.toggleExpand.show();
            this.state.isExpanded = false;
        }
    }

    setRelative(clearState: boolean = true) {
        this.#clearWith();
        this.content.classList.remove('spacer-absolute');
        this.content.classList.add('spacer-relative');
        this.toggleAbsolute.hide();
        this.toggleRelative.show();
        this.spacerLine.classList.add('hidden');
        this.spacerBtnsCenter.classList.remove('hidden');

        if (clearState) {
            this.state.isRelative = true;
            this.state.isExpanded = false;
            this.setState();
        }

        this.removeOnMoveEvent();
    }

    setAbsolute(clearState: boolean = true) {
        this.content.classList.remove('spacer-relative');
        this.content.classList.add('spacer-absolute');
        this.toggleRelative.hide();
        this.toggleAbsolute.show();
        this.spacerLine.classList.remove('hidden');
        this.spacerBtnsCenter.classList.add('hidden');

        if (clearState) {
            this.state.isRelative = false;
            this.setState();
        }

        this.addOnMoveEvent();
    }

    addOnMoveEvent() {
        this.content.addEventListener('mousedown', this.onMoveEvent);
    }

    removeOnMoveEvent() {
        this.content.removeEventListener('mousedown', this.onMoveEvent);
    }

    #clearWith() {
        this.panel.style.width = '';
    }

    setState() {
        Storage.setSessionItem(this.identifier, JSON.stringify(this.state));
    }

    #setWidth(widthPixel: number) {
        
        const parent = this.content.parentNode as HTMLElement
        if (!parent) {
            return;
        }

        
        const containerWidth = parent.getBoundingClientRect().width;
        const percentageWidth = (widthPixel / containerWidth) * 100;

        if(percentageWidth < this.minWidth) {
            this.panel.style.width = `${this.minWidth}%`;
        } else 
        if(percentageWidth > this.maxWidth) {
            this.panel.style.width = `${this.maxWidth}%`;
        } else  {
            this.panel.style.width = `${percentageWidth.toFixed(2)}%`;
            
        }

        this.state.width = widthPixel;
    }

    getContent() {
        return this.content;
    }
}