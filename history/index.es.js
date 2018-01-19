function createHistory() {
    var state = window.location.pathname;
    var handlers = [];
    return {
        push: function push(pathname) {
            history.pushState({}, '', pathname);
            for (var i = 0, list = handlers; i < list.length; i += 1) 
                {
                var fn = list[i];

                fn(pathname);
            }
        },
        update: function update(fn) {
            handlers.push(fn);
            return function () { return handlers.slice(handlers.indexOf(fn), 1); };
        }
    };
}

export default createHistory;
//# sourceMappingURL=index.es.js.map
