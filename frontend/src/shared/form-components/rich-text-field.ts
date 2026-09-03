import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { DollarMenuMention } from "../generic-components/editor/builder-dollar-menu";
import { BuilderEditor, MentionTriggerExtension } from "../generic-components/editor/builder-editor";
import { BuilderEditorTableBubbleMenu } from "../generic-components/editor/builder-editor-table-bubble-menu";
import { TranslationDto } from "../model/types";
import { Lang } from "../services/lang";
import { InputNucleus } from "./interface/input-base";
import Placeholder from '@tiptap/extension-placeholder';

export class RichTextField extends InputNucleus<HTMLDivElement> {
    builderEditor: BuilderEditor;

    constructor(name: string, labels: TranslationDto[] | undefined, id: string | undefined = undefined) {
        super(document.createElement('div'), name, labels, id);
        this.type = 'rich-text';

        // @TODO: Consider making the extensions configurable through the constructor or a setter method, allowing for more flexibility in the editor's functionality.
        this.builderEditor = new BuilderEditor((jsonData: any) => {
            
        }, [
            Placeholder.configure({
                    placeholder: Lang.get('text.editor.placeholder'),
                    emptyEditorClass: 'builder-text-editor-placeholder', 
                }),

                Table.configure({ resizable: true }),
                TableRow,
                TableHeader,
                TableCell,
                DollarMenuMention,
                MentionTriggerExtension,
                BuilderEditorTableBubbleMenu
        ]);

        this.builderEditor.onValueChanged = (jsonData: any) => {
            this.setValue(jsonData, false);
        };
        this.createElement();
    }

    createElement() {
        this.inputElement.id = this.getId();
        
        this.createInput(this.builderEditor.getContent());
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    validate() {
        return true;
    }

    setValue(value: any | undefined, noCallback: boolean = false) {
        this.value = value ?? undefined;
        this.builderEditor.addDataContent(this.value ?? {});
        
        this.valueChanged(noCallback);
        return this;
    }

    getValue() {
        return this.builderEditor.getJsonData();
    }

    clone() {
        const richTextField = new RichTextField(this.name, this.labels);
        richTextField.setType(this.type);
        richTextField.setValue(this.value);
        richTextField.setClasses(this.classes);

        return richTextField;
    }
}