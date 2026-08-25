import { OptionDto } from '../model/types';
import { Http } from '../services/http';
import { Lang } from '../services/lang';
import { FormButton } from './components/form-button';
import { InputNucleus } from './interface/input-base';

export interface FileUploadOption {
    value: string;
    text: string;
    size: number;
}

/**
 * Textfield
 */
export class FileUploadField extends InputNucleus<HTMLInputElement> {
    addFilesContainer: HTMLDivElement = document.createElement('div');

    fileUploads: FileUpload[] = [];

    #uploadContainer: HTMLDivElement = document.createElement('div');
    #uploadFileContainer: HTMLDivElement = document.createElement('div');

    maxFileSize: number | undefined = undefined; //  Mega Bytes bijv. 10MB)
    allowedExtensions: string[] = [];  //['png', 'svg', 'pdf']
    isMultiple: boolean = false;
    maxFiles: number = 20;

    postUrl: string | undefined = undefined;
    deleteUrl: string | undefined = undefined;
    clientSessionId: string | undefined = undefined;

    value: FileUploadOption[] = [];

    constructor( name: string, label: string | undefined, id: string | undefined = undefined) {
        super(document.createElement('input'), name, label, id);

        this.createElement();
        this.bindEvents();
    }

    createElement() {
        this.setType('file');

        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.getId();
        this.inputElement.addEventListener('change', (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) {
                return;
            }
            this.addUploads(Array.from(files));
        });

        this.#uploadContainer.className = 'file-upload-wrapper';
        
        this.#uploadFileContainer.className = 'file-upload-container';

        this.addFilesContainer.className = 'file-upload-helper';
        const uploadHelper = document.createElement('div');
        uploadHelper.innerHTML = Lang.get('field.upload.helper.text');

        const addBtn = new FormButton('', 'btn-primary icon icon-plus-lg', null,
            () => {
                this.inputElement.click();
            });

        this.addFilesContainer.append(uploadHelper, addBtn.getContent());
        this.#uploadContainer.append(this.#uploadFileContainer, this.addFilesContainer);

        this.createInput(this.#uploadContainer);
    }

    setType(type: string) {
        this.type = type;
        this.inputElement.type = type;
        return this;
    }

    setMaxFiles(maxFiles: number | undefined) {
        if (maxFiles) {
            this.maxFiles = Number(maxFiles) || this.maxFiles;
        }
        return this;
    }

    setIsMultiple(multiple = true) {
        this.isMultiple = multiple;
        if (multiple) {
            this.inputElement.setAttribute('multiple', '');
        } else {
            this.inputElement.removeAttribute('multiple');
        }
        return this;
    }

    isMaxFiles(fileAmount: number) {
        if ((!this.isMultiple && fileAmount >= 1) || (this.isMultiple && this.maxFiles && fileAmount >= this.maxFiles)) {
            this.addFilesContainer.classList.add('hidden');
            
            return true;
        }
        this.addFilesContainer.classList.remove('hidden');
        return false;
    }

    addUploads(files: File[]) {
        files = files ?? [];
        this.errors = [];
        this.setValidationState(true);

        const fileAmount = this.fileUploads.length + files.length;
        
        if (!this.isMultiple && fileAmount > 1) {
            this.errors.push(Lang.get('field.upload.error.max.files', 1));
            this.setValidationState(false);
            return;
        } else if (this.isMultiple && this.maxFiles && fileAmount > this.maxFiles) {
            this.errors.push(Lang.get('field.upload.error.max.files', this.maxFiles));
            this.setValidationState(false);
            return;
        }
        
        const uploadPromises = [];

        for (const file of files) {
            const fileUpload = this.createUpload(file.name, file);
            fileUpload.setSize(file?.size);
            if (this.postUrl && this.clientSessionId) {
                const promise = this.uploadFile(fileUpload);

                if (promise) {
                    uploadPromises.push(promise);
                }
            } else {
                this.fileUploads.push(fileUpload);
            }
        }

        // If all files have been uploaded
        Promise.all(uploadPromises)
            .then(() => {
                this.value = this.fileUploads.map(fileUpload => fileUpload.getValue());
                this.isMaxFiles(this.fileUploads.length);
                this.valueChanged();
            }).catch(() => {});
    }

    createUpload(fileName: string, file: File | undefined = undefined) {
        const fileUpload = new FileUpload(fileName, file, fileUploadRemove => {
            // Delete from array
            const index = this.fileUploads.indexOf(fileUploadRemove);
            if (index !== -1) {
                this.fileUploads.splice(index, 1);
            }

            // Delete the file on the backend
            this.deleteFile(fileUploadRemove);
        });

        this.#uploadFileContainer.append(fileUpload.getContent());

        return fileUpload;
    }

    async uploadFile(fileUpload: FileUpload) {
        if (!this.id || !this.postUrl || !this.clientSessionId || !fileUpload.file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', fileUpload.file);
        formData.append('clientSessionId', this.clientSessionId);
        formData.append('id', this.id);

        fileUpload.setProgres(0);

        return Http.upload(this.postUrl, formData, (percentage) => {
            fileUpload.setProgres(percentage);
        }).then((result: any) => {
            if (!result || !result.storedFilename) {
                fileUpload.setError('X');
                return;
            }
            fileUpload.setStoredFileName(result.storedFilename);

            this.fileUploads.push(fileUpload);
        })
        .catch((error) => {
            fileUpload.setError('X');
            if (error.details) {
                const errors = error.details.get('file');
                
                if (errors) {
                    this.errors.push(...errors);
                
                    this.setValidationState(false);
                }
            }
            
        });
    }

    deleteFile(fileUpload: FileUpload) {
        if (!this.deleteUrl || !this.clientSessionId || !fileUpload.storedFilename) {
            return;
        }

        Http.delete(`${this.deleteUrl}/${this.clientSessionId}/${fileUpload.storedFilename}`)
            .then(msg => {
                this.value = this.fileUploads.map(fileUpload => fileUpload.getValue());
                this.isMaxFiles(this.fileUploads.length);
                this.valueChanged();
            })
            .catch(error => {
            })
            .finally(() => {
                this.isMaxFiles(this.fileUploads.length);
            });
    }

    getFiles() {
        return this.fileUploads.map(fileUpload => fileUpload.file);
    }

    getOptions(): OptionDto[] {
        return this.fileUploads.map(fileUpload => { 
            const optionExt = fileUpload.getValue();
            return {
                value: optionExt.value,
                text: optionExt.text
            }
        });
    }

    /**
     * SetValue only works for files that are uploaded to the backend.
     * 
     * Input is an array of options with as value the storedFilename and as text the filename.
     * 
     * 
     * @param {*} value 
     * @param {*} noCallback 
     * @returns 
     */
    setValue(value: FileUploadOption[], noCallback: boolean = false) {
        if (Array.isArray(value)) {
            for (const fileItem of value) {
                if (fileItem.text && fileItem.value && fileItem.size) {
                    const fileUpload = this.createUpload(fileItem.text);
                    fileUpload.setStoredFileName(fileItem.value);
                    fileUpload.setSize(fileItem.size);
                    fileUpload.setProgres(100);
                    this.fileUploads.push(fileUpload);
                }
            }
        }
        this.value = this.fileUploads.map(fileUpload => fileUpload.getValue());
        this.isMaxFiles(this.fileUploads.length);
        return this;
    }

    getValue() {
        return this.value;
    }

    setAccept(extensions: string[] = []) {
        this.allowedExtensions = extensions.map(ext => ext.toLowerCase().replace('.', ''));
        if (this.allowedExtensions.length > 0) {
            const acceptString = this.allowedExtensions.map(ext => '.' + ext).join(',');
            
            this.inputElement.setAttribute('accept', acceptString);
        } else {
            this.inputElement.removeAttribute('accept');
        }
        return this;
    }

    setMaxFileSize(megaBytes: number | undefined) {
        if (megaBytes === null || megaBytes === undefined) {
            this.maxFileSize = undefined;
        } else {
            // Set it in bytes
            this.maxFileSize = megaBytes * 1024 * 1024;
        }
        return this;
    }

    validate(valid: boolean = true, message: string = '') {
        if (!this.getShow()) {
            return true;
        }

        this.errors = this.errors || [];

        const filesValue = this.getValue();

        // Check for required
        if (this.required && (!filesValue || (Array.isArray(filesValue) && filesValue.length === 0))) {
            if (!this.errors.includes(message)) {
                this.errors.push(message || Lang.get('generic.validation.required'));
            }
            valid = false;
        }

        if (valid && filesValue) {
            const optionsExtended: FileUploadOption[] = Array.isArray(filesValue) ? filesValue : [filesValue];

            for (const option of optionsExtended) {
                if (!option.text || !option.value) {
                    this.errors.push(Lang.get('field.upload.error.invalid'));
                    valid = false;
                }

                if (this.maxFileSize && option.size > this.maxFileSize) {
                    const maxMb = (this.maxFileSize / (1024 * 1024)).toFixed(0);
                    this.errors.push(Lang.get('field.upload.error.size', option.text, maxMb));
                    valid = false;
                }

                if (this.allowedExtensions.length > 0) {

                    const fileExtension = option.text.split('.').pop()?.toLowerCase() || '';

                    if (!this.allowedExtensions.includes(fileExtension)) {
                        this.errors.push(Lang.get('field.upload.error.extension', option.text, this.allowedExtensions.join(', ')));
                        valid = false;
                    }
                }
            }
        }

        this.setValidationState(valid);
        return valid;
    }

    bindEvents() {
        this.#uploadContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (event && event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
        });

        this.#uploadContainer.addEventListener('dragenter', () => {
            this.#uploadContainer.classList.add('is-dragging');
        });

        this.#uploadContainer.addEventListener('dragleave', () => {
            this.#uploadContainer.classList.remove('is-dragging');
        });

        this.#uploadContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            this.#uploadContainer.classList.remove('is-dragging');

            if (event && event.dataTransfer) {
                this.addUploads(Array.from(event.dataTransfer.files));
            }
        });
    }

    setUploadUrl(postUrl: string) {
        this.postUrl = postUrl;
        return this;
    }

    setDeleteUrl(deleteUrl: string) {
        this.deleteUrl = deleteUrl;
        return this;
    }

    setClientSessionId(clientSessionId: string) {
        this.clientSessionId = clientSessionId;
        return this;
    }

    clone() {
        const uploadField = new FileUploadField(this.name, this.label);
        uploadField.setType(this.type);
        uploadField.setValue(this.value);
        uploadField.setClasses(this.classes);
        uploadField.setRequired(this.required);
        uploadField.setReadonly(this.readonly);

        uploadField.setIsMultiple(this.isMultiple);
        uploadField.setAccept(this.allowedExtensions);
        if (this.maxFileSize) {
            uploadField.setMaxFileSize(this.maxFileSize / (1024 * 1024));
        }

        uploadField.validators = this.validators;
        return uploadField;
    }
}


class FileUpload {
    barWrapper = document.createElement('div');
    bar = document.createElement('div');
    barLabelProgres = document.createElement('div');
 
    size: number | undefined = undefined;
    fileName: string | undefined = undefined;
    storedFilename: string | undefined = undefined;
    file: File | undefined = undefined;

    constructor(fileName: string, file: File | undefined, onDelete: (fileUpload: FileUpload) => void) {
        this.file = file;
        this.fileName = fileName;
        this.storedFilename = fileName;
        this.barWrapper.className = 'upload-bar-wrapper';
        const barContainer = document.createElement('div');
        barContainer.className = 'upload-bar-container';

        const barInnerContainer = document.createElement('div');
        barInnerContainer.className = 'upload-bar-inner-container';
        this.bar.className = 'upload-bar';

        const barLabelContainer = document.createElement('div');
        barLabelContainer.className = 'upload-bar-label-container';
        
        const barLabel = document.createElement('div');
        barLabel.className = 'upload-bar-label';
        barLabel.textContent = this.fileName;
        
        

        this.barLabelProgres.className = 'upload-bar-label-progress';

        barContainer.append(barInnerContainer, barLabelContainer);
        barInnerContainer.append(this.bar);
        barLabelContainer.append(barLabel, this.barLabelProgres);

        const deleteBtn = new FormButton('', 'btn-primary icon icon-x-lg', null, () => {
            onDelete(this);

            this.barWrapper?.parentNode?.removeChild(this.barWrapper);
        });

        this.barWrapper.append(barContainer, deleteBtn.getContent());
    }

    getValue(): FileUploadOption {
        return {
            value: this.storedFilename,
            text: this.fileName,
            size: this.size
        } as FileUploadOption;
    }

    getContent() {
        return this.barWrapper;
    }

    /**
     * The stored filename is the name of the file when it is stored on the backend.
     * @param storedFilename 
     */
    setStoredFileName(storedFilename: string) {
        this.storedFilename = storedFilename;
    }

    setSize(size: number) {
        this.size = size;
    }

    setProgres(progres: number) {
        this.bar.style.width = `${progres}%`;

        if (progres === 100) {
            this.barLabelProgres.innerHTML = `<span class='success icon icon-check2'><span>`;
        } else {
            this.barLabelProgres.textContent = `${progres}%`;
        }
    }

    setError(message: string) {
        this.bar.style.width = `0%`;
        this.barLabelProgres.innerHTML = `<span class='error icon icon-exclamation-circle'><span>`;
    }
}

