const getById=t=>document.getElementById(t);let Route=function(t,e=t){return{source:t,target:e}},RouteController=function(){let t,e={},o=[];return e.add=function(e,n=!1){o.push(e),t=n?e:t},e.resolve=e=>o.find((t=>t.source==e))||t,e}();RouteController.add(new Route(APP.url.o,VIEW.o),!0),RouteController.add(new Route(APP.url.item,VIEW.item)),RouteController.add(new Route(APP.url.profile,VIEW.profile)),RouteController.add(new Route(APP.url.group,VIEW.group)),RouteController.add(new Route(APP.url.Ie,VIEW.Ie));const START_ROUTE=RouteController.resolve(APP.do[0]),APP_NODE=getById("app"),CONTENT_NODE=getById("content"),NAV_NODE=getById("main-header-base"),NAV_CLOSE_NODE=getById("main-header-navigation-close-space");let isNavigationOpen=!1,setNavigationState=function(t){NAV_NODE.classList.toggle("closed",!t),isNavigationOpen=t},toggleNavigationState=()=>setNavigationState(!isNavigationOpen),closeNavigation=function(){isNavigationOpen&&setNavigationState(!1)};getById("main-header-nav-button").addEventListener("click",toggleNavigationState),NAV_CLOSE_NODE.addEventListener("click",closeNavigation,{passive:!0}),NAV_CLOSE_NODE.addEventListener("touchstart",closeNavigation,{passive:!0}),getById(START_ROUTE.target).classList.add(GLOBAL.u),APP_NODE.classList.add(START_ROUTE.target);