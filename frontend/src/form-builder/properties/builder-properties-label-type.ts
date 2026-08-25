import { OptionDto } from "../../shared/model/types";
import { Lang } from "../../shared/services/lang";
import { BuilderFieldInterface } from "../fields/builder-field-interface";
import { FIELD_TYPE, FieldProperty, FieldPropertyOption } from "../types";
import { BuilderPropertiesOptionsType } from "./builder-properties-options-type";

export class BuilderPropertiesLabelType extends BuilderPropertiesOptionsType {

    constructor(field: BuilderFieldInterface, property: FieldProperty) {
        
        const fieldPropertyOptions: FieldPropertyOption[] = [
            {label: 'Taal', value: '', type: FIELD_TYPE.SELECT, options: Lang.get_default_languages()
                    .map(lang => { return {
                        'value': lang, 'text': lang} as OptionDto
                    })},
            {label: 'Label', value: '', type: FIELD_TYPE.TEXT}
        ];

        super(field, property, fieldPropertyOptions);
    }
}