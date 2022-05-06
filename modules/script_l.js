import { tabsController } from './tabsController.js';
import { openDocumentation } from './utils/openDocumentation.js';
import { checkGTM } from './utils/checkTechnology.js';
import { adsConversionCode } from './forms/adsConversionCode.js';
import { analyticsEvent } from './forms/analyticsEvent.js';
import { dataLayer } from './forms/dataLayer.js';



// função master de execução do código
function execute() {
    // iniciando o check technology para verificar o tipo de tecnologia do site
    checkGTM();

    // iniciando o controller das tabs
    tabsController();

    // iniciando o controller de documentação JS
    openDocumentation();

    // iniciando form de ads conversion code
    adsConversionCode();

    //iniciando form de analytics event
    analyticsEvent();

    //iniciando form de dataLayer
    dataLayer();
    
}

export { execute };