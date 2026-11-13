import { FormGroup } from '../../../shared/form-components/form-group';
import { InputNucleus } from '../../../shared/form-components/interface/input-base';
import { OptionDto } from '../../../shared/model/types';
import { Page } from '../../../shared/page-components/page';
import { EventService } from '../../../shared/services/event-service';
import { Lang } from '../../../shared/services/lang';
import { BuilderFormServiceRegistry } from '../../services/builder-form-service';
import { BuilderLayout } from './components/builder-layout';

export class BuilderPageSettingsGeneric extends Page {
    #builderLayout: BuilderLayout = new BuilderLayout();
    #builderFormService = BuilderFormServiceRegistry.get('builder-form');

    nameField?: InputNucleus;
    labelField?: InputNucleus;
    statusField?: InputNucleus;

    nameFieldFnc: (key: string, value: any) => void = (key: string, value: any) => {
            this.#builderFormService?.getBuilderForm()?.setPropertyValueById(key, value);
            EventService.emit('field-changed');
        };

    labelFieldFnc: (key: string, value: any) => void = (key: string, value: any) => {
            this.#builderFormService?.getBuilderForm()?.setDefaultLabel(value);
            EventService.emit('field-changed');
        };

    statusFieldFnc: (key: string, options: OptionDto[]) => void = (key: string, options: OptionDto[]) => {
            this.#builderFormService?.getBuilderForm()?.setPropertyValueById(key, options?.[0].value);
            EventService.emit('field-changed');
        };

    constructor() {
        super(false);
    }

    /**
     * 
     */
    afterInit() {
        this.subscriptions.push(this.#builderFormService.subscribeToForm('generic-form', (variablesForm) => {
            if (variablesForm) {
                const builderPageSettingsSuccess = document.createElement('div');
                builderPageSettingsSuccess.className = 'builder-page-settings';
                
                const header = document.createElement('h1');
                header.className = 'builder-page-settings-header';
                header.innerText = Lang.get('page.settings.generic');
                builderPageSettingsSuccess.appendChild(header);

                this.#builderLayout.setCenterContent(builderPageSettingsSuccess, true);
                
                this.#builderLayout?.setCenterContent(variablesForm.getContent());

                const genericGroup = variablesForm.getTabField('tab', 'generic-group') as FormGroup;
                this.nameField = genericGroup.getField('name');
                this.nameField?.addValueChangedListener(this.nameFieldFnc);

                this.labelField = genericGroup.getField('label');
                this.labelField?.addValueChangedListener(this.labelFieldFnc);

                this.statusField = genericGroup.getField('status');
                this.statusField?.addValueChangedListener(this.statusFieldFnc);

            }
        }));
    }

    getContent() {
        return this.#builderLayout.getContent();
    }

    destroy() {
        super.destroy();
        this.nameField?.removeValueChangedListener(this.nameFieldFnc);
        this.labelField?.removeValueChangedListener(this.labelFieldFnc);
        this.statusField?.removeValueChangedListener(this.statusFieldFnc);
    }
}
