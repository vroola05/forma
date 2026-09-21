import { Lang } from '../../../shared/services/lang';
import { SettingsPage } from '../settings-page';

import { FormButton } from '../../../shared/form-components/components/form-button';
import { footerService } from '../../../shared/services/footer-service';

import { Http } from '../../../shared/services/http';
import { Router } from '../../../shared/services/router';
import { FormConfigSuccessPage, FormDto } from '../../../shared/model/types';
import { Form } from '../../../shared/form-components/form';
import { InputNucleus } from '../../../shared/form-components/interface/input-base';

export class FormSettingsGenericSuccessPage extends SettingsPage {
    formConfigSuccessPage: FormConfigSuccessPage | undefined;
    form: Form | null = null;

    constructor() {
        super(Lang.get('page.settings.generic.forms.successpage'));

        this.retrieveFormConfigSuccessPage();    
    }

    retrieveFormConfigSuccessPage() {
        Http.get(`${Router.tenantPath}/api/config/generic/success-page`).then((formConfigSuccessPage: FormConfigSuccessPage)  => {
            this.formConfigSuccessPage = formConfigSuccessPage;
            
            this.createContent();
        })
        .catch(() => {});
    }

    afterInit() {
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { }));
        footerService.addButtonRight(new FormButton(Lang.get('generic.btn.save'), 'footer-btn btn-primary save', null, () => {
            this.save();
        }));
    }

    createContent() {
        const formDto: FormDto = {
            "id": "form",
            "name": "form",
            "label": Lang.get('page.settings.generic'),
            "type": "form",
            "singlePage": true,
            "fields": [
                {
                    "id": "tab",
                    "name": "tab",
                    "type": "tab",
                    "fields": [
                        {
                            "name": "title",
                            "label": Lang.get('page.settings.generic.successpage.title'),
                            "type": "text",
                            "required": true,
                            "value": this.formConfigSuccessPage?.title
                        },
                        {
                            "name": "summary",
                            "label": Lang.get('page.settings.generic.successpage.summary'),
                            "type": "radio",
                            "required": true,
                            "options": [
                                { "value": "true", "text": Lang.get('generic.yes') },
                                { "value": "false", "text": Lang.get('generic.no') }
                            ],
                            "value": this.formConfigSuccessPage?.showSummary === undefined ? [] : [
                                {
                                    value: this.formConfigSuccessPage?.showSummary ? 'true' : 'false',
                                    text: ''
                                }
                            ]
                        },
                        {
                            "name": "success-text",
                            "label": Lang.get('page.settings.generic.successpage.text'),
                            "type": "rich-text",
                            "required": true,
                            "value": this.formConfigSuccessPage?.template
                        }
                    ]
                }
            ]
        }

        Form.create(formDto).then(form => {
            this.form = form;
            this.append(form.getContent());
            // this.append(form.getContent(), this.builderEditor.getContent());
            
        })
        .catch(() => {

        });
    }


    save() {
        if (!this.formConfigSuccessPage || !this.form) {
            return;
        }

        if (!this.form.validate()) {
            return;
        }


        const title = this.form.getTabField('tab', 'title') as InputNucleus;
        const summary = this.form.getTabField('tab', 'summary') as InputNucleus;
        const successText = this.form.getTabField('tab', 'success-text') as InputNucleus;


        this.formConfigSuccessPage.title = title.getValue();
        this.formConfigSuccessPage.template = successText.getValue();
        this.formConfigSuccessPage.showSummary = !!summary.getOptions().some(option => option.value === 'true');

        
        Http.post(`${Router.tenantPath}/api/config/generic/success-page`, this.formConfigSuccessPage, {})
            .then(() => {
                Router.home();
            })
            .catch((_error) => {

            });
    }

    destroy() {
        super.destroy();

        footerService.clear();
    }
}
