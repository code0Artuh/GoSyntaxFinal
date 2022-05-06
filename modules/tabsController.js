function tabsController() {
    // selecionando os formulários
    const formAdsConversionCode = document.querySelector('form#formAdsConversionCode');
    const formAnalyticsEvent = document.querySelector('form#formAnalyticsEvent');
    const formDataLayer = document.querySelector('form#formDataLayer');


    const btnTabs = Array.from(document.querySelectorAll('div#tabs button.tabBtn'));

    btnTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            formAdsConversionCode.style.display = 'none';
            formAnalyticsEvent.style.display = 'none';
            formDataLayer.style.display = 'none';

            btnTabs.forEach(tab => {
                tab.classList.remove('active');
            });

            tab.classList.add('active');

            if (tab.id === 'adsConversionCodeTab') {
                formAdsConversionCode.style.display = 'flex';
            }
            
            if (tab.id === 'analyticsEventTab') {
                formAnalyticsEvent.style.display = 'flex';
            }

            if (tab.id === 'dataLayerTab') {
                formDataLayer.style.display = 'flex';
            }
        })
    })
}

export { tabsController }