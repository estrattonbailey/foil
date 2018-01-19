function n(){window.location.pathname;var n=[];return{push:function(t){history.pushState({},"",t);for(var u=0,e=n;u<e.length;u+=1){(0,e[u])(t)}},update:function(t){return n.push(t),function(){return n.slice(n.indexOf(t),1)}}}}module.exports=n;
//# sourceMappingURL=index.js.map
