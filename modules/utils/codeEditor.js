export const codeEditorPopup = function (codeMirror) {
    // seleciona o popup do editor de código
    const popup = document.querySelector('.popup');

    // deixa visível
    popup.style.visibility = 'visible';

    // esconde caso o botão de voltar seja clicado
    popup.querySelector('button#back').addEventListener('click', function() {
        popup.style.visibility= 'hidden';

        // reseta o editor de código
        codeMirror.setValue("\n".repeat(15));
    });

    // Arthur code
    popup.querySelector('button#debuggerCode').addEventListener('click', function () {
        // pega o código do editor e testa a execução do evento
        var msg = codeMirror.getValue().replace(`gtag`,`alert`).replace('event','Evento Disparando!!!');
        chrome.tabs.executeScript({
            code: `${msg.replace('<script>', '').replace('</script>', '')}`
        });

        popup.style.visibility = 'hidden';
    })
}