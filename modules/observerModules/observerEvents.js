const NOBOXES_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    // caso nenhuma checkbox esteja checada solicita pra criar um código
    if (Object.values(checkBoxesController).every(element => element === false)) {
        alert('Por favor, crie um filtro antes de gerar o código!');
        codeMirror.setValue("\n".repeat(15));
        return;
    }
};

const URLBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.urlBoxChecked) {
        if (htmlElements.urlTypeSelector === 'includes') {
            codeMirror.replaceRange(`if (window.location.href.includes('${htmlElements.urlTextSelector}')) { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        if (htmlElements.urlTypeSelector === 'equals') {
            codeMirror.replaceRange(`if (window.location.href === '${htmlElements.urlTextSelector}') { `, {line: 1});
            codeMirror.replaceRange(`};`, {line: 9});

            codeMirror.readOnly = true;
            return;
        }

        return;
    }
};

const DOMLOADEDBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.domContentLoadedChecked) {     
        codeMirror.replaceRange(`document.addEventListener('DOMContentLoaded', function() {`, {line: 2});
        codeMirror.replaceRange(`});`, {line: 8});

        codeMirror.readOnly = true;
        return;
    }
};

const ONLY_EVENTBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.eventBoxChecked && !checkBoxesController.arrayBoxChecked) {
            codeMirror.replaceRange(`document.querySelector('${htmlElements.selectorInputCss}').addEventListener('click', function() {`, {line: 3});
            codeMirror.replaceRange('});', {line: 6})
            codeMirror.readOnly = true;

            return;

    }
};

const ONLY_ARRAYBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (!checkBoxesController.eventBoxChecked && checkBoxesController.arrayBoxChecked) {
            codeMirror.replaceRange(`document.querySelectorAll('${htmlElements.selectorInputCss}').forEach(function() {`, {line: 3});
            codeMirror.replaceRange('});', {line: 6})
            codeMirror.readOnly = true;

            return;
    }
};

const EVENTBOX_AND_ARRAYBOX_CHECKED = function (checkBoxesController, codeMirror, htmlElements) {
    if (checkBoxesController.eventBoxChecked && checkBoxesController.arrayBoxChecked) {
        codeMirror.replaceRange(`document.querySelectorAll('${htmlElements.selectorInputCss}').forEach(function (element) { \n  element.addEventListener('click', function() {`, {line: 3});
        codeMirror.replaceRange('  }); \n });', {line: 6});

        codeMirror.readOnly = true;

        
        return;
    }
};



export const eventObserversArray = [ONLY_EVENTBOX_CHECKED, ONLY_ARRAYBOX_CHECKED, EVENTBOX_AND_ARRAYBOX_CHECKED, URLBOX_CHECKED, DOMLOADEDBOX_CHECKED, NOBOXES_CHECKED]