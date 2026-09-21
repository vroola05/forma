import { OptionDto } from '../shared/model/types';

export enum FIELD_TYPE {
    FORM = 'form',
    TAB = 'tab',
    FORM_GROUP = 'form-group',
    CHECKBOX = 'checkbox',
    TEXT = 'text',
    NUMBER = 'number',
    RADIO = 'radio',
    SELECT = 'select',
    DATE = 'date',
    VALUTA = 'valuta',
    COLOR = 'color',
    REPEATING_GROUP = 'repeating-group',
    FILE = 'file',
    LABEL = 'label',
    HIDDEN = 'hidden',
    PASSWORD = 'password',
    DUAL_LISTBOX = 'dual-listbox'
}

export enum PROPERTY_TYPE {
    STRING = 'string',
    HIDDEN = 'hidden',
    SELECT = 'select',
    LABEL = 'label',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OPTIONS = 'options',
    LIST = 'list',
    CONDITION = 'condition',
}

export interface FieldProperty {
    type: PROPERTY_TYPE;
    id: string;
    order?: number;
    label: string;
    value?: any;
    pattern?: RegExp;
    message?: string,
    unique?: true,
    options?: OptionDto[]
};

export interface FieldPropertyOption {
    label: string;
    value: string;
    options?: OptionDto[],
    type: FIELD_TYPE;
}