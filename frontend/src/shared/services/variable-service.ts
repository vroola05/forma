import { FormVariableDto } from "../model/types";
import { Storage } from "./storage-service";

export class VariableServiceImpl {
    variables: Map<string, FormVariableDto[]>= new Map();

    constructor() {
        const pageVariables = Storage.getPageItem('page-variables');
        if (pageVariables) {
            this.variables = JSON.parse(pageVariables);
        }
    }

    set(formId: string, variables: FormVariableDto[]) {
        this.variables.set(formId, variables);
        Storage.setPageItem('page-variables', JSON.stringify(variables));
    }

    get(formId: string) {
        return this.variables.has(formId) ? this.variables.get(formId) : undefined;
    }
}

export const VariableService = new VariableServiceImpl();
