import { InputNucleus } from './interface/input-base.js';

/**
 * Textfield
 */
export class FileUploadField extends InputNucleus {

    maxFileSize = undefined; // In bytes (bijv. 10 * 1024 * 1024 voor 10MB)
    allowedExtensions = [];  // Bijv. ['png', 'svg', 'pdf']
    isMultiple = false;

    constructor(name, label) {
        super(name, label);

        this.createElement();
    }

    createElement() {
        this.inputElement = document.createElement('input');
        this.inputElement.className = 'form-control';
        this.inputElement.name = this.name;
        this.inputElement.id = this.name;

        this.setType('file');

        this.inputElement.addEventListener('change', (e) => {
            console.log(e.target.files[0]);
            if (this.isMultiple) {
                this.setValue(Array.from(e.target.files));
            } else {
                this.setValue(e.target.files[0] || null);
            }
        });

        this.createInput(this.inputElement);
    }

    setType(type) {
        this.type = type;
        this.inputElement.type = type;
        return this;
    }

    setMultiple(multiple = true) {
        this.isMultiple = multiple;
        if (multiple) {
            this.inputElement.setAttribute('multiple', '');
        } else {
            this.inputElement.removeAttribute('multiple');
        }
        return this;
    }

    getFileNames() {
        return this.getValue().map(file => file.name);
    }

    getValue() {
        const rawValue = this.value;

        if (rawValue === null || rawValue === undefined) {
            return [];
        }

        if (Array.isArray(rawValue)) {
            return rawValue;
        }

        return [rawValue];
    }

    setValue(value, noCallback = false) {
        this.value = value ?? [];

        if (Array.isArray(this.value) && this.value.length === 0) {
            this.inputElement.value = '';
        }

        this.valueChanged(noCallback);
        return this;
    }

    // NIEUW: Stel de toegestane extensies in (bijv. .setAccept(['png', 'svg']))
    setAccept(extensions = []) {
        this.allowedExtensions = extensions.map(ext => ext.toLowerCase().replace('.', ''));
        if (this.allowedExtensions.length > 0) {
            const acceptString = this.allowedExtensions.map(ext => '.' + ext).join(',');
            this.inputElement.setAttribute('accept', acceptString);
        } else {
            this.inputElement.removeAttribute('accept');
        }
        return this;
    }

    // NIEUW: Vervanger voor setMaxLength -> Maximale bestandsgrootte in MBs
    setMaxFileSize(megaBytes) {
        if (megaBytes === null || megaBytes === undefined) {
            this.maxFileSize = undefined;
        } else {
            this.maxFileSize = megaBytes * 1024 * 1024; // Bereken bytes
        }
        return this;
    }

    validate(valid = true, message = '') {
        if (!this.getShow()) {
            return true;
        }

        // Roep de validatie van de parent aan (voor o.a. de 'required' check)
        valid = super.validate(valid, message);
        this.errors = this.errors || []; // Zorg dat de array bestaat

        const filesValue = this.getValue();

        // Als het veld verplicht is maar er is geen bestand gekozen
        if (this.required && (!filesValue || (Array.isArray(filesValue) && filesValue.length === 0))) {
            // De parent handelt de required error vaak al af, maar dit is je vangnet voor Arrays
            if (!this.errors.includes(message)) {
                this.errors.push(message || 'Minstens één bestand is verplicht.');
            }
            valid = false;
        }

        // Valideer de daadwerkelijk geselecteerde bestanden
        if (valid && filesValue) {
            const filesToValidate = Array.isArray(filesValue) ? filesValue : [filesValue];

            for (let file of filesToValidate) {
                // 1. Validatie op Bestandsgrootte
                if (this.maxFileSize && file.size > this.maxFileSize) {
                    const maxMb = (this.maxFileSize / (1024 * 1024)).toFixed(0);
                    this.errors.push(`Bestand "${file.name}" is te groot. Maximaal ${maxMb}MB toegestaan.`);
                    valid = false;
                }

                // 2. Validatie op Extensie (als extra frontend beveiliging)
                if (this.allowedExtensions.length > 0) {
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    if (!this.allowedExtensions.includes(fileExtension)) {
                        this.errors.push(`Bestand "${file.name}" heeft een ongeldig type. Alleen ${this.allowedExtensions.join(', ')} toegestaan.`);
                        valid = false;
                    }
                }
            }
        }

        this.setValidationState(valid);
        return valid;
    }

    clone() {
        // Let op: Verander 'UploadField' naar 'FileUploadField' zodat de constructor klopt
        const uploadField = new FileUploadField(this.name, this.label);
        uploadField.setType(this.type);
        uploadField.setValue(this.value);
        uploadField.setClasses(this.classes);
        uploadField.setRequired(this.required);
        uploadField.setReadonly(this.readonly);

        // Kopieer de nieuwe bestandsspecifieke eigenschappen mee
        uploadField.setMultiple(this.isMultiple);
        uploadField.setAccept(this.allowedExtensions);
        if (this.maxFileSize) {
            uploadField.setMaxFileSize(this.maxFileSize / (1024 * 1024));
        }

        uploadField.data = this.data;
        uploadField.validators = this.validators;
        return uploadField;
    }
}