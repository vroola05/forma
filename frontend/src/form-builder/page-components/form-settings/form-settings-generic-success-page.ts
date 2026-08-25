import { Lang } from '../../../shared/services/lang';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';

import { footerService } from '../../../shared/services/footer-service';

import { BuilderEditor } from '../../component/editor/builder-editor';
import { BuilderFormService } from '../../services/builder-form-service';

export class FormSettingsGenericSuccessPage extends SettingsPage {
    builderEditor: BuilderEditor;

    constructor() {
        super(Lang.get('page.settings.generic.forms.successpage'));

        this.builderEditor = new BuilderEditor((jsonData: any) => this.onEditorValueChanged(jsonData));
        const content = this.builderEditor.getContent();
        
        this.content.append(content);
        
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            
        }));
    }

    createContent(permissions: string[]) {
    }

    onEditorValueChanged(jsonData: any) {
        const formWrapper = BuilderFormService.getFormWrapper();
        
    }


    destroy() {
        super.destroy();

        footerService.clear();
    }
}
