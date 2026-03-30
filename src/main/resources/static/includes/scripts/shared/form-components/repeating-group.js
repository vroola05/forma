import { InputNucleus } from "./interface/input-base.js";

export class RepeatingGroup extends InputNucleus {
    static page = '';

    type = 'repeating-group';

    minLength = undefined;
    maxLength = undefined;
    layout = undefined;

    metadata = new Map();
    template = [];

    groupWrapperDomElement = document.createElement('div');
    groupDomElements = document.createElement('div');
    groupAddDomElement = document.createElement('button');
    addButtonContainerDomElements = document.createElement('div');
    labelDomElements = document.createElement('label');

    // Bevat een dubbele array met alle dom elementen
    sets = [];
    // Bevat een dubbele array met alle input velden
    groupInputSets = [];
    id = '';

    constructor(name, label, classes = '', layout = '') {
        super(name, label);
        
        this.layout = layout;
        this.createElement(classes);
        this.setId(name)
    }

    /**
     * 
     */
    afterInit() {
        this.checkMinMaxAmount();
    }

    /**
     * 
     * @param {*} classes 
     */
    createElement(classes = '') {
        this.groupWrapperDomElement.className = classes + ' row repeating-group-wrapper';

        this.groupDomElements.className = 'repeating-group-container container';
        this.groupWrapperDomElement.append(this.groupDomElements);

        
        this.addButtonContainerDomElements.className = 'repeating-group-container-footer container';

        if (this.layout != 'table') {
            this.labelDomElements.className = 'pb-4';
            this.labelDomElements.innerHTML = `${this.label} toevoegen`;
            this.addButtonContainerDomElements.append(this.labelDomElements);
        }
        this.groupAddDomElement.className = 'repeating-btn btn-primary btn d-md-flex justify-content-md-end';
        this.groupAddDomElement.innerHTML = '+ Regel toevoegen';
        this.groupAddDomElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.addRow(this.template);
            this.checkMinMaxAmount();
        });
        this.addButtonContainerDomElements.append(this.groupAddDomElement);
        

        this.groupWrapperDomElement.append(this.addButtonContainerDomElements);

    }

    addTableHeaderRow() {
        if (this.layout !== 'table')
            return;
        
        const header = document.createElement('div');
        header.className = 'repeating-group';
        this.groupDomElements.append(header);

        const title = document.createElement('div');
        title.className = 'repeating-group-title pb-2';
        title.innerHTML = `<h3>${this.label}</h3>`;
        header.append(title);

        this.table = document.createElement('table');
        this.table.className = 'table table-hover';
        this.groupDomElements.append(this.table);
        const tr = document.createElement('tr');
        this.table.appendChild(tr);
        this.template.forEach(input => {
            if (input.getType() !== 'hidden') {
                const td = document.createElement('td'); 
                td.className = 'ps-2 pe-2 ps-md-1 pe-md-1 ps-lg-1 pe-lg-1';
                tr.appendChild(td);
                // td.innerHTML = input.getLabel().innerHTML;
           }
        });
        const td = document.createElement('td'); 
        tr.appendChild(td);

    }

    /**
     * Registreert een of meerdere inputs voor een formulier. Door dit te doen kun je makkelijk de velden valideren en de waarden ophalen.
     * @param {*} inputs 
     */
    registerSet(set) {
        set.forEach(input => {
            if (!(input instanceof InputNucleus)) {
                throw new Error('Input must be an instance of Input class');
            }
        });
        this.template = set;
        this.addTableHeaderRow();
        return this;
    }

    /**
     * 
     */
    checkMinMaxAmount() {
        if (this.minLength > 0) {
            if (this.sets.length < this.minLength) {
                for (let i = this.sets.length; i < this.minLength; i++) {
                    console.log('Adding row to meet minLength requirement');
                    this.addRow(this.template);
                }
            }

            if (this.sets.length <= this.minLength) {
                this.sets.forEach(set => {
                    const deleteBtn = set.querySelector(".repeating-btn-delete");
                    if (deleteBtn)
                        deleteBtn.classList.add('hidden');

                });
            } else {
                this.sets.forEach(set => {
                    const deleteBtn = set.querySelector(".repeating-btn-delete");
                    if (deleteBtn)
                        deleteBtn.classList.remove('hidden')
                });
            }
        }

        if (this.maxLength > 0) {
            if (this.sets.length >= this.maxLength) {
                this.addButtonContainerDomElements.classList.add('hidden');
            } else {
                this.addButtonContainerDomElements.classList.remove('hidden');
            }
        }
    }

    addSet(sets) {
        sets.forEach(set => {
            this.addRow(set);
        });

        return this;
    }

    /**
     * 
     */
    addRow(template) {
        const i = this.groupInputSets.length;

        if (i >= this.maxLength) {
            console.error('can\'t append new row');
            return;
        }

        const groupRemoveDomElement = document.createElement('button');
        groupRemoveDomElement.addEventListener('click', (e) => {
            e.preventDefault();
            // De set moet in drie objecten worden verwijderd:
            //  - groupDomElements
            //  - sets
            //  - groupInputSets
            const closestRepeatingGroup = e.target.closest('.repeating-group');
            this.onRemoveItem(closestRepeatingGroup);
            
        });

        this.addRowContainer(i, groupRemoveDomElement);
        
        template.forEach(input => {
            // console.log('input', input);
            this.registerSetInput(input, i);

        });

        if (this.layout == 'table') {
            groupRemoveDomElement.className = 'tbl repeating-btn-delete btn btn-secondary';
            groupRemoveDomElement.innerHTML = ' Verwijderen';
            
            for (const input of this.groupInputSets[i]) {
                
                if (input.getType() !== 'hidden') {
                    const td = document.createElement('td'); 
                    const inputDom = input.getInput();
                    td.appendChild(inputDom);

                    if (input.classes) {
                        td.className += input.classes ? ' ' + input.classes : '';
                    }

                    this.sets[i].appendChild(td);
                }
            }

            const td = document.createElement('td'); 
            td.className = 'width-10';
            
            td.appendChild(groupRemoveDomElement);
            
            this.sets[i].appendChild(td);

        } else {
            groupRemoveDomElement.className = 'normal repeating-btn-delete btn btn-secondary';
            groupRemoveDomElement.innerHTML = '- Verwijderen';
            for (const input of this.groupInputSets[i]) {
                if (input.getType() !== 'hidden') {
                    this.sets[i].appendChild(input.getContent());
                }
            }

            if (!this.labelDomElements.classList.contains('hidden')) {
                this.labelDomElements.classList.add('hidden');
            }
        }
    }

    addRowContainer(i, groupRemoveDomElement) {
        if (this.layout === 'table') {
            this.sets[i] = document.createElement('tr');
            this.sets[i].className = 'repeating-group';
            this.table.appendChild(this.sets[i]);
        } else {
            this.sets[i] = document.createElement('div');
            this.sets[i].className = 'repeating-group';
            this.groupDomElements.append(this.sets[i]);

            const title = document.createElement('div');
            title.className = 'repeating-group-title pb-2';
            title.innerHTML = `<div class="repeating-group-title-text">${this.label} ${i + 1}</div>`;
            
                title.appendChild(groupRemoveDomElement);
            
            this.sets[i].append(title);
        }
    }

    onRemoveItem(closestRepeatingGroup) {
        if (this.layout === 'table') {
                this.table.removeChild(closestRepeatingGroup);
        } else {
            this.groupDomElements.removeChild(closestRepeatingGroup);
        }
        const index = this.sets.indexOf(closestRepeatingGroup);
        this.sets.splice(index, 1);
        this.groupInputSets.splice(index, 1);
        
        for (const index in this.sets) {
            // Pas de nummering in de titels aan
            for (const el of this.sets[index].getElementsByTagName('h3')) {
                const nr = Number(index) + 1;
                el.innerHTML = this.label + ' ' + nr;
            }
        };

        this.setId(this.id);

        if (this.callback) {
            this.callback(this.name, this.getValue(), this);
        }
        this.checkMinMaxAmount();

        if (this.layout !== 'table') {
            if (this.sets.length === 0 && this.labelDomElements.classList.contains('hidden')) {
                this.labelDomElements.classList.remove('hidden');
            }
        }
    }

    /**
     * 
     * @param {*} input 
     * @param {*} index 
     */
    registerSetInput(input, index) {
        if (!input) {
            throw new Error('Form name and input are required parameters');
        }

        const inputNew = input.clone();

        if (!this.groupInputSets[index]) {
            this.groupInputSets[index] = [];
        }

        // Dit is een callback op de wijziging van de inputNew waarde.
        // Deze callback slaat de waarde op in de groupInputKeyValue object en in de sessionStorage.
        inputNew.callback = (name, value, inputField) => {
            if (this.callback) {
                this.callback(this.name, this.getValue(), this);
            }
        };
        inputNew.setId(`${this.id}-${index}-${inputNew.getName()}`);
        this.groupInputSets[index].push(inputNew);
    }

    /**
     * 
     * @returns 
     */
    getName() {
        return this.name;
    }

    /**
     *  
     * @param {*} id 
     */
    setId(id) {
        this.id = id;
        for (const i in this.groupInputSets) {
            for (const input of this.groupInputSets[i]) {
                input.setId(this.createInputId(i,input.getName()));
            }
        }
    }

    /**
     * 
     * @param {*} setIndex 
     * @param {*} inputName 
     * @returns 
     */
    createInputId(setIndex, inputName) {
        return `${this.id}-${setIndex}-${inputName}`
    }

    /**
     * Valideert het formulier door alle geregistreerde inputs te controleren.
     * Het voegt de 'was-validated' klasse toe aan het formulier om de validatie visueel weer te geven.
     * @param {*} name
     * @return {boolean} true als alle inputs geldig zijn, anders false
     */
    validate() {
        if (!this.getShow()) {
            return true;
        }
        
        let valid = true
        for (const set of this.groupInputSets) {
            for (const input of set) {
                if (!input.validate()) {
                    valid = false;
                }
            }
        }
        return valid;
    }

    /**
     * 
     * @param {*} value 
     */
    setValue(value) {
        for (const setId in value) {
            this.addRow(this.template);
            for (const  inputId in value[setId]) {
                const id = this.createInputId(setId, value[setId][inputId].name);
                const input = this.groupInputSets[setId].find(input => input.getId() === id);
                if (input) {
                    input.setValue(value[setId][inputId].value);
                }
            }
        }
    }

    /**
     * 
     * @returns 
     */
    getValue() {
        return this.groupInputSets.map(innerArray => innerArray.map(obj => ({'name': obj.name, 'value': obj.value})));
    }

    setShow(show) {
        if (show) {
            this.groupWrapperDomElement.classList.remove('no-metadata');
        } else {
            this.groupWrapperDomElement.classList.add('no-metadata');
        }
    }

    /**
     * Geeft het formulier terug dat moet worden weergegeven.
     * @param {} name 
     * @returns 
     */
    getContent() {
        return this.groupWrapperDomElement;
    }

    /**
     * 
     * @param {*} type 
     * @returns 
     */
    setType(type) {
        this.type = type;
        return this;
    }

    /**
     * 
     * @param {*} length 
     * @param {*} message 
     * @returns 
     */
    setMinLength(length, message = 'Minimale lengte is ' + length) {
        if (length === null || length === undefined) {
            this.minLength = undefined;
        } else {
            this.minLength = length;
        }
        return this;
    }

    /**
     * 
     * @param {*} length 
     * @param {*} message 
     * @returns 
     */
    setMaxLength(length, message = 'Maximale lengte is ' + length) {
        if (length === null || length === undefined) {
            this.maxLength = undefined;
        } else {
            this.maxLength = length;
        }
        return this;
    }

    setMetadata(metadata) {
        if (metadata) {
            for(const m of metadata) {
                this.metadata.set(m, m);
            }
        }
        return this;
    }

    hasMetadata(metadata) {
        return this.metadata.size == 0 || this.metadata.has(metadata);
    }
}