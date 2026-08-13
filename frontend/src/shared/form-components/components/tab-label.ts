export class TabLabel {
    content = document.createElement('div');

    name: string = '';
    label: string | undefined = ''
    isActive: boolean = false;

    constructor(name: string, label: string | undefined) {
        this.name = name;
        this.label = label;
        this.isActive = false;

        this.createElement();
    }

    createElement() {
        this.content.className = 'tab-nav flex-sm-fill text-sm-center nav-link';
        this.content.setAttribute('data-name', this.name); 
        this.content.innerHTML = `<span>${this.label}</span>`;
    }

    onTabClick(callback: (tabName: string | undefined) => void) {
        this.content.addEventListener('click', (e) => {
            e.preventDefault();
            const element = (e.target as Element)?.closest('.tab-nav') as HTMLElement;
            
            const tabName = element.dataset.name;
            callback(tabName);
        });
    }

    setActive(active: boolean) {
        if (active) {
            this.content.classList.add('active');
        } else {
            this.content.classList.remove('active');
        }
    }

    getContent() {
        return this.content;
    }

    setShow(show: boolean) {
        if (show) {
            this.content.classList.remove('hidden');
        } else {
            this.content.classList.add('hidden');
        }
    }
}