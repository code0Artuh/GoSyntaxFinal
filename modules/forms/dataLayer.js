import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js'
import { codeEditorPopup } from '../utils/codeEditor.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function dataLayer() {
    // instanciando o form de Ads Conversion Code
    const formDataLayer = document.querySelector('form#formDataLayer');

    // selecionando as checkboxes disponíveis
    const checkboxEvent = formDataLayer.querySelector('input#enableEvent');
    const checkboxUrl = formDataLayer.querySelector('input#enableUrlFilter');
    const checkboxArray = formDataLayer.querySelector('input#enableElementArray');
    const checkboxDomContentLoaded = formDataLayer.querySelector('input#enableDomContentLoaded');

    // criando um controller interruptor das checkboxes da extensão.
    const checkBoxesController = {
        eventBoxChecked: false,
        urlBoxChecked: false,
        arrayBoxChecked: false,
        domContentLoadedChecked: false,
    };

    // função para resetar o formulário após o envio do mesmo.
    const formReset = function() {
        // resetando campos do form
        formDataLayer.reset();

        // zerando controllers dos checkboxes
        checkBoxesController.eventBoxChecked = false;
        checkBoxesController.urlBoxChecked = false;
        checkBoxesController.arrayBoxChecked = false;
        checkBoxesController.domContentLoadedChecked = false;

        // desabilitando selects dentro do HTML
        formDataLayer.querySelector('select#eventType').setAttribute('disabled', '');
        formDataLayer.querySelector('select#urlType').setAttribute('disabled', '');
        formDataLayer.querySelector('input#urlText').setAttribute('disabled', '');
        formDataLayer.querySelector('input#selectorCss').setAttribute('disabled', '');

        // limpando as caixas de parametros
        const allObjElements = Array.from(formDataLayer.querySelector('div.objDiv').childNodes);

        // para cada parametro fazer a remoção.
        if (allObjElements.length > 0) {
            allObjElements.forEach(element => element.remove());
        }

        chrome.tabs.executeScript({
            code: 'window.location.reload()'
        });
    }

    // evento para capturar mudança no checkbox de array
    checkboxArray.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.arrayBoxChecked = !checkBoxesController.arrayBoxChecked;

        if (checkBoxesController.arrayBoxChecked) {
            // se o checkbox de array tiver checado habilita o input de seletor CSS.
            formDataLayer.querySelector('input#selectorCss').hasAttribute('disabled') && formDataLayer.querySelector('input#selectorCss').removeAttribute('disabled');
        } else {
            const checkSelectorCssBox = formDataLayer.querySelector('input#selectorCss').hasAttribute('disabled');
            
            // se o checkbox de array NÃO tiver checado e NEM o checkbox de eventos desabilita o input de seletor CSS.
            !checkSelectorCssBox && !checkBoxesController.eventBoxChecked && formDataLayer.querySelector('input#selectorCss').setAttribute('disabled', '');
        }
    });

    // evento para capturar mudança no checkbox de DOMContentLoaded
    checkboxDomContentLoaded.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.domContentLoadedChecked = !checkBoxesController.domContentLoadedChecked;
    });

    // evento para capturar mudança no checkbox de Eventos JS
    checkboxEvent.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.eventBoxChecked = !checkBoxesController.eventBoxChecked;
        
        if (checkBoxesController.eventBoxChecked) {
            // se o checkbox de eventos estiver checado habilita o select do Tipo de evento da DOM e o Input do Seletor CSS
            formDataLayer.querySelector('select#eventType').removeAttribute('disabled');
            formDataLayer.querySelector('input#selectorCss').hasAttribute('disabled') && formDataLayer.querySelector('input#selectorCss').removeAttribute('disabled');
        } else {
            const checkSelectorCssBox = formDataLayer.querySelector('input#selectorCss').hasAttribute('disabled');
            
            // se o checkbox de eventos NÃO estiver checado e NEM o checkbox de array desabilita o select do Tipo de evento da DOM e o Input do Seletor CSS
            formDataLayer.querySelector('select#eventType').setAttribute('disabled', '');
            !checkSelectorCssBox && !checkBoxesController.arrayBoxChecked && formDataLayer.querySelector('input#selectorCss').setAttribute('disabled', '');
        }
    });

    // evento para capturar mudança no checkbox de URL Filter
    checkboxUrl.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.urlBoxChecked = !checkBoxesController.urlBoxChecked;

        if (!checkBoxesController.urlBoxChecked) {
            // se o checkbox de URL Filter NÃO estiver checado desabilita o select do Tipo de filtro de URL e o input da URL
            formDataLayer.querySelector('select#urlType').setAttribute('disabled', '');
            formDataLayer.querySelector('input#urlText').setAttribute('disabled', '');
        } else {
            // se o checkbox de URL Filter estiver checado habilita o select do Tipo de filtro de URL e o input da URL
            formDataLayer.querySelector('select#urlType').removeAttribute('disabled');
            formDataLayer.querySelector('input#urlText').removeAttribute('disabled');
        }
    });

    const addKeyValue = formDataLayer.querySelector('button#addKeyValue');

    addKeyValue.addEventListener('click', function(ev) {
        ev.stopPropagation();

        const spanKeyValue = document.createElement('span');
        spanKeyValue.classList.add('keyValueLine');

        spanKeyValue.innerHTML = `
                <label>
                    Chave
                    <input type="text" class="objKey" />
                </label>
                
                <label>
                    Valor
                    <input type="text" class="objValue" />
                </label>
                <button type="button" name="removeKeyValue" class="removeKeyValue">X</button>
        `;

        const removeBtn = spanKeyValue.querySelector('button.removeKeyValue');
        removeBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();

            removeBtn.parentNode.remove();
        });


        const dataLayerObj = formDataLayer.querySelector('div.objDiv');

        dataLayerObj.appendChild(spanKeyValue);
        
    }); 

    // capturando envio do formulário
    formDataLayer.addEventListener('submit', function (ev) {
        // prevenindo comportamento padrão
        ev.preventDefault();

        // criando o Subject para receber os observers
        const subjectOfObservers = subject();

        // capturando os valores dos inputs e selects do DOM
        const htmlElements = {
            selectorInputCss: formDataLayer.querySelector('input#selectorCss').value,
            urlTypeSelector: formDataLayer.querySelector('select#urlType').value,
            eventTypeSelector: formDataLayer.querySelector('select#eventType').value,
            urlTextSelector: formDataLayer.querySelector('input#urlText').value,
        }

        // inscrevendo todos os observers functions (importados) dentro do subject
        subjectOfObservers.subscribeObserver(...eventObserversArray);

        // notificando todos os observers
        subjectOfObservers.notifyAll(checkBoxesController, codeMirror, htmlElements);

        // checando se os checkboxes de array, eventos e url estão ativos e com seus respectivos inputs preenchidos corretamente. 
        if ((checkBoxesController.eventBoxChecked || checkBoxesController.arrayBoxChecked) && htmlElements.selectorInputCss === '' || checkBoxesController.urlBoxChecked && htmlElements.urlTextSelector === '') {
            alert('Campo de seletor CSS ou de filtro de URL está ou estão vazios, verifique o preenchimento!');
            resetCodeMirror();
            return;
        }

        // fazendo uma identação do código javascript gerado dentro do editor de código
        const beautifiedCode = js_beautify(codeMirror.getValue());

        // setando o código identado dentro do editor novamente
        codeMirror.setValue(`<script>\n${beautifiedCode.replace(/(\n+)/g, "\n")}\n</script>`);

        const allKeyValue = Array.from(formDataLayer.querySelectorAll('span.keyValueLine'));
        const keyValueObj = {};
        const keyValueCheck = {hasError: false, msg: ''};

        if (allKeyValue.length === 0) {
            alert('Para a geração do código, no mínimo 1 par chave/valor deve ser adicionado!');
            resetCodeMirror();
            return;
        }

        allKeyValue.forEach(function(element) {
            const objKey = element.querySelector('input.objKey').value;
            const objValue = element.querySelector('input.objValue').value;

            if (!objKey || !objValue) {
                keyValueCheck.hasError = true;
                keyValueCheck.msg = 'Existe parâmetros em branco, favor fazer a correção!'
                return;
            }

            const objKeys = Object.keys(keyValueObj);

            for (let i in objKeys) {
                if (objKeys[i] === objKey) {
                    keyValueCheck.hasError = true;
                    keyValueCheck.msg = 'Existe uma repetição de chave! Corrija para prosseguir com a geração do código.'
                    return;
                }
            }
            
            keyValueObj[objKey] = objValue;
        });

        if (keyValueCheck.hasError) {
            alert(keyValueCheck.msg);
            resetCodeMirror();
            return;
        }

        // colocando comentário no meio do editor de códigos
        codeMirror.replaceRange(`
            dataLayer.push(${js_beautify(JSON.stringify(keyValueObj))});`, {line: (codeMirror.lineCount() / 2) - 1});

        // mostrando janela com o código gerado, identado e editado.
        codeEditorPopup(codeMirror);

        // resetando todo o form para novamente gerar outros códigos;
        formReset();
        return;
    });
}

export { dataLayer }