function subject() {
    const observers = [];

    function subscribeObserver(...observer) {
        observers.push(observer);
    }

    function notifyAll(args) {
        observers.forEach((observer) => {
            observer(args);
        })
    }

    return { notifyAll, subscribeObserver }
}

export { subject }