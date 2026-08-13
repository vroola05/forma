export class Loader {
    static loader = document.querySelector('.loader');

    static show(message: string | undefined = undefined) {
        if (Loader.loader) {
            Loader.loader.classList.add('active');
        }
    }

    static hide() {
        if (Loader.loader) {
            Loader.loader.classList.remove('active');
        }
    }
}