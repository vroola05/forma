import { FormButton } from "../../shared/form-components/components/form-button";
import { LabelsDto } from "../../shared/model/types";
import { EventService } from "../../shared/services/event-service";
import { Lang } from "../../shared/services/lang";
import { BuilderFieldInterface } from "../fields/builder-field-interface";
import { FieldProperty } from "../types";

export class BuilderPropertiesLabelType  {
    content = document.createElement('div');
    builderProperties = document.createElement('div');
    builderPropertiesLocaleContainer = document.createElement('div');
    input = document.createElement('input');

    field: BuilderFieldInterface | undefined = undefined;
    
    property: FieldProperty;

    defaultLocale = 'nl';

    subscriptions: (() => void)[] = [];

    constructor(field: BuilderFieldInterface, property: FieldProperty) {
        this.field = field;
        this.property = property;

        this.builderProperties.className = 'builder-properties builder-properties-label';
        
        const label = document.createElement('label');
        label.textContent = property.label;
        label.htmlFor = `field-property-${property.id}`;
        label.className = 'builder-properties-label';
        this.builderProperties.appendChild(label);


        const builderPropertiesFieldWrapper = document.createElement('div');
        builderPropertiesFieldWrapper.className = 'builder-properties-field-wrapper';
        this.builderProperties.appendChild(builderPropertiesFieldWrapper);

        const builderPropertiesField = document.createElement('div');
        builderPropertiesField.className = 'builder-properties-field';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.id = `field-property-${property.id}`;
        this.input.value = property.value;
        this.input.placeholder = property.label;
        this.input.className = 'form-control';
        this.input.onchange = (event) => {
            const target = event.target as HTMLInputElement;
            const id = target?.dataset?.id;

            if (id === undefined) {
                return;
            }

            this.getValues();
            this.setValue(this.field?.fieldProperties?.properties.get(id), this.defaultLocale, target);
        };

        this.input.dataset.id = property.id;

        const addBtn = new FormButton('', 'builder-btn-icon icon icon-plus-lg');
        addBtn.addEvent((e?: PointerEvent | undefined) => {
            this.createLabelLocale();
        });
        builderPropertiesFieldWrapper.appendChild(addBtn.getContent());

        this.builderPropertiesLocaleContainer.className = 'builder-properties-field-locale-container';

        const inputErrors = document.createElement('div');
        inputErrors.className = 'invalid-feedback';

        builderPropertiesField.append(this.input, addBtn.getContent());
        builderPropertiesFieldWrapper.append(builderPropertiesField, this.builderPropertiesLocaleContainer, inputErrors);

    }

    createLabelLocale() {
        const builderPropertiesLocale = document.createElement('div');
        builderPropertiesLocale.className = 'builder-properties-field-locale';

        
        const localeOptions = document.createElement('select');
        localeOptions.className = 'form-control';

        const locales = Lang.geDefaultLanguages();
        for(const locale of locales) {
            if (locale === this.defaultLocale) {
                continue;
            }

            const option = document.createElement('option');
            option.value = locale;
            option.textContent = locale;

            localeOptions.appendChild(option);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = this.property.label;
        input.className = 'form-control';

        const deleteBtn = new FormButton('', 'builder-btn-icon icon icon-x-lg');

        builderPropertiesLocale.append(localeOptions, input, deleteBtn.getContent());
        this.builderPropertiesLocaleContainer.append(builderPropertiesLocale);
    }

    getValues() {
        for (const builderPropertiesLocale of this.builderPropertiesLocaleContainer.children) {
            const [rawLocale, rawInput] = builderPropertiesLocale.children;
            const localeDom = rawLocale as HTMLSelectElement;
            const inputDom = rawInput as HTMLInputElement;
        }
    }


    setValue(property: FieldProperty| undefined, locale: string, target: HTMLInputElement) {
        
        if (!property) {
            return;
        }

        const valueOld = this.field?.getPath(); //prop.value;
        property.value = target.value;
        

        this.onPropertyChanged(target, property, valueOld);

        if (!this.validate(property, target)) {
            return;
        }
         
    }

    validate(property: FieldProperty, input: HTMLInputElement) {
        input.classList.remove('is-invalid');
        const feedback = input.parentElement?.querySelector('.invalid-feedback')

        if (feedback) {
            feedback.innerHTML = '';
        }
        try {
            this.field?.fieldProperties.validate(property, undefined);
        } catch(error) {
            input.classList.add('is-invalid');
            if (feedback && error instanceof Error) {
                feedback.innerHTML = error.message;
            }
            return false;
        }
        return true;
    }

    onPropertyChanged(input: HTMLElement, property: FieldProperty, valueOld: any = undefined) {
        input.classList.remove('is-invalid');
        try {

            // Place all onProperyChanged before the value-changed
            // so the changes will be saved
            this.field?.fieldProperties?.onPropertyChanged
                    .get(property.id)?.forEach((callback: (value: any, valueOld: any) => void) => callback(property.value, valueOld));

            EventService.emit('value-changed', this.field);
        } catch(error) {
            input.classList.add('is-invalid');
        }
    }

    destroy() {
        for(const unsubscribe of this.subscriptions) {
            unsubscribe();
        }
        this.subscriptions = [];
    }

    getContent() {
        return this.builderProperties;
    }
}