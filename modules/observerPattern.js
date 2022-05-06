function subject() {
    // state observers
    const observers = [];

    // subscribe observer
    function subscribeObserver(...observer) {
        observers.push(...observer);
    }

    // notifyall observers
    function notifyAll(...args) {
        observers.forEach(function (observer) {
            observer(...args);
        })
    }

    return { notifyAll, subscribeObserver }
}

export { subject }