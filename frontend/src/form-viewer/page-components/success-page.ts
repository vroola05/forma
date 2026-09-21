import { FormButton } from '../../shared/form-components/components/form-button';
import { Footer } from '../../shared/generic-components/footer';
import { Header } from '../../shared/generic-components/header';
import { FormConfigSuccessPage, FormSubmission } from '../../shared/model/types';
import { Page } from '../../shared/page-components/page';
import { Http } from '../../shared/services/http';
import { Lang } from '../../shared/services/lang';
import { Router } from '../../shared/services/router';

import { Storage } from '../../shared/services/storage-service';

export class SuccessPage extends Page {
    content = document.createElement('div');
    pageContentContainer = document.createElement('div');
    formContainer = document.createElement('div');
    successPage = document.createElement('div');
    pageTitle = document.createElement('h1');

    header: Header = new Header();
    footer: Footer = new Footer();


    formName: string = '';
    projectName: string = '';

    constructor() {
        super();

        const formNameUrlParam = Router.getUrlParameter('formName');

        if (formNameUrlParam) {
            this.formName = formNameUrlParam;
            this.setPageParameters({ formName: this.formName });

            this.createContent();


        }
    }

    createContent() {
        this.content.className = 'page-wrapper';

        this.pageTitle.className = 'page-title';
        this.pageTitle.innerHTML = '';
        this.content.append(this.pageTitle);

        this.pageContentContainer.id = 'page-content-container';
        this.pageContentContainer.className = 'page-content-container';
        this.content.append(this.pageContentContainer);

        this.formContainer.className = 'form-container';
        this.pageContentContainer.appendChild(this.formContainer);

        this.successPage.className = 'success-page';
        this.formContainer.appendChild(this.successPage);
    }

    afterInit() {
        let formSubmission = Router.getDataParameter('formSubmission') as FormSubmission;
        if (!formSubmission) {
            const formSubmissionData = Storage.getPageItem('formSubmission');
            if (formSubmissionData) {
                formSubmission = JSON.parse(formSubmissionData) as FormSubmission;
            }
        } else {
            Storage.setPageItem('formSubmission', JSON.stringify(formSubmission));
        }

        Http.post(`${Router.tenantPath}/api/forms/success-page`, formSubmission, {})
            .then(formConfigSuccessPageData => {
                const formConfigSuccessPage = formConfigSuccessPageData as FormConfigSuccessPage;

                this.setTitle(formConfigSuccessPage.title || '');
                this.successPage.innerHTML = '';

                this.#createSuccessPageContent(formConfigSuccessPage);

                if (formConfigSuccessPage.showSummary) {
                    this.#createDownloadButton(formConfigSuccessPage);
                }
                

            }).catch(() => { });
    }

    #createSuccessPageContent(formConfigSuccessPage: FormConfigSuccessPage) {
        const contentContainer = document.createElement('div');
        contentContainer.className = 'success-page-content-container';
        if (formConfigSuccessPage.content) {
            contentContainer.innerHTML = formConfigSuccessPage.content;
        }

        this.successPage.appendChild(contentContainer);
    }

    #createDownloadButton(formConfigSuccessPage: FormConfigSuccessPage) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'success-page-btn-container';
        this.successPage.appendChild(buttonContainer);

        const downloadBtnLabel = formConfigSuccessPage?.downloadText !== undefined && formConfigSuccessPage?.downloadText !== '' ? formConfigSuccessPage.downloadText : Lang.get('page.successpage.download.pdf');

        const formButton = new FormButton(downloadBtnLabel, 'icon icon-cloud-download', undefined, (e?: PointerEvent) => {
            this.#downloadPdf();
        });
        buttonContainer.appendChild(formButton.getContent());
    }

    #downloadPdf() {
        const formSubmission = Storage.getPageItem('formSubmission');
        if (formSubmission) {
            const formSubmissionData = JSON.parse(formSubmission) as FormSubmission;
            Http.post(`${Router.tenantPath}/api/forms/pdf`, formSubmissionData, { responseType: 'blob' })
                .then((response: any) => {
                    const blob = response.data ? response.data : response;
                    if (!(blob instanceof Blob)) {
                        throw new Error("De response data is geen geldige Blob");
                    }

                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `formulier-${formSubmissionData.submissionId}.pdf`;
                    document.body.appendChild(a);
                    a.click();

                    a.remove();
                    window.URL.revokeObjectURL(url);
                })
                .catch((err) => {
                });
        }
    }


    setTitle(title: string) {
        this.title = title;

        const titleDom = document.createElement('span');
        titleDom.innerHTML = title;

        this.pageTitle.innerHTML = '';
        this.pageTitle.appendChild(titleDom);
        document.title = title;
    }

    getContent() {
        const fragment = document.createDocumentFragment();
        fragment.append(
            this.header.getContent(),
            this.content,
            this.footer.getContent());

        return fragment;
    }

}
