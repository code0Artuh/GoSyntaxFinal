function checkGTM() {
    const code = `
    (function checkGtmOrGlobal() {
        const hasGTM = document.head.innerHTML.includes('function(w,d,s,l,i)') || document.body.innerHTML.includes('function(w,d,s,l,i)');
        const hasGlobal = document.head.innerHTML.includes('function gtag(){dataLayer.push(arguments);}') || document.body.innerHTML.includes('function(w,d,s,l,i)');


        if (hasGTM && !hasGlobal) {
            chrome.runtime.sendMessage({tech: 'GTM - Google Tag Manager', color: 'green'});
            return;
        }

        if (hasGlobal && !hasGTM) {
            chrome.runtime.sendMessage({tech: 'gtag - Global Tag Site', color: 'green'});
            return;
        }
        
        if (hasGlobal && hasGTM) {
            chrome.runtime.sendMessage({tech: 'Ops... O site possui gtag e GTM gerenciando o dataLayer. Alguns erros podem ocorrer!', color: 'red'});
            return;
        }

        chrome.runtime.sendMessage({tech: 'Ops... O site não possui Global Site Tag ou Google Tag Manager', color: 'red'});
    })()
`

    chrome.tabs.executeScript({
        code,
    });

    chrome.runtime.onMessage.addListener(function (elementSelector) {
        const el = document.querySelector('#tech');

        el.innerText = elementSelector.tech;
        el.style.color = elementSelector.color;
        return true;
    });
}

export { checkGTM }