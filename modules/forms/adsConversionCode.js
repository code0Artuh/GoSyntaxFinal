import { subject } from '../observerPattern.js';
import { eventObserversArray } from '../observerModules/observerEvents.js'
import { codeEditorPopup } from '../utils/codeEditor.js';
import { getCurrencyPrice } from '../utils/getCurrencyPrice.js';
import { codeMirror, resetCodeMirror } from '../utils/getCodeMirror.js';

function adsConversionCode() {
    // instanciando o form de Ads Conversion Code
    const formAdsConversionCode = document.querySelector('form#formAdsConversionCode');

    // selecionando as checkboxes disponíveis
    const checkboxEvent = formAdsConversionCode.querySelector('input#enableEvent');
    const checkboxUrl = formAdsConversionCode.querySelector('input#enableUrlFilter');
    const checkboxArray = formAdsConversionCode.querySelector('input#enableElementArray');
    const checkboxDomContentLoaded = formAdsConversionCode.querySelector('input#enableDomContentLoaded');

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
        formAdsConversionCode.reset();

        // zerando controllers dos checkboxes
        checkBoxesController.eventBoxChecked = false;
        checkBoxesController.urlBoxChecked = false;
        checkBoxesController.arrayBoxChecked = false;
        checkBoxesController.domContentLoadedChecked = false;

        // desabilitando selects dentro do HTML
        formAdsConversionCode.querySelector('select#eventType').setAttribute('disabled', '');
        formAdsConversionCode.querySelector('select#urlType').setAttribute('disabled', '');
        formAdsConversionCode.querySelector('input#urlText').setAttribute('disabled', '');
        formAdsConversionCode.querySelector('input#selectorCss').setAttribute('disabled', '');

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
            formAdsConversionCode.querySelector('input#selectorCss').hasAttribute('disabled') && formAdsConversionCode.querySelector('input#selectorCss').removeAttribute('disabled');
        } else {
            const checkSelectorCssBox = formAdsConversionCode.querySelector('input#selectorCss').hasAttribute('disabled');
            
            // se o checkbox de array NÃO tiver checado e NEM o checkbox de eventos desabilita o input de seletor CSS.
            !checkSelectorCssBox && !checkBoxesController.eventBoxChecked && formAdsConversionCode.querySelector('input#selectorCss').setAttribute('disabled', '');
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
            formAdsConversionCode.querySelector('select#eventType').removeAttribute('disabled');
            formAdsConversionCode.querySelector('input#selectorCss').hasAttribute('disabled') && formAdsConversionCode.querySelector('input#selectorCss').removeAttribute('disabled');
        } else {
            const checkSelectorCssBox = formAdsConversionCode.querySelector('input#selectorCss').hasAttribute('disabled');
            
            // se o checkbox de eventos NÃO estiver checado e NEM o checkbox de array desabilita o select do Tipo de evento da DOM e o Input do Seletor CSS
            formAdsConversionCode.querySelector('select#eventType').setAttribute('disabled', '');
            !checkSelectorCssBox && !checkBoxesController.arrayBoxChecked && formAdsConversionCode.querySelector('input#selectorCss').setAttribute('disabled', '');
        }
    });

    // evento para capturar mudança no checkbox de URL Filter
    checkboxUrl.addEventListener('change', function (ev) {
        ev.stopPropagation();

        // altera o estado do checkboxes controller definido lá em cima
        checkBoxesController.urlBoxChecked = !checkBoxesController.urlBoxChecked;

        if (!checkBoxesController.urlBoxChecked) {
            // se o checkbox de URL Filter NÃO estiver checado desabilita o select do Tipo de filtro de URL e o input da URL
            formAdsConversionCode.querySelector('select#urlType').setAttribute('disabled', '');
            formAdsConversionCode.querySelector('input#urlText').setAttribute('disabled', '');
        } else {
            // se o checkbox de URL Filter estiver checado habilita o select do Tipo de filtro de URL e o input da URL
            formAdsConversionCode.querySelector('select#urlType').removeAttribute('disabled');
            formAdsConversionCode.querySelector('input#urlText').removeAttribute('disabled');
        }
    });

    const typeConversionSelect = formAdsConversionCode.querySelector('select#typeConversion');

    typeConversionSelect.addEventListener('change', function(ev) {
        const conversionPrice = formAdsConversionCode.querySelector('input#priceSelector');
        const conversionOid = formAdsConversionCode.querySelector('input#orderSelector');
        const conversionCurrency = formAdsConversionCode.querySelector('select#currencyType');

        if (typeConversionSelect.value === 'purchase') {
            conversionPrice.hasAttribute('disabled') && conversionPrice.removeAttribute('disabled');
            conversionOid.hasAttribute('disabled') && conversionOid.removeAttribute('disabled');
            conversionCurrency.hasAttribute('disabled') && conversionCurrency.removeAttribute('disabled');
        } else {
            !conversionPrice.hasAttribute('disabled') && conversionPrice.setAttribute('disabled', '');
            !conversionOid.hasAttribute('disabled') && conversionOid.setAttribute('disabled', '');
            !conversionCurrency.hasAttribute('disabled') && conversionCurrency.setAttribute('disabled', '');
        }
    });


    // capturando envio do formulário
    formAdsConversionCode.addEventListener('submit', function (ev) {
        // prevenindo comportamento padrão
        ev.preventDefault();

        // criando o Subject para receber os observers
        const subjectOfObservers = subject();

        // capturando os valores dos inputs e selects do DOM
        const htmlElements = {
            selectorInputCss: formAdsConversionCode.querySelector('input#selectorCss').value,
            urlTypeSelector: formAdsConversionCode.querySelector('select#urlType').value,
            eventTypeSelector: formAdsConversionCode.querySelector('select#eventType').value,
            urlTextSelector: formAdsConversionCode.querySelector('input#urlText').value,
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

        const conversionConfigs = {
            conversionId: formAdsConversionCode.querySelector('input#conversionId'),
            conversionLabel: formAdsConversionCode.querySelector('input#conversionLabel'),
        }

        if (!conversionConfigs.conversionId.value || !conversionConfigs.conversionLabel.value) {
            alert('Campo de conversion ID ou conversion label deve estar preenchido!');
            resetCodeMirror();
            return;
        }

        if (typeConversionSelect.value === 'purchase') {
            const conversionPrice = formAdsConversionCode.querySelector('input#priceSelector').value;
            const conversionOid = formAdsConversionCode.querySelector('input#orderSelector').value;
            const conversionCurrency = formAdsConversionCode.querySelector('select#currencyType').value;

            if (!conversionPrice || !conversionOid || !conversionCurrency) {
                alert('Campos de Preço, Transaction ID e Currency devem estar preenchidos com os seletores CSS!');
                resetCodeMirror();
                return;
            }

            // colocando comentário no meio do editor de códigos
            codeMirror.replaceRange(`
                gtag('event', 'conversion', {   
                    'send_to': 'AW-${conversionConfigs.conversionId.value}/${conversionConfigs.conversionLabel.value}',
                    'value': ${getCurrencyPrice(conversionCurrency, `document.querySelector('${conversionPrice}').innerText`)},
                    'currency': '${conversionCurrency}',
                    'transaction_id': document.querySelector('${conversionOid}').innerText.replace(/\\D+/g, '')
                })`, {line: (codeMirror.lineCount() / 2) - 1});

            // mostrando janela com o código gerado, identado e editado.
            codeEditorPopup(codeMirror);

            // resetando todo o form para novamente gerar outros códigos;
            formReset();
            return;
        }

        // colocando comentário no meio do editor de códigos
        codeMirror.replaceRange(`
            gtag('event', 'conversion', {   
                'send_to': 'AW-${conversionConfigs.conversionId.value}/${conversionConfigs.conversionLabel.value}',
            });`, {line: (codeMirror.lineCount() / 2) - 1});

        // mostrando janela com o código gerado, identado e editado.
        codeEditorPopup(codeMirror);

        // resetando todo o form para novamente gerar outros códigos;
        formReset();
        return;
    });
}

export { adsConversionCode }