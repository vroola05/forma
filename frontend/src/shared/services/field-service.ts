import { Storage } from "./storage-service";

export class FieldService {
    #fields = new Map();
    readonly formId: string;
    readonly #storageKey: string;

    constructor(formId: string) {
        this.formId = formId;
        this.#storageKey = `${this.formId}-field-values`;
        this.#loadFieldsFromStorage();
    }

    #loadFieldsFromStorage() {

        const storeon = Storage.getPageItem(this.#storageKey);

        if (storeon !== null) {
            try {
                this.#fields = new Map(Object.entries(JSON.parse(storeon)));
                return;
            } catch (e) {
                console.error("Error retreiving field-values from strage", e);
            }
        }
        this.#fields = new Map();
    }

    setFieldValue(id: string, value: any) {
        this.#fields.set(id, value);
        
        Storage.setPageItem(this.#storageKey, JSON.stringify(Object.fromEntries(this.#fields)));
    }

    getFieldValue(id: string) {
        return this.#fields.get(id);
    }
}


export class FieldServiceRegistryImpl {
    #instances = new Map<string, FieldService>();

    get(formId: string): FieldService {
        if (!this.#instances.has(formId)) {
            this.#instances.set(formId, new FieldService(formId));
        }
        return this.#instances.get(formId)!
    }

    destroy(formId: string): void {
        this.#instances.delete(formId);
    }
}

/**
 * Use this to receive the correct field-service
 */
export const FieldServiceRegistry = new FieldServiceRegistryImpl();