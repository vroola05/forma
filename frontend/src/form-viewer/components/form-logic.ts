import { FormButton } from '../../shared/form-components/components/form-button';
import { Form } from '../../shared/form-components/form';
import { Tab } from '../../shared/form-components/tab';
import { FormRenderer } from '../../shared/generic-components/form-renderer';
import { FormSubmission } from '../../shared/model/types';
import { footerService } from "../../shared/services/footer-service";
import { ErrorType, Http } from '../../shared/services/http';
import { Lang } from '../../shared/services/lang';
import { Router } from '../../shared/services/router';

export class FormLogic {
    form: Form;
    cancelBtn: FormButton;
    previousBtn: FormButton;
    nextBtn: FormButton;
    summaryBtn: FormButton;
    submitBtn: FormButton;

    currentTab: string;

    constructor(form: Form) {
        this.form = form;

        // Initialiseer de logica hier
        this.cancelBtn = new FormButton(Lang.get('generic.btn.cancel'), 'footer-btn btn-secondary cancel', null, () => { });
        this.previousBtn = new FormButton(Lang.get('generic.btn.previous'), 'footer-btn btn-secondary previous', null, () => {
            this.form.setTabPrevious();
        }, false);

        this.nextBtn = new FormButton(Lang.get('generic.btn.next'), 'footer-btn btn-primary next', null, () => {
            this.form.setTabNext();
        }, false);

        this.summaryBtn = new FormButton(Lang.get('generic.btn.summary'), 'footer-btn btn-primary next', null, () => {
            this.form.setTab(`summary`);
        }, false);

        this.submitBtn = new FormButton(Lang.get('generic.btn.send'), 'footer-btn btn-primary submit', null, () => {
            this.submitForm();
        }, false);

        footerService.addButtonLeft(this.cancelBtn);
        footerService.addButtonLeft(this.previousBtn);

        footerService.addButtonRight(this.nextBtn);
        footerService.addButtonRight(this.summaryBtn);
        footerService.addButtonRight(this.submitBtn);

        // Set the tab change handler
        // This will update the URL when the tab changes
        this.form.setOnTabChange((tab, index, size) => {
            const formNameUrlParam = Router.getUrlParameter('formName');
            Router.route(`/page/form/${formNameUrlParam}/tab/${tab.name}`);
            this.setCurrentTabButtons(tab, index, size);
        });

        // If a tab is specified in the URL parameters, set it as the active tab
        // This allows the page to load with the correct tab based on the URL
        const tabNameUrlParam = Router.getUrlParameter('tabName');

        this.currentTab = tabNameUrlParam ?? this.form.fields[0].name;

        this.form.setTab(this.currentTab);
    }

    setCurrentTabButtons(tab: Tab, index: number, size: number) {
        this.previousBtn.hide();
        this.nextBtn.hide();
        this.summaryBtn.hide();
        this.submitBtn.hide();
        this.submitBtn.hide();

        if (index > 0) {
            this.previousBtn.show();
        }

        if (index <= size - 3) {
            this.nextBtn.show();
        }
        else if (index === size - 2) {
            this.summaryBtn.show();
        }
        else if (index === size - 1) {
            this.submitBtn.show();
        }
    }

    submitForm() {
        if (!this.form.validate()) {
            return;
        }

        const formData = FormRenderer.getFormData(this.form);

        Http.post(`${Router.tenantPath}/api/forms`, formData, {})
            .then(formSubmissionData => {
                const formNameUrlParam = Router.getUrlParameter('formName');
                Router.route(`/page/form/${formNameUrlParam}/success`, {
                    formSubmission: formSubmissionData as FormSubmission
                });
            }).catch(error => {
                if (error.type === ErrorType.VALIDATION) {
                    this.form.validateBE(error.getDetails());
                }
            });
    }
}