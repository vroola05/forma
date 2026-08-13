import { Storage } from "./storage-service";

export class FieldService {
    static #fields = new Map();
    static mapLoaded = false;


    static #loadFieldsFromStorage() {

        if (FieldService.mapLoaded) {

            return;
        }

        FieldService.mapLoaded = true;
        const storeon = Storage.getPageItem('field-values');

        if (storeon !== null) {
            try {
                FieldService.#fields = new Map(Object.entries(JSON.parse(storeon)));
                return;
            } catch (e) {
                console.error("Error retreiving field-values from strage", e);
            }
        }
        FieldService.#fields = new Map();
    }

    static setFieldValue(id: string, value: any) {
        FieldService.#loadFieldsFromStorage();
        FieldService.#fields.set(id, value);

        Storage.setPageItem('field-values', JSON.stringify(Object.fromEntries(FieldService.#fields)));
    }

    static getFieldValue(id: string) {
        FieldService.#loadFieldsFromStorage();
        return FieldService.#fields.get(id);
    }
}
