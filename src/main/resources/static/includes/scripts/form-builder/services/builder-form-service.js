

export class BuilderFormService {
    static builderForm = undefined;

    static get() {
        return this.builderForm;
    }

    static set(builderForm) {
        this.builderForm = builderForm;
        
    }

}