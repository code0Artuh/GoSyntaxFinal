const codeMirror = CodeMirror(document.querySelector('#root'), {
        lineNumbers: true,
        tabSize: 2,
        mode: 'javascript',
        readOnly: false,
        autoRefresh:true,
        lineWrapping: false,
        // adicionando 15 linhas em branco pra poder "alterá-las depois"
        value: "\n".repeat(15)
});

// selecionando o botão de copiar o código pro clipboard
const btnCopyToClipboard = document.querySelector('button#copyCodeToClipboard');

// adicionando evento para copiar para o clipboard o código gerado
btnCopyToClipboard.addEventListener('click', function(ev) {
    ev.stopPropagation();

    // checando se o editor de código está vazio
    if (codeMirror.isClean()) {
        alert('A area de texto está vazia! Favor gerar um código antes de tentar copiar.');
        return;
    }

    // enviando para o clipboard do navegador o código dentro do editor
    navigator.clipboard.writeText(codeMirror.getValue());
    btnCopyToClipboard.innerHTML = 'Copiado! <i class="fa fa-check"></i>'

    // timeout para estilização do botão
    setTimeout(function() {
        btnCopyToClipboard.innerHTML = '<i class="fa fa-copy"></i>';
    }, 2000);
})


export function resetCodeMirror() {
    codeMirror.setValue("\n".repeat(15));
}


export { codeMirror }