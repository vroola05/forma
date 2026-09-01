import { FormRenderer } from "../generic-components/form-renderer";
import { BaseFieldDto, LayoutType, RepeatingGroupDto } from "../model/types";
import { FieldService } from "../services/field-service";
import { FormButton } from "./components/form-button";
import { InputNucleus } from "./interface/input-base";
import { Nucleus } from "./interface/nucleus";

export class RepeatingGroup extends Nucleus {
    repeatingGroupFieldDom = document.createElement('div');
    repeatingGroupContainerDom = document.createElement('div');

    repeatingGroupFooterDom = document.createElement('div');

    repeatingGroupFooterAddBtn: FormButton | undefined;

    minLength: number | undefined = undefined;
    maxLength: number | undefined = undefined;

    layout: LayoutType = 'default';

    callback: ((name: string, value: any, field: Nucleus) => void)[] = [];

    fields: BaseFieldDto[] | undefined = [];

    sets: { deleteBtn: FormButton | undefined; fields: InputNucleus[] | undefined }[] = [];

    constructor(baseFieldDto: RepeatingGroupDto, id: string | undefined = undefined) {
        super(baseFieldDto.name, baseFieldDto.labels, id);
        
        this.label = baseFieldDto.label;
        this.type = baseFieldDto.type;

        this.fields = baseFieldDto.fields;

        this.minLength = baseFieldDto.minLength;
        this.maxLength = baseFieldDto.maxLength;

        this.layout = baseFieldDto.layout;

        this.setShowConditions(baseFieldDto?.condition);

        this.createElement(baseFieldDto.classes);
    }

    async init(baseFieldDto: BaseFieldDto): Promise<this> {

        const setsStr = FieldService.getFieldValue(this.getId());
        if (setsStr) {
            const sets = Number(setsStr);
            for (let index = 0; index < sets; index++) {
                await this.addRow();
            }
        }

        return this;
    }

    /**
     * 
     */
    afterInit() {

        this.checkMinMaxAmount().then(()=> {}).catch(() => {});
    }

    /**
     * 
     * @param {*} classes 
     */
    createElement(classes: string = '') {
        this.repeatingGroupFieldDom.className = 'repeating-group-field' + (!classes ? '' : ' ' + classes);

        this.repeatingGroupContainerDom.className = 'repeating-group-container';
        this.repeatingGroupFieldDom.append(this.repeatingGroupContainerDom);

        this.repeatingGroupFooterDom.className = 'repeating-group-footer';

        const repeatingGroupFooterLabelDom = document.createElement('div');
        repeatingGroupFooterLabelDom.className = 'repeating-group-footer-label';
        repeatingGroupFooterLabelDom.innerHTML = `${this.getLabel()} toevoegen`;
        this.repeatingGroupFooterDom.append(repeatingGroupFooterLabelDom);

        this.repeatingGroupFooterAddBtn = new FormButton('', 'icon icon-plus-lg', null, (e?: PointerEvent | undefined) => {
            if (!e) {
                return;
            }
            e.preventDefault();
            this.addRow()
                .then(() => { })
                .catch(() => { });

            this.valueChanged();
        });

        this.repeatingGroupFooterDom.append(this.repeatingGroupFooterAddBtn.getContent());

        this.repeatingGroupFieldDom.append(this.repeatingGroupFooterDom);
    }

    addValueChangedListener(callback: (name: string, value: any, field: Nucleus) => void) {
        if (!callback) {
            return this;
        }
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }
        this.callback.push(callback);
        return this;
    }

    /**
     * 
     */
    async addRow() {
        const index = this.sets.length;
        this.sets.push({ deleteBtn: undefined, fields: [] });
        if (this.maxLength && index >= this.maxLength) {
            console.error('can\'t append new row');
            return;
        }

        const repeatingGroup = await this.createRepeatingGroup(index);

        this.repeatingGroupContainerDom.appendChild(repeatingGroup);
        this.valueChanged();
    }

    async createRepeatingGroup(index: number): Promise<HTMLElement> {
        const repeatingGroup = document.createElement('div');
        repeatingGroup.className = 'repeating-group';

        const title = document.createElement('div');
        title.className = 'repeating-group-title';
        title.innerHTML = `<div class="repeating-group-title-text">${this.getLabel()} ${index + 1}</div>`;

        const deleteBtn = new FormButton('', 'repeating-group-delete-btn icon icon-x-lg', null, (e?: PointerEvent | undefined) => {
            if (!e) {
                return;
            }
            e.preventDefault();
            const target = e.target as Element;
            const closestRepeatingGroup = target.closest('.repeating-group') as HTMLElement;

            if (closestRepeatingGroup) {
                this.onRemoveRepeatingGroup(closestRepeatingGroup);
            }

        });

        this.sets[index].deleteBtn = deleteBtn;

        title.appendChild(deleteBtn.getContent());
        repeatingGroup.append(title);

        const repeatingGroupInnerContainerDom = document.createElement('div');
        repeatingGroupInnerContainerDom.className = 'repeating-group-inner-container';
        repeatingGroup.append(repeatingGroupInnerContainerDom);
        await this.createFields(index, repeatingGroupInnerContainerDom);

        return repeatingGroup;
    }

    async createFields(index: number, repeatingGroupInnerContainerDom: HTMLElement) {
        if (!this.fields || !this.sets[index].fields) {
            return;
        }

        for (const fieldDto of this.fields) {
            const field = await FormRenderer.createField(fieldDto, `set-${index}`);
            if (!field || (!(field instanceof InputNucleus))) {
                throw new Error('Input must be an instance of Input class');
            }

            repeatingGroupInnerContainerDom.appendChild(field.getContent());
            this.sets[index].fields.push(field);
            field.afterInit();
        }

    }

    onRemoveRepeatingGroup(repeatingGroup: HTMLElement) {
        const index: number = [...this.repeatingGroupContainerDom.children].indexOf(repeatingGroup);
        if (index === undefined) {
            return;
        }

        repeatingGroup.remove();
        this.sets.splice(index, 1);

        this.valueChanged();
    }

    valueChanged(noCallback: boolean = false, value: any = undefined) {
        if (noCallback) {
            return;
        }

        FieldService.setFieldValue(this.getId(), this.sets.length);

        if (this.callback.length > 0) {
            this.callback.forEach(callback => {
                callback(this.name, this.sets.length, this);
            });
        }

        this.checkMinMaxAmount().then(() => {}).catch(() => {});
    }

    /**
     * 
     */
    async checkMinMaxAmount() {
        if (this.minLength && this.minLength > 0) {
            if (this.sets.length < this.minLength) {
                for (let i = this.sets.length; i < this.minLength; i++) {
                    await this.addRow();
                }
            }
            for (const set of this.sets) {
                if (this.sets.length <= this.minLength) {
                    set.deleteBtn?.hide();
                } else {
                    set.deleteBtn?.show()
                }
            };
        }

        if (this.maxLength && this.maxLength > 0) {
            if (this.sets.length >= this.maxLength) {
                this.repeatingGroupFooterAddBtn?.hide();
            } else {
                this.repeatingGroupFooterAddBtn?.show();
            }
        }
    }

    
    getSets(): Nucleus[][] {
        return this.sets.map(set => set.fields) as Nucleus[][];
    }


    /**
     * Valideert het formulier door alle geregistreerde inputs te controleren.
     * Het voegt de 'was-validated' klasse toe aan het formulier om de validatie visueel weer te geven.
     * @param {*} name
     * @return {boolean} true als alle inputs geldig zijn, anders false
     */
    validate() {
        if (!this.getShow()) {
            return true;
        }

        let valid: boolean = true;
        for (const set of this.sets) {
            valid = this.#validateSet(set.fields ?? []);
        }
        return valid;
    }

    #validateSet(set: InputNucleus[]): boolean {
        let valid = true;
        for (const input of set) {
            if (!input.validate()) {
                valid = false;
            }
        }
        return valid;
    }

    /**
     * 
     * @returns 
     */

    getValue() {
        return null;
    }

    hasSets(): boolean {
        return true;
    }

    /**
     * Geeft het formulier terug dat moet worden weergegeven.
     * @param {} name 
     * @returns 
     */
    getContent() {
        return this.repeatingGroupFieldDom;
    }

}