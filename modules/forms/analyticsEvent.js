import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js'
import { codeEditorPopup } from '../utils/codeEditor.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function analyticsEvent() {
    // instanciando o form de Ads Conversion Code
    const formAnalyticsEvent = document.querySelector('form#formAnalyticsEvent');

    // selecionando as checkboxes disponíveis
    const checkboxEvent = formAnalyticsEvent.querySelector('input#enableEvent');
    const checkboxUrl = formAnalyticsEvent.querySelector('input#enableUrlFilter');
    const checkboxArray = formAnalyticsEvent.querySelector('input#enableElementArray');
    const checkboxDomContentLoaded = formAnalyticsEvent.querySelector('input#enableDomContentLoaded');

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
        formAnalyticsEvent.reset();

        // zerando controllers dos checkboxes
        checkBoxesController.eventBoxChecked = false;
        checkBoxesController.urlBoxChecked = false;
        checkBoxesController.arrayBoxChecked = false;
        checkBoxesController.domContentLoadedChecked = false;

        // desabilitando selects dentro do HTML
        formAnalyticsEvent.querySelector('select#eventType').setAttribute('disabled', '');
        formAnalyticsEvent.querySelector('select#urlType').setAttribute('disabled', '');
        formAnalyticsEvent.querySelector('input#urlText').setAttribute('disabled', '');
        formAnalyticsEvent.querySelector('input#selectorCss').setAttribute('disabled', '');

        // limpando as caixas de parametros
        const allSpanElements = Array.from(formAnalyticsEvent.querySelector('div.parametersDiv').childNodes);

        // para cada parametro fazer a remoção.
        if (allSpanElements.length > 0) {
            allSpanElements.forEach(element => element.remove());
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
            formAnalyticsEvent.querySelector('input#selectorCss').hasAttribute('disabled') && formAnalyticsEvent.querySelector('input#selectorCss').removeAttribute('disabled');
        } else {
            const checkSelectorCssBox = formAnalyticsEvent.querySelector('input#selectorCss').hasAttribute('disabled');
            
            // se o checkbox de array NÃO tiver checado e NEM o checkbox de eventos desabilita o input de seletor CSS.
            !checkSelectorCssBox && !checkBoxesController.eventBoxChecked && formAnalyticsEvent.querySelector('input#selectorCss').setAttribute('disabled', '');
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
            formAnalyticsEvent.querySelector('select#eventType').removeAttribute('disabled');
            formAnalyticsEvent.querySelector('input#selectorCss').hasAttribute('disabled') && formAnalyticsEvent.querySelector('input#selectorCss').removeAttribute('disabled');
        } else {
            const checkSelectorCssBox = formAnalyticsEvent.querySelector('input#selectorCss').hasAttribute('disabled');
            
            // se o checkbox de eventos NÃO estiver checado e NEM o checkbox de array desabilita o select do Tipo de evento da DOM e o Input do Seletor CSS
            formAnalyticsEvent.querySelector('select#eventType').setAttribute('disabled', '');
            !checkSelectorCssBox && !checkBoxesController.arrayBoxChecked && formAnalyticsEvent.querySelector('input#selectorCss').setAttribute('disabled', '');
        }
    });

    // evento para capturar mudança no checkbox de URL Filter
    checkboxUrl.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.urlBoxChecked = !checkBoxesController.urlBoxChecked;

        if (!checkBoxesController.urlBoxChecked) {
            // se o checkbox de URL Filter NÃO estiver checado desabilita o select do Tipo de filtro de URL e o input da URL
            formAnalyticsEvent.querySelector('select#urlType').setAttribute('disabled', '');
            formAnalyticsEvent.querySelector('input#urlText').setAttribute('disabled', '');
        } else {
            // se o checkbox de URL Filter estiver checado habilita o select do Tipo de filtro de URL e o input da URL
            formAnalyticsEvent.querySelector('select#urlType').removeAttribute('disabled');
            formAnalyticsEvent.querySelector('input#urlText').removeAttribute('disabled');
        }
    });

    const addEventParameter = formAnalyticsEvent.querySelector('button#addParameter');

    addEventParameter.addEventListener('click', function(ev) {
        ev.stopPropagation();

        const spanParameter = document.createElement('span');
        spanParameter.classList.add('parametersLine');

        spanParameter.innerHTML = `
                <label>
                    Nome do Parâmetro
                    <input type="text" class="parameterName" />
                </label>
                
                <label>
                    Valor do Parâmetro
                    <input type="text" class="parameterValue" />
                </label>
                <button type="button" name="removeParameter" class="removeParameter">X</button>
        `;

        const removeBtn = spanParameter.querySelector('button.removeParameter');
        removeBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();

            removeBtn.parentNode.remove();
        });


        const divParameters = formAnalyticsEvent.querySelector('div.parametersDiv');

        divParameters.appendChild(spanParameter);
        
    }); 

    // capturando envio do formulário
    formAnalyticsEvent.addEventListener('submit', function (ev) {
        // prevenindo comportamento padrão
        ev.preventDefault();

        // criando o Subject para receber os observers
        const subjectOfObservers = subject();

        // capturando os valores dos inputs e selects do DOM
        const htmlElements = {
            selectorInputCss: formAnalyticsEvent.querySelector('input#selectorCss').value,
            urlTypeSelector: formAnalyticsEvent.querySelector('select#urlType').value,
            eventTypeSelector: formAnalyticsEvent.querySelector('select#eventType').value,
            urlTextSelector: formAnalyticsEvent.querySelector('input#urlText').value,
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

        const eventName = formAnalyticsEvent.querySelector('input#eventName').value;
        const allParameters = Array.from(formAnalyticsEvent.querySelectorAll('span.parametersLine'));
        const parametersObj = {};
        const parametersCheck = {hasError: false, msg: ''};

        if (!eventName) {
            alert('Para a geração do código, o nome do evento deve ser adicionado!');
            resetCodeMirror();
            return;
        }

        if (allParameters.length === 0) {
            alert('Para a geração do código, no mínimo 1 parâmetro deve ser adicionado!');
            resetCodeMirror();
            return;
        }

        allParameters.forEach(function(element) {
            const parameterName = element.querySelector('input.parameterName').value;
            const parameterValue = element.querySelector('input.parameterValue').value;

            if (!parameterName || !parameterValue) {
                parametersCheck.hasError = true;
                parametersCheck.msg = 'Existe parâmetros em branco, favor fazer a correção!'
                return;
            }

            const parametersKeys = Object.keys(parametersObj);

            for (let i in parametersKeys) {
                if (parametersKeys[i] === parameterName) {
                    parametersCheck.hasError = true;
                    parametersCheck.msg = 'Existe uma repetição de parâmetro! Corrija para prosseguir com a geração do código.'
                    return;
                }
            }
            
            parametersObj[parameterName] = parameterValue;
        });

        if (parametersCheck.hasError) {
            alert(parametersCheck.msg);
            resetCodeMirror();
            return;
        }

        // colocando comentário no meio do editor de códigos
        codeMirror.replaceRange(`
            gtag('event', '${eventName}', ${js_beautify(JSON.stringify(parametersObj))});`, {line: (codeMirror.lineCount() / 2) - 1});

        // mostrando janela com o código gerado, identado e editado.
        codeEditorPopup(codeMirror);

        // resetando todo o form para novamente gerar outros códigos;
        formReset();
        return;
    });
}

export { analyticsEvent }