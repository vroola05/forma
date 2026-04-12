import { PageComponent } from '../../../shared/page-components/page-component.js';
import { BuilderLayout } from './components/builder-layout.js';

import { Editor } from 'https://esm.sh/@tiptap/core'
import StarterKit from 'https://esm.sh/@tiptap/starter-kit'
import Document from 'https://esm.sh/@tiptap/extension-document'
import Paragraph from 'https://esm.sh/@tiptap/extension-paragraph'
import Text from 'https://esm.sh/@tiptap/extension-text'
import Heading from 'https://esm.sh/@tiptap/extension-heading'

export class BuilderPageSettingsSuccess extends PageComponent {
    #builderLayout = null;
    
    constructor() {
        super();

        this.#builderLayout = new BuilderLayout();

        const content = document.createElement('div');
        content.className = 'element';
        new Editor({
            element: content,
            extensions: [
                StarterKit,
                Document,
                Paragraph,
                Text,
                Heading.configure({
                levels: [1, 2, 3],
                })
            ],
            autofocus: true,
            content: '<p>Hello from CDN!</p>',
        })
        this.#builderLayout.setCenterContent(content);
    }

    /**
     * 
     */
    afterInit() {

    }

    getContent() {
        return this.#builderLayout.getContent();
    }
}
