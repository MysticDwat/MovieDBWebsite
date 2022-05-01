//event manager for communication between components/elements
const EventBus = {
    //creates event listener
    on(event, callback) {
        document.addEventListener(event, (e) => callback(e.detail));
    },

    //sends out data through an event
    dispatch(event, data) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },

    //removes event listener
    remove(event, callback) {
        document.removeEventListener(event, callback);
    },
};

export default EventBus;