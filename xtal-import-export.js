/**
* `xtal-import-export`
* Set properties of a parent custom element using ES6 module notation
*
* @customElement
* @polymer
* @demo demo/index.html
*/
class XtalImportExport extends HTMLElement {
    constructor() {
        super(...arguments);
        // replaceAll(target: string, search: string, replacement: string) {
        //     //https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
        //     return target.split(search).join(replacement);
        // }
        //regExp = /(.*)export(\s+)const(\s+)[a-zA-Z]+(\s*)=/g;
        this.insertFragmentRegExp = /XtalIMEX.insert\((.*)\);/g;
    }
    static get is() { return 'xtal-import-export'; }
    evaluateScriptText() {
        const templateTag = this.querySelector('template');
        let clone;
        if (templateTag) {
            clone = document.importNode(templateTag.content, true);
        }
        let scriptTag = this.querySelector('script');
        if (!scriptTag && clone) {
            scriptTag = clone.querySelector('script');
        }
        if (!scriptTag) {
            console.error('No script tag  found to apply.');
            return;
        }
        this.applyScript(scriptTag);
    }
    applyScript(scriptTag) {
        const innerText = scriptTag.innerText;
        if (innerText === this._previousEvaluatedText)
            return;
        this._previousEvaluatedText = innerText;
        // let matches;
        // while (matches = this.insertFragmentRegExp.exec(innerText)) {
        //   insertsEliminatedText = insertsEliminatedText.replace('scriptTag=>XtalMethod.insert(scriptTag,' + matches[1] + ');', '');
        //   console.log(matches);
        //   console.log('Middle text is: ' + matches[1]);
        // }
        const splitInsertText = innerText.split(this.insertFragmentRegExp);
        const insertedText = splitInsertText.map((val, idx) => {
            if (idx % 2 === 0)
                return val;
            let newText = '';
            const ids = val.split(',').forEach(id => {
                const scriptInclude = window[id.trim()];
                if (scriptInclude) {
                    newText += scriptInclude.innerHTML;
                }
                else {
                    console.error('script tag with selector ' + id + ' not found');
                }
            });
            return newText;
        });
        const insertsEliminatedText = insertedText.join('');
        //console.log(insertsEliminatedText);
        const splitText = insertsEliminatedText.split('export const ');
        let iPos = 0;
        for (let i = 1, ii = splitText.length; i < ii; i++) {
            const token = splitText[i];
            const iPosOfEq = token.indexOf('=');
            const lhs = token.substr(0, iPosOfEq).trim();
            splitText[i] = 'const ' + lhs + ' = exportconst.' + lhs + ' = ' + token.substr(iPosOfEq + 1);
        }
        const modifiedText = splitText.join('');
        const protectedScript = `[
        async function () {
            const exportconst = {};
            ${modifiedText}
            return exportconst;
        }
        ]`;
        const fnArr = eval(protectedScript);
        const target = this.parentElement;
        ;
        const exportedSymbols = fnArr[0]().then(exportedSymbols => {
            Object.assign(target, exportedSymbols);
        }).catch(e => {
            throw e;
        });
        //Object.assign(this, srcObj);
    }
    connectedCallback() {
        this.evaluateScriptText();
    }
}
if (!customElements.get(XtalImportExport.is)) {
    customElements.define(XtalImportExport.is, XtalImportExport);
}
//# sourceMappingURL=xtal-import-export.js.map