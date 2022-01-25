Element.prototype.remove=function(){this.parentElement.removeChild(this)},NodeList.prototype.remove=HTMLCollection.prototype.remove=function(){for(let e=this.length-1;e>=0;e--)this[e].parentElement.removeChild(this[e])};let Item=function(e,t=[],i=!1,n="/"+e,o,r,a,s,l,c=[],u={}){return{id:e,L:t,title:o,P:{B:r,content:a},ct:s,Xe:l,G:c,N:i,W:n,j:u,type:GLOBAL.item}},ResourceMap=function(e,t,i,n){return{Ie:e,hash:t,ut:i,dt:n}},ItemDate=function(e,t,i){this.wt=function(e=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]){return this.m+"&nbsp;"+e[this.h-1]+",&nbsp;"+this.C};let n=new Date;this.m=e||n.getDate(),this.h=t||n.getMonth()+1,this.C=i||n.getFullYear()},Group=function(e,t=[],i,n,o,r=[],a={},s=!1){return{id:e,L:t,j:a,title:i,G:r,F:s,ct:n,Xe:o,type:GLOBAL.group}},View=function(e,t,i={},n={},o=null,r=!1,a=ViewController.M.H){return{id:e,url:t,data:i,event:n,U:o,_:r,q:a}},HistoryItem=function(e,t,i){return{id:e,index:t,j:i}},ErrorClass=function(e,t,i,n=[],o=!0){return{id:e,title:t,message:i,ht:n,tt:o}};const createHash=function(e,t=0){let i=3735928559^t,n=1103547991^t;for(let t,o=0;o<e.length;o++)t=e.charCodeAt(o),i=Math.imul(i^t,2654435761),n=Math.imul(n^t,1597334677);return i=Math.imul(i^i>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),n=Math.imul(n^n>>>16,2246822507)^Math.imul(i^i>>>13,3266489909),4294967296*(2097151&n)+(i>>>0)};let ViewController=function(){let e,t,i,n={},o=[],r=-1,a=-1;EventController.call(n,{navigateToView:[],navigateFromView:[],navigateDefault:[],historyEdit:[]});let s,l=[],c=[];n.nt=function(e){-1==l.findIndex((t=>e.id==t.id))&&l.push(e)},n.rt=function(e,i=!1){let n=l.find((t=>e==t.id||e.id==t.id)),r=!0;n.ht.forEach((e=>{c.includes(e)&&(r=!1)})),r&&(i?(o.forEach((e=>e.re?e.event?.lt.call(e,n):"")),s=n):t.event?.lt.call(t,n),c.push(n.id))};let u=function(e){"string"==typeof e.U&&(e.U=getById(e.U))},d=async function(e){e.J&&!e.X&&(e.J=!1,e.X=!0,await(e.event.K?.call(e)))};return n.navigate=async function(l,c={}){let w=(t=>o.find((e=>e.id==t))||e)(l);var m;t&&(d(t),(m=t).q==n.M.ee&&(m.X=!1),u(t),t.event.$?.call(t,c),n.I("navigateFromView",[t,c]),i=t),c.te||(r++,w==e&&(a=r),n.I("historyEdit",[Object.assign(new HistoryItem(w.id,r,{oe:c.oe,ne:c.ne}),{gt:a}),w])),t=w,t.ft=c,u(t),await function(e){e._&&!e.re&&(s&&e.event?.lt.call(e,s),e.event.ae?.call(e),e.re=!0)}(t),n.I("navigateToView",[t,i,c]),await(t.event.se?.call(t,c)),t.q!=n.M.le&&await async function(e,t){return e.J||e.X||(e.J=!0,await(e.event.Y?.call(e,t))),e}(t,c).then((e=>d(e)))},n.register=async function(t,i=!1){o.push(t),t._||t.event.ae?.call(t),i&&(e=t)},n.ce=function(i){t!=e&&(n.navigate(e.id,i),n.I("navigateDefault",[i]))},n.back=function(){0==history.state.index?n.ce():history.back()},n.ue={forward:1,back:0},n.M={H:"single",ee:"always",le:"never"},n.move=function(e,t){r+=e==n.ue.forward?1:-1,n.navigate(t.id,Object.assign({te:!0},t.j))},Object.defineProperties(n,{me:{get:()=>r}}),n}(),ItemController=function(){let e,t=[],i=[],n=!1,o=[],r=!1,a={};EventController.call(a,{fetchGroup:[],fetchGroupFinish:[],fetchItem:[],fetchItemFinish:[]}),ViewController.nt(new ErrorClass("item_not_found","Item don't exist","We don't have what you're looking for",["item_outdated","item_load_error","group_not_found"])),ViewController.nt(new ErrorClass("group_not_found","Group don't exist","We don't have what you're looking for",["item_outdated","item_load_error"])),ViewController.nt(new ErrorClass("item_not_fetched","Item cannot be loaded","Check your internet connection"));let s=async function(e){if(e){if(!e.N&&!e.fe){let t=await async function(e){return new Promise(((t,i)=>{let n=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");n.onreadystatechange=function(){4==this.readyState&&(200==this.status?t(JSON.parse(this.responseText)):(ViewController.rt("item_not_fetched",!1),i("Error in AJAX request")))},n.open("GET",APP.l+e.W+APP.t+APP.i,!0),n.send()}))}(e,e.W);Object.assign(e,t,{ge:[]}),e.ge.push(new ResourceMap({src:APP.i},"",0,0)),e.content.forEach(((t,i)=>{t.Ie&&(t.It=e.ge.length,t.Vt=e.ge.length+t.Ie.length-1,t.Ie.forEach((n=>e.ge.push(new ResourceMap(n,createHash(i+t.It+e.W+n.src),t.It,t.Vt)))))})),e.yt=t=>function(e,t){let i=e.ge.find((e=>e.hash==t));return i?{Ie:i,group:e.ge.slice(i.ut,i.dt+1)}:null}(e,t),t?.version==APP.version&&(e.fe=!0)}return e}ViewController.rt("item_not_found")},l=e=>encodeURIComponent(e.toLowerCase().replaceAll(" ","-")),c=e=>o.find((t=>t.source==e))?.target,u=e=>t.find((t=>t.source==e))?.target;return a.Ae=async function(t){await Promise.all(t.map((async t=>{!function(e){e.content=[],e.id=e.id||l(e.title),o.push(new RouteClass(e.id,e))}(t),i.push(t),t.L.forEach((e=>o.push(new RouteClass(e,t)))),t.F&&(e=t),await a.I("fetchGroup",[t])}))),i.forEach((e=>e.G?.forEach((t=>c(t)?.content.push(e))))),await a.I("fetchGroupFinish"),r=!0},a.he=async function(i){await Promise.all(i.map((async i=>{i.id=i.id||l(i.title),t.push(new RouteClass(i.id,i)),e.content.push(i),i.L.forEach((e=>t.push(new RouteClass(e,i)))),i.G?.forEach((e=>c(e)?.content.push(i))),await a.I("fetchItem",[i])}))),await a.I("fetchItemFinish",[]),n=!0},a.Le={group:"group",item:"item",Pe:"allitems",all:"all"},Object.defineProperties(a,{storage:{get:()=>i},ve:{get:()=>n},Be:{get:()=>r},Oe:{value:u},Ge:{value:c},pe:{value:async e=>await s(u(e))}}),a}();const landingView=new View(VIEW.o,APP.url.o,{scrollY:-1,Re:!1},{se:function(){this.data.scrollY>=0&&window.scroll(0,this.data.scrollY),document.title=APP.name},ae:function(){let e=getById("profile-link-button");e.href=APP.url.profile,e.addEventListener("click",(()=>{event.preventDefault(),ViewController.navigate(VIEW.profile)})),this.data.Se=getById("main-list")},$:function(){this.data.scrollY=window.scrollY,this.U.classList.remove(GLOBAL.error)},K:function(){this.U.classList.remove(GLOBAL.loading),this.data.Se.getElementsByClassName(GLOBAL.A+" no-data").remove()},Y:async function(){this.U.classList.add(GLOBAL.loading),ItemController.ve&&ItemController.Be&&StorageResponseBuilder(await ItemController.Ge("landing"),this.data.Se,1,-1)},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("landing-error-node"))}},VIEW.o,!0,ViewController.M.H),profileView=new View(VIEW.profile,APP.url.profile,{},{se:()=>{window.scroll(0,0),document.title="About me - "+APP.name}},VIEW.profile,!1,ViewController.M.le),itemView=new View(VIEW.item,APP.url.item,{Te:null},{se:()=>window.scroll(0,0),$:function(){this.U.classList.remove(GLOBAL.error)},ae:function(){this.data.At=getById("item-title"),this.data.Lt=getById("item-content"),this.data.vt=getById("item-info")},Y:async function(e){if(this.U.classList.add(GLOBAL.loading),ItemController.ve){let t=this.data.Te=await ItemController.pe(e.oe[0]);if(t.N)return window.open(t.N,"_blank").focus(),void ViewController.ce();document.title=t.title+" - "+APP.name,this.data.At.innerHTML=t.title,this.data.vt.innerHTML=t.ct.wt()+(t.Xe?" <u class='dotted-separator'></u> Updated "+t.Xe.wt():""),this.data.Lt.innerHTML="",t.content.forEach((e=>this.data.Lt.append(new ItemComponentBuilder(e,t.W,t)))),incrementVisitors(APP.l+"/"+t.id,!0)}},K:function(){this.U.classList.remove(GLOBAL.loading)},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("item-error-node"))}},VIEW.item,!0,ViewController.M.ee),groupView=new View(VIEW.group,APP.url.group,{scrollY:-1},{ae:function(){let e=this.data;e.Ct=getById("group-data"),e.Bt=getById("group-list"),e.Pt=getById("group-title"),e.Ot=getById("group-info")},se:()=>window.scroll(0,0),$:function(){Array.prototype.forEach.call(this.data.Bt.getElementsByClassName(GLOBAL.A),(e=>e.classList.add("loading","no-data"))),this.U.classList.remove(GLOBAL.error)},Y:async function(e){this.U.classList.add(GLOBAL.loading),this.data.Ct.classList.add(GLOBAL.loading);let t=await ItemController.Ge(e.oe[0]);t?(this.data.Fe=t,this.data.Pt.innerHTML=t.title,document.title=t.title+" - "+APP.name,this.data.Ot.innerHTML=t.ct.wt()+" <u class='dotted-separator'></u> "+t.content.length+"&nbsp;"+(1!=t.content.length?"items":"item"),this.data.Ct.classList.remove(GLOBAL.loading),await StorageResponseBuilder(t,this.data.Bt,1,-1)):ViewController.rt("group_not_found")},K:function(){this.U.classList.remove(GLOBAL.loading),this.data.Bt.getElementsByClassName("no-data").remove()},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("group-error-node"))}},VIEW.group,!0,ViewController.M.ee),resourceView=new View(VIEW.Ie,APP.url.Ie,{},{se:function(){document.title="Gallery - "+APP.name},ae:function(){ViewController.nt(new ErrorClass("image_not_found","Image not found","Try refresh page",["item_not_found","item_outdated","item_load_error"],!0));let e=this;this.data.Gt=new ResourceSlider;let t=this.data.bt=getById("image-viewer-list"),i=getById("image-viewer-prev"),n=getById("image-viewer-next");n.addEventListener("click",this.data.Gt.next),i.addEventListener("click",this.data.Gt.previous),getById("image-viewer-close").addEventListener("click",ViewController.back),this.data.Gt.addEventListener("render",(function(i,n,o,r){t.children[n].classList.add(GLOBAL.u),t.children[r]?.classList.remove(GLOBAL.u),history.replaceState(history.state,"","/"+e.url+"/"+e.data.Te.id+"/"+i.hash)})),this.data.Gt.addEventListener("load",(async function(i){await new Promise((n=>{let o=document.createElement("IMG");o.src=APP.l+e.data.Te.W+APP.t+i.Ie.src,t.appendChild(o),o.onload=n,o.onerror=function(){o.src="/img/image_error.webp"}}))})),this.data.Gt.addEventListener("loadFinish",(function(e){n.classList.toggle(GLOBAL.disabled,e.length<2),i.classList.toggle(GLOBAL.disabled,e.length<2)})),this.data.Gt.addEventListener("close",(()=>t.innerHTML=""))},Y:async function(e){this.U.classList.add(GLOBAL.loading),this.data.Te=e.Te||await ItemController.pe(e.oe[0]);let t=this.data.Te.yt(e.oe[1]);t?(await this.data.Gt.Et(t.group,t.Ie),e._t&&e._t.start(this.data.bt.children[this.data.Gt.Nt])):ViewController.rt("image_not_found",!1)},K:function(){this.U.classList.remove(GLOBAL.loading)},$:function(){this.U.classList.remove(GLOBAL.error),this.data.Gt.close()},lt:function(e){this.U.classList.add(GLOBAL.error),createErrorMsg(e,getById("resources-error-node"))}},VIEW.Ie,!0,ViewController.M.ee);let navigationNode;ViewController.register(landingView,!0),ViewController.register(profileView),ViewController.register(itemView),ViewController.register(groupView),ViewController.register(resourceView),ViewController.addEventListener("historyEdit",((e,t)=>{let i="/"+t.url+(e.j.oe?.length>0?"/"+(e.j.oe?.join("/")||""):"");0==e.index?history.replaceState(e,"",i):history.pushState(e,"",i)})),ViewController.addEventListener("navigateDefault",(()=>-1!=history.state.gt&&history.state.gt-history.state.index!=0?history.go(history.state.gt-history.state.index):"")),ViewController.addEventListener("navigateToView",((e,t)=>{e.U.classList.add(GLOBAL.u),APP_NODE.classList.replace(t?.id,e.id),setNavigationState(!1)})),ViewController.addEventListener("navigateFromView",(e=>e.U.classList.remove(GLOBAL.u))),window.addEventListener("load",(async function(){ViewController.nt(new ErrorClass("item_load_error","Items cannot be loaded","Try refreshing the page")),ViewController.nt(new ErrorClass("item_outdated","Items are outdated","Try refreshing the page")),getById("home-button").addEventListener("click",(()=>ViewController.ce())),getById("main-header-about-button").addEventListener("click",(e=>{e.preventDefault(),ViewController.navigate(VIEW.profile)})),getById("main-header-work-button").addEventListener("click",(e=>{e.preventDefault(),ViewController.navigate(VIEW.group,{oe:["work"]})})),navigationNode=getById("main-header-navigation"),getById("main-header-nav-button").addEventListener("click",toggleNavigationState),getById("main-header-navigation-close-space").addEventListener("click",hideNavigation),setTimeout((()=>document.body.classList.remove("first-start")),300),APP_NODE.classList.toggle(GLOBAL.g,!navigator.onLine);try{APP.version!=ITEM_VERSION?ViewController.rt("item_outdated",!0):await ItemController.Ae(getGroups()).then((()=>ItemController.he(getItems())))}catch{ViewController.rt("item_load_error",!0)}await ViewController.navigate(START_ROUTE.target,{oe:START_URL.slice(1,START_URL.length-1)})})),window.addEventListener("popstate",(e=>ViewController.move(ViewController.me-e.state.index<=0,e.state)));let isNavigationOpen=!1,setNavigationState=function(e){navigationNode.classList.toggle("hidden",!e),isNavigationOpen=e},toggleNavigationState=()=>setNavigationState(!isNavigationOpen),hideNavigation=function(){isNavigationOpen&&setNavigationState(!1)},createItemTile=async function(e,t){if("A"!=e.nodeName){let t=e;e=document.createElement("A"),t.parentElement.replaceChild(e,t)}e.className="item "+GLOBAL.A+" "+GLOBAL.loading,e.innerHTML="<div class='img'><img src='"+APP.l+t.W+t.P.B+"' alt='"+t.title+"'/></div><b class='font-subtitle'>"+t.title+"</b><span class='font-base'>"+t.P.content+"</span><div class='labels'><div class='button'>"+(t.N?"Open link <i class='mi mi-OpenInNewWindow'></i>":"Read more <i class='mi mi-BackMirrored'></i>")+"</div>"+(t.Xe?"<div class='label font-caption'><i class='mi mi-Update'></i> &nbsp;&nbsp;"+t.Xe.wt()+"</div>":"")+"</div>";let i=e.children[0].children[0];return await new Promise((e=>{i.onload=()=>e(void(t.xe||(t.j.We&&(i.style=t.j.We),cacheResource(APP.l+t.W+t.P.B)))),i.onerror=()=>e((t.xe=!0,i.src="/img/image_error.webp",void(i.onload=function(){})))})),e.classList.replace(GLOBAL.loading,GLOBAL.loaded),e.onclick=function(){event.preventDefault(),t.N?window.open(t.N,"_blank").focus():ViewController.navigate(VIEW.item,{oe:[t.id]})},e.href=t.N||APP.url.item+t.id,setTimeout((()=>e.classList.remove(GLOBAL.loaded)),300),e},createGroupTile=function(e,t){if("DIV"!=e.nodeName){let t=e;e=document.createElement("DIV"),t.parentElement.replaceChild(e,t)}return e.className="group "+GLOBAL.A,e.innerHTML="<span class='font-title'></span><a class='button'><i class='mi mi-ShowAll'></i> <span>Show all</span></a>",e.children[0].innerHTML=t.title,e.children[1].onclick=function(){event.preventDefault(),ViewController.navigate(VIEW.group,{oe:[t.id]})},e.children[1].href=APP.url.group+t.id,e},ResourceSlider=function(){let e,t,i=[];EventController.call(this,{load:[],loadFinish:[],next:[],previous:[],render:[],remove:[],close:[]});let n=this,o=async function(o){t=e,e=o,await n.I("render",[i[e],e,i[t],t])};this.Et=async function(e,t){i=e,await Promise.all(i.map((async(e,t)=>await n.I("load",[e,t])))),o(t?i.findIndex((e=>e==t)):0),await this.I("loadFinish",[i])},this.close=async()=>{t=-1,e=-1,await n.I("close",[i[e],e])},this.next=async function(){let t=e+1;t>=i.length&&(t=0),await o(t),await n.I("next",[i[e],t])},this.previous=async function(){let t=e-1;t<0&&(t=i.length-1),await o(t),await n.I("previous",[i[e],t])},Object.defineProperties(this,{Nt:{get:()=>e}})},StorageResponseIndexer=function(e,t=1,i=3,n=0,o=3){let r=[];return e.content?.forEach(((a,s)=>{a.type==GLOBAL.group?t>0&&(r.push({index:n,Me:a}),r=r.concat(StorageResponseIndexer(a,t-1,o,n+1)),n=r[r.length-1].index+1):(i>0&&(!a.Ue||e.content.length-s<=i)||-1==i)&&(a.Ue=!0,r.push({index:n,Me:a}),i>0&&(i-=1),n+=1)})),r},StorageResponseBuilder=async function(e,t=document.createElement("DIV"),i=1,n=3){let o=[...t.getElementsByClassName(GLOBAL.A)],r=StorageResponseIndexer(e,i,n,0);await Promise.all(r.map((async e=>{e.Me.Ue=!1,e.Me.type==GLOBAL.group?await createGroupTile(o[e.index]||t.appendChild(document.createElement("div")),e.Me):await createItemTile(o[e.index]||t.appendChild(document.createElement("a")),e.Me)})))},createErrorMsg=function(e,t){if(t.innerHTML="<i class='mi mi-Error font-header'></i><div class='font-title'>"+e.title+"</div><span class='font-base'>"+e.message+"</span>",e.tt){let e=document.createElement("A");e.classList.add("button"),e.innerHTML="<i class='mi mi-Refresh'></i><span>Refresh page</span>",e.addEventListener("click",(()=>window.location.reload(!0))),t.appendChild(e)}},ItemComponentBuilder=function(e,t,i){let n,o=e.type,r=e.arguments||{};switch(o){case"section":if(n=document.createElement("DIV"),n.classList.add("section"),e.title){let t=document.createElement("DIV");t.className="section-title font-subtitle",t.innerText=e.title,n.append(t)}n.append(e.content);break;case"image":n=document.createElement("DIV"),n.classList.add("image");let o=document.createElement("IMG");o.src=APP.l+t+APP.t+e.Ie[0].src,o.alt=e.Ie[0].alt||"",o.onerror=function(){o.onload=function(){},o.src="/img/image_error.webp",o.classList.add("no-image")},o.onload=function(){o.onclick=function(){ViewController.navigate(VIEW.Ie,{oe:[i.id,i.ge[e.It].hash],Te:i})}};let a=document.createElement("SPAN");a.className="img-alt",a.innerHTML=e.alt||"",n.appendChild(o),n.appendChild(a);break;case"quote":n=document.createElement("DIV"),n.className="quote";let s=document.createElement("DIV");s.className="font-header",s.innerHTML=e.content;let l=document.createElement("SPAN");l.className="font-base",l.innerHTML=e.He,n.appendChild(s),n.appendChild(l);break;case"text":n=document.createElement("DIV"),n.innerHTML=e.content;break;case"multi-section":if(n=document.createElement("DIV"),n.classList.add("section"),!r.je){let e=document.createElement("DIV");e.className="section-title font-subtitle",e.innerText=title,n.append(e)}n.forEach((e=>n.append(new ItemComponentBuilder(e,t))));break;case"gallery":n=document.createElement("DIV"),n.classList.add("gallery"),n.innerHTML="<div><b class='font-subtitle'>"+e.title+"</b></div><div class='list'></div>";let c=document.createElement("A");c.innerHTML="<i class='mi mi-Picture'></i><span>Show all</span>",c.classList.add("button"),c.onclick=function(){ViewController.navigate(VIEW.Ie,{oe:[i.id,i.ge[e.It].hash],Te:i})},n.children[0].appendChild(c);let u=e.Ie.length>5?5:e.Ie.length;for(let o=0;o<u;o++){let r=e.Ie[o],a=document.createElement("IMG");a.alt=r.alt||"",a.src=APP.l+t+APP.t+r.src,n.children[1].appendChild(a),a.onload=function(){a.onclick=function(){ViewController.navigate(VIEW.Ie,{oe:[i.id,i.ge[e.It+o].hash],Te:i})}}}break;default:n=document.createElement("DIV")}return n},ShadowNodeClass=function(e,t){let i=this.target=e.cloneNode(!0),n=window.getComputedStyle(e);t.forEach((e=>i.style[e]=n[e]));let o=[];t.forEach((e=>o.push(n[e]))),this.target.classList.add("shadow")},ConnectedAnimation=function(e,t=[]){let i,n,o,r=e;this.start=function(e){o=e;let n=o.getBoundingClientRect();i.style.top=o.offsetTop+"px",i.style.left=o.offsetLeft+"px",i.style.width=n.width+"px",i.style.height=n.height+"px",i.style.display="";let r=window.getComputedStyle(o);t.forEach((e=>i.style[e]=r[e])),o.style.display="none",setTimeout((function(){i.remove(),o.style.display=""}),3e3)},this.Rt=function(){n=new ShadowNodeClass(r,t),i=n.target;let e=r.getBoundingClientRect();i.style.top=e.top+"px",i.style.width=e.width+"px",i.style.height=e.height+"px",i.style.left=r.offsetLeft+"px",document.body.appendChild(i)}};