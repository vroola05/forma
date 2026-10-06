import { Nucleus } from '../form-components/interface/nucleus';

import { Lang } from '../services/lang';

export enum PERMISSION {
    TENANT_CREATE_INTERNAL = 'tenant:create:internal',
    TENANT_READ = 'tenant:read',
    TENANT_READ_INTERNAL = 'tenant:read:internal',
    TENANT_UPDATE = 'tenant:update',
    TENANT_UPDATE_INTERNAL = 'tenant:update:internal',
    TENANT_DELETE = 'tenant:delete',

    USER_CREATE = 'user:create',
    USER_READ = 'user:read',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',

    GROUP_CREATE = 'group:create',
    GROUP_READ = 'group:read',
    GROUP_UPDATE = 'group:update',
    GROUP_DELETE = 'group:delete',

    FORM_CREATE = 'form:create',
    FORM_READ = 'form:read',
    FORM_UPDATE = 'form:update',
    FORM_DELETE = 'form:delete',

    SUBMISSION_CREATE = 'submission:create',
    SUBMISSION_READ = 'submission:read',
    SUBMISSION_UPDATE = 'submission:update',
    SUBMISSION_DELETE = 'submission:delete'
}

export const USER_STATUS: Record<string, () => string> = {
    INVITED: () => Lang.get('generic.status.invited'),
    ACTIVE: () => Lang.get('generic.status.active'),
    BLOCKED: () => Lang.get('generic.status.blocked'),
    PENDING_DELETION: () => Lang.get('generic.status.pending.deletion')
};

export const TENANT_STATUS: Record<string, () => string> = {
    ACTIVE: () => Lang.get('generic.status.active'),
    SUSPENDED: () => Lang.get('generic.status.suspended'),
    PENDING_DELETION: () => Lang.get('generic.status.pending.deletion')
};

export const FORM_STATUS: Record<string, () => string> = {
    DRAFT: () => Lang.get('generic.status.draft'),
    PUBLISHED: () => Lang.get('generic.status.published'),
    ARCHIVED: () => Lang.get('generic.status.archived'),
    PENDING_DELETION: () => Lang.get('generic.status.pending.deletion')
};


export const GENERIC_FIELD_TYPES = ['form', 'tab', 'form-group', 'repeating-group'] as const;
export type GenericFieldType = typeof GENERIC_FIELD_TYPES[number];

export const INPUT_FIELD_TYPES = [
    'text', 'rich-text', 'number', 'email', 'password', 'date', 
    'hidden', 'label', 'valuta', 'textarea', 'color', 'conditions-autocomplete', 'conditions'
] as const;
export type InputFieldType = typeof INPUT_FIELD_TYPES[number];

export const OPTIONS_FIELD_TYPES = ['checkbox', 'dual-listbox', 'radio', 'select', 'tag', 'file'] as const;
export type OptionFieldType = typeof OPTIONS_FIELD_TYPES[number];
export type AllFieldTypes = GenericFieldType | InputFieldType | OptionFieldType;

export type LayoutType = 'default' | 'table';

export class TenantDto {
    id?: string;
    slug?: string;
    name?: string;
    hasLogo?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    homePage?: string;
    email?: string;
    status?: string;
    tenantAdmin?: any;
}

export interface UserDto {
    name?: string;
    username?: string;
    email?: string;
    status?: string;
    groups?: string[];
    permissions?: string[];
}

export interface UserRegisterRequestDto {
    id?: string;
    name?: string;
    username?: string
    password?: string;
    email?: string;
    status?: string;
    groups?: GroupRegisterRequestDto[];
}

export interface GroupRegisterRequestDto {
    id?: string;
    name?: string;
    permissions?: string[];
}

export interface FormWrapper {
    fileName?: string;
    formConfig?: FormConfig;
    form?: FormDto;

}
export interface TranslationDto {
    locale?: string;
    text?: string;
}

export interface BaseFieldDto {
    id?: string;
    name: string;
    label?: string;
    labels?: TranslationDto[];
    type: AllFieldTypes;
    condition?: ConditionDto;
    classes?: string;
    fields?: FieldDto[];
}

export interface FormDto extends BaseFieldDto {
    metadata?: string[];
    confirmation?: any;
    confirmationCheck?: any;
    fields?: BaseFieldDto[];
    show?: boolean;
    status?: string;
    singlePage?: boolean;

}

export interface OptionDto {
    value: string;
    text: string;
    selected?: boolean;
}

export interface RepeatingGroupDto extends BaseFieldDto {
    layout?: LayoutType;
    minLength?: number;
    maxLength?: number;
    sets?: FieldDto[][];
}

export interface InputFieldDto extends BaseFieldDto {
    type: InputFieldType;
    metadata?: string[];
    classes?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
    readonly?: boolean;
    value?: any;
    change?: any;
}

export interface RichTextFieldDto extends InputFieldDto {
    inline?: boolean;
}

export interface OptionFieldDto extends BaseFieldDto {
    type: OptionFieldType;
    metadata?: string[];
    required?: boolean;
    placeholder?: string;
    readonly?: boolean;
    values?: OptionDto[];
    options?: OptionDto[];
    change?: any;
}

export interface FileOptionFieldDto extends OptionFieldDto {
    isMultiple?: boolean;
    allowedExtensions: string[];
    maxFiles? : number;
    maxFileSize?: number;
}


export type FieldDto = BaseFieldDto | InputFieldDto | RichTextFieldDto | OptionFieldDto| RepeatingGroupDto;

export interface FormConfig {
    formConfigSuccessPage?: FormConfigSuccessPageDto;
    variables?: FormVariableDto[];
}

export interface FormConfigSuccessPageDto {
    customSuccessPage?: boolean
    id?: string;
    name?: string;
    title?: string;
    template?: any;
    content?: string;
    showSummary?: boolean;
    downloadText?: string;
}

export interface FormVariableDto {
    id?: string;
    name?: string;
    tag?: string;
    values?: FormVariableValueDto[];
}

export interface FormVariableValueDto {
    id?: string;
    value?: string;
    conditions?: ConditionDto[];
}

export interface FormSubmission {
    submissionId?: string;
    content?: string;
}

export enum LogicalOperator {
    AND = 'and',
    OR = 'or'
}

export function getLogicalOperatorType(type: string | undefined): LogicalOperator {
    const isValidType = Object.values(LogicalOperator).includes(type as any);
    if (isValidType) {
        return type as LogicalOperator;
    }
    throw new Error();
}

export enum Operator {
    EQI = 'eqi',
    NEQI = 'neqi',
    EQ = 'eq',
    NEQ = 'neq',
    GT = 'gt',
    LT = 'lt',
    GTE = 'gte',
    LTE = 'lte'
}

export function getOperatorType(type: string | undefined): Operator {
    const isValidType = Object.values(Operator).includes(type as any);
    if (isValidType) {
        return type as Operator;
    }
    throw new Error();
}


export enum ConditionType {
    SIMPLE = 0,
    COMPOSITE = 1
}

export interface ConditionDto {
    conditionType?: ConditionType;

    var1?: string;
    operator?: Operator;
    var2?: string;
    logicalOperator?: LogicalOperator;
    
    conditions?: ConditionDto[];

    var2Fields?: Nucleus[];
    var1Fields?: Nucleus[];
}

