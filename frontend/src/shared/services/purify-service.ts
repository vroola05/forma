import DOMPurify from 'dompurify';

class PurifyServiceImpl {
    constructor() {
        DOMPurify.addHook('afterSanitizeAttributes', (node) => {
            if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
                node.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    renderSafeHtml(rawHtml: string): string {
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
            ADD_ATTR: ['target'],
        });
        
        return cleanHtml;
    }
}

export const PurifyService = new PurifyServiceImpl();