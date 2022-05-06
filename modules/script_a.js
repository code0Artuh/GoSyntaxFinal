function eventcapture() {
    var check_cald = document.getElementById('eventcapture');

    var code = `
    document.body.addEventListener("click", function (event) { 
        event.preventDefault();

        if (event.target.hasAttribute('id') && event.target.id != '') {
            alert(event.target.nodeName.toLowerCase() + '#' + event.target.id);
            return;
            }
    
            function getSelector(elm) {
            if (elm.tagName === "BODY") return "BODY";
            const names = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                if (elm.id) {
                    names.unshift("#" + elm.getAttribute("id")); // getAttribute, because 'elm.id could also return a child element with name "id"
                    break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
                } else {
                    let c = 1, e = elm;
                    for (; e.previousElementSibling; e = e.previousElementSibling, c++) ;
                    names.unshift(elm.tagName.toLowerCase() + ":nth-child(" + c + ")");
                }
                elm = elm.parentElement;
            }
                return names.join(" > ");
            }
    
        alert(getSelector(event.target));  
    });
    `

    check_cald.addEventListener('change', function () {
        if (check_cald.value == 'Ativado') {
            chrome.tabs.executeScript({
                code
            });
        } else {
            chrome.tabs.executeScript({
                code: 'window.location.reload()'
            });
        }
    })
}

export { eventcapture };