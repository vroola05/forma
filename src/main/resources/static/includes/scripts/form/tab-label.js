export class TabLabel {
    content = document.createElement('div');

    constructor(name, label) {
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

    onTabClick(callback) {
        this.content.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = e.target.closest('.tab-nav')?.dataset.name;
            callback(tabName);
        });
    }

    setActive(active) {
        if (active) {
            this.content.classList.add('active');
        } else {
            this.content.classList.remove('active');
        }
    }

    getContent() {
        return this.content;
    }

    setShow(show) {
        if (show) {
            this.content.classList.remove('hidden');
        } else {
            this.content.classList.add('hidden');
        }
    }
}