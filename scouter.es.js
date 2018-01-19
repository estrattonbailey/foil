import assert from 'nanoassert';

function getParts(url) {
    var parts = url.split('/');
    return parts.slice(parts[0] !== '' ? 0 : 1);
}

function getRoute(path, routes) {
    var urls = getParts(path);
    var params = {};
    outer:for (var i$1 = 0, list = routes; i$1 < list.length; i$1 += 1) {
        var route = list[i$1];

        if (urls.length === route.parts.length) {
            inner:for (var i = 0;i < route.parts.length; i++) {
                if (route.parts[i][0] === ':') {
                    params[route.parts[i].slice(1)] = urls[i];
                    continue inner;
                } else if (route.parts[i] === urls[i]) {
                    continue inner;
                } else if (route.parts[i] === '*') {
                    break;
                }
                continue outer;
            }
            route.params = params;
            return route;
        } else if (route.parts[0] == '*') {
            route.params = params;
            return route;
        }
    }
}

function joinRoute(a, b) {
    return [a,b].join('/').replace('//', '/');
}

function route(r) {
    assert(r.path && r.component, 'routes require both path and component properties');
    assert(typeof r.path === 'string', 'route.path should be a string');
    assert(typeof r.component === 'function', 'route.component should be a function');
    return function child() {
        var rs = [], len = arguments.length;
        while ( len-- ) rs[ len ] = arguments[ len ];

        r.routes = rs && rs.length > 0 ? (function walk(routes) {
            return routes.map(function (route) {
                route.path = joinRoute(r.path, route.path);
                if (route.loader && r.loader) {
                    var loader = route.loader;
                    route.loader = (function (props, ctx) { return Promise.resolve(r.loader(props, ctx)).then(function (props) { return loader(props, ctx); }); });
                }
                walk(r.routes || []);
                return route;
            });
        })(rs) : [];
        return r;
    };
}

function router() {
    var defs = [], len = arguments.length;
    while ( len-- ) defs[ len ] = arguments[ len ];

    var routes = [];
    (function walk(rs) {
        while (rs.length) {
            var route = rs.pop();
            routes.push({
                parts: getParts(route.path),
                component: route.component,
                loader: route.loader
            });
            walk(route.routes);
        }
    })(defs);
    return {
        resolve: function resolve(pathname, context) {
            var this$1 = this;

            return Promise.resolve(getRoute(pathname, routes)).then(function (ref) {
                var component = ref.component;
                var loader = ref.loader;
                var params = ref.params;

                var ctx = Object.assign(context || {}, {
                    params: params
                });
                if (typeof loader === 'function') {
                    var data = this$1.cache ? this$1.cache.load(pathname, Promise.resolve(loader(null, ctx))) : Promise.resolve(loader(null, ctx));
                    return data.then(function (data) { return ({
                        component: component,
                        data: data,
                        params: params
                    }); });
                } else {
                    return {
                        component: component,
                        data: {},
                        params: params
                    };
                }
            });
        }
    };
}

export { route, router };
//# sourceMappingURL=scouter.es.js.map
