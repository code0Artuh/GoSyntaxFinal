function openDocumentation() {
    // selecionando o botão de expandir a documentação
    const btnDocumentation = document.querySelector('div#assets button');

    // adicionando evento pra expandir a documentação
    btnDocumentation.addEventListener('click', function(ev) {
        ev.stopPropagation();
    
        // expandindo o módulo de popup da documentação
        // seleciona o popup de documentação
        const popup = document.querySelector('.popupDocumentation');

        // deixa visível
        popup.style.visibility = 'visible';
    
        // esconde caso o botão de voltar seja clicado
        popup.querySelector('button#back').addEventListener('click', function() {
            popup.style.visibility= 'hidden';
        });
    });
}

export { openDocumentation }