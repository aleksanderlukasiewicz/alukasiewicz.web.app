Element.prototype.remove = function () { this.parentElement.removeChild(this); };
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () { for (let i = this.length - 1; i >= 0; i--)this[i].parentElement.removeChild(this[i]); };
let Item = function (id, aliases = [], isItemLinkToWeb = false, folder = "/" + id, title, tileImage, tileContent, createDate, modifyDate, groups = [], arg = {}) {
    return {
        id, aliases,
        title,
        tile: { image: tileImage, content: tileContent },
        date: { create: createDate, modify: modifyDate },
        groups,
        isItemLinkToWeb, folder, arg,
        type: GLOBAL.item
    }
}
let ResourceMap = function (resource, hash, firstGroupIndex, lastGroupIndex) {
    return { resource, hash, firstGroupIndex, lastGroupIndex }
}
let ItemDate = function (day, month, year) { return { day, month, year }; };
let Group = function (id, aliases = [], title, createDate, modifyDate, groups = [], arg = {}, isDefault = false) {
    return {
        id, aliases, arg, title, groups, isDefault,
        date: { create: createDate, modify: modifyDate }, type: GLOBAL.group
    }
}
let View = function (id, url, data = {}, event = {}, rootNode = null, isRegisterDelayed = false, loadingMode = ViewController.loadingModes.single) {
    return {
        id,
        url,
        data,
        event,
        rootNode,
        isRegisterDelayed,
        loadingMode
    }
}
let HistoryItem = function (id, index, arg) {
    return {
        id,
        index,
        arg
    }
}
let ErrorClass = function (id, title, message, chaninedErrorIDs = [], refreshRequire = true) {
    return { id, title, message, chaninedErrorIDs, refreshRequire }
}
//hashing algorythm
const createHash = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    let _s = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return _s;
};
let ViewController = (function () {
    let _controller = {};
    EventController.call(_controller, {
        "navigateToView": [],
        "navigateFromView": [],
        "navigateDefault": [],
        "historyEdit": [],
    });
    //integrated error controller
    let _errors = [];
    let _historicalErrors = [];
    let _currentGlobalError;
    _controller.addError = function (error) {
        if (_errors.findIndex((_error) => error.id == _error.id) == -1)
            _errors.push(error);
    }
    _controller.invokeError = function (errorId, globalInvoke = false) {
        let __error = _errors.find((_error) => (errorId == _error.id) || (errorId.id == _error.id));
        let _errorAccepted = true;
        __error.chaninedErrorIDs.forEach((err) => { if (_historicalErrors.includes(err)) _errorAccepted = false; });
        if (_errorAccepted) {
            if (globalInvoke) {
                _views.forEach((view) => view.registered ? view.event?.onError.call(view, __error) : "");
                _currentGlobalError = __error;
            }
            else
                _currentView.event?.onError.call(_currentView, __error);
            _historicalErrors.push(__error.id);
        }
    }
    let _views = [];
    let _currentView;
    let _currentHistoryIndex = -1;
    let _defaultViewIndex = -1;
    let _getViewById = (id) => _views.find((view) => view.id == id) || _defaultView;
    let _defaultView;
    let _previousView;
    let _registerDelayedView = function (view) {
        if (view.isRegisterDelayed && !view.registered) {
            if (_currentGlobalError)
                view.event?.onError.call(view, _currentGlobalError);
            view.event.onRegister?.call(view);
            view.registered = true;
        }
    }
    let _generateRootNode = function (view) {
        if (typeof (view.rootNode) == "string")
            view.rootNode = getById(view.rootNode);
    }
    let _unLoadView = function (view) {
        if (view.loadingMode == _controller.loadingModes.always)
            view.isLoaded = false;
    }
    let _invokeLoadEvent = async function (view, arg) {
        if (!view.isLoading && !view.isLoaded) {
            view.isLoading = true;
            await view.event.onLoad?.call(view, arg);
        }
        return view;
    }
    let _invokeLoadFinishEvent = async function (view) {
        if (view.isLoading && !view.isLoaded) {
            view.isLoading = false;
            view.isLoaded = true;
            await view.event.onLoadFinish?.call(view);
        }
    }
    _controller.navigate = async function (id, arg = {}) {
        let _target = _getViewById(id);
        if (_currentView) {
            _invokeLoadFinishEvent(_currentView);
            _generateRootNode(_currentView);
            _currentView.event.onNavigateFrom?.call(_currentView, arg);
            _controller.invokeEvent("navigateFromView", [_currentView, arg]);
            _unLoadView(_currentView);
            _previousView = _currentView;
        }
        if (!arg.noHistoryPush) {
            _currentHistoryIndex++;
            if (_target == _defaultView) _defaultViewIndex = _currentHistoryIndex;
            _controller.invokeEvent("historyEdit", [Object.assign(new HistoryItem(_target.id, _currentHistoryIndex, { routeArg: arg.routeArg, historyArg: arg.historyArg }), {
                defaultViewIndex: _defaultViewIndex
            }), _target]);
        }
        _currentView = _target;
        _currentView.lastNavigationArguments = arg;
        _generateRootNode(_currentView);
        await _registerDelayedView(_currentView);
        _controller.invokeEvent("navigateToView", [_currentView, _previousView, arg]);
        await _currentView.event.onNavigate?.call(_currentView, arg);
        if (_currentView.loadingMode != _controller.loadingModes.never)
            await _invokeLoadEvent(_currentView, arg).then((view) => _invokeLoadFinishEvent(view))
    }
    _controller.register = async function (view, isDefault = false) {
        _views.push(view);
        if (!view.isRegisterDelayed)
            view.event.onRegister?.call(view);
        if (isDefault) _defaultView = view;
    }
    _controller.navigateToDefaultView = function (arg) {
        if (_currentView != _defaultView) {
            _controller.navigate(_defaultView.id, arg);
            _controller.invokeEvent("navigateDefault", [arg]);
        }
    }
    _controller.back = function () {
        if (history.state.index == 0)
            _controller.navigateToDefaultView();
        else
            history.back();
    }
    _controller.moveModes = {
        forward: 1,
        back: 0
    }
    _controller.loadingModes = {
        single: "single",
        always: "always",
        never: "never"
    }
    _controller.move = function (move, historyItem) {
        _currentHistoryIndex += (move == _controller.moveModes.forward ? 1 : -1);
        _controller.navigate(historyItem.id, Object.assign({
            noHistoryPush: true
        }, historyItem.arg));
    }
    Object.defineProperties(_controller, {
        currentHistoryIndex: {
            get: () => _currentHistoryIndex
        }
    });
    return _controller;
}());
let ItemController = (function () {
    let _routes = [];
    let _groupRoutes = [];
    let _storage = [];
    let _groupsLoaded = false;
    let _itemsLoaded = false;
    let _controller = {};
    EventController.call(_controller, {
        "fetchGroup": [],
        "fetchGroupFinish": [],
        "fetchItem": [],
        "fetchItemFinish": []
    });
    let _getResourceGroupByHash = function (item, hash) {
        let target = item.resources.find((resMap) => resMap.hash == hash);
        return target ? { resource: target, group: item.resources.slice(target.firstGroupIndex, target.lastGroupIndex + 1) } : null;
    }
    let _generateId = (id) => encodeURIComponent(id.toLowerCase().replaceAll(" ", "-"));
    let _generateGroup = function (group) {
        group.content = [];
        group.id = group.id || _generateId(group.title);
        _groupRoutes.push(new RouteClass(group.id, group));
        return group;
    }
    let _downloadViaAJAX = async function (item) {
        return new Promise((resolve, reject) => {
            let xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4)
                    (this.status == 200 ?
                        resolve(JSON.parse(this.responseText))
                        :
                        reject("Error in AJAX request"))
            };
            xmlhttp.open("GET", APP.itemFolder + item.folder + APP.resourceFolder + APP.itemContentFileName, true);
            xmlhttp.send();
        });
    }
    ViewController.addError(new ErrorClass("item_not_found", "Item don't exist", "We don't have what you're looking for", ["item_outdated", "item_load_error", "group_not_found"]));
    ViewController.addError(new ErrorClass("group_not_found", "Group don't exist", "We don't have what you're looking for", ["item_outdated", "item_load_error"]));
    let _loadFullItem = async function (item) {
        if (!item) {
            ViewController.invokeError("item_not_found");
            return;
        }
        //TODO: check is components.js and components.css are downloaded id not -> download
        if (!item.isItemLinkToWeb && !item.isContentCached) {
            let _content = await _downloadViaAJAX(item, item.folder);
            Object.assign(item, _content, { resources: [] });
            item.resources.push(new ResourceMap({ src: APP.itemContentFileName }, "", 0, 0));
            item.content.forEach((component, componentIndex) => {
                if (component.resource) {
                    component.resIndex = item.resources.length;
                    component.resLastIndex = item.resources.length + component.resource.length - 1;
                    component.resource.forEach(res => {
                        item.resources.push(new ResourceMap(res, createHash(componentIndex + component.resIndex + item.folder + res.src), component.resIndex, component.resLastIndex));
                    })
                }
            });
            item.findResourceByHash = (hash) => _getResourceGroupByHash(item, hash);
            if (_content?.version == APP.version)
                item.isContentCached = true;
            //TODO: check content component version if newer -> download new version of components.css and js
        }
        return item;
    }
    let _defaultGroup;
    let _getGroupByRoute = (id) => _groupRoutes.find((route) => route.source == id)?.target;
    let _getItemByRoute = (id) => _routes.find((route) => route.source == id)?.target;
    _controller.fetchGroups = async function (groups) {
        await Promise.all(groups.map(async (group) => {
            _generateGroup(group);
            _storage.push(group);
            group.aliases.forEach((source) => _groupRoutes.push(new RouteClass(source, group)));
            if (group.isDefault) _defaultGroup = group;
            await _controller.invokeEvent("fetchGroup", [group]);
        }));
        _storage.forEach((group) => group.groups?.forEach((_group) => _getGroupByRoute(_group)?.content.push(group)));
        await _controller.invokeEvent("fetchGroupFinish");
        _groupsLoaded = true;
    }
    _controller.fetchItems = async function (items) {
        await Promise.all(items.map(async (item) => {
            item.id = item.id || _generateId(item.title);
            _routes.push(new RouteClass(item.id, item));
            _defaultGroup.content.push(item);
            item.aliases.forEach((source) => _routes.push(new RouteClass(source, item)));
            item.groups?.forEach((group) => _getGroupByRoute(group)?.content.push(item));
            await _controller.invokeEvent("fetchItem", [item]);
        }));
        await _controller.invokeEvent("fetchItemFinish", []);
        _itemsLoaded = true;
    }
    _controller.loadModes = {
        group: "group",
        item: "item",
        allItems: "allitems",
        all: "all"
    }
    Object.defineProperties(_controller, {
        storage: { get: () => _storage },
        isItemsLoaded: { get: () => _itemsLoaded },
        isGroupsLoaded: { get: () => _groupsLoaded },
        getItemSnapshotById: { value: _getItemByRoute },
        getGroupById: { value: _getGroupByRoute },
        getItemById: { value: async (id) => await _loadFullItem(_getItemByRoute(id)) }
    });
    return _controller;
}());
let ResourceDownloadController = (function () {
    let _controller = {};
    let _downloadedItems = [];
    let _pendingItems = [];
    let _pendingItemsObj = [];
    EventController.call(_controller, {
        "downloadStart": [],
        "download": [],
        "downloadFinish": [],
        "save": [],
        "savePending": [],
        "removeStart": [],
        "remove": [],
        "removeFinish": []
    });
    _controller.isDownloaded = (id) => _downloadedItems.includes(id);
    _controller.load = (items) => _downloadedItems = items;
    _controller.loadPending = async (items) => {
        _pendingItems = items;
        await Promise.all(_pendingItems.map(async (id) => {
            let item = await ItemController.getItemById(id);
            item.isPending = true;
            _pendingItemsObj.push(item);
        }))
    };
    _controller.downloadPending = async function () {
        await Promise.all(_pendingItems.map(async (itemId, index) => {
            if (!_downloadedItems.includes(itemId))
                await _controller.download(_pendingItemsObj[index]);
        }
        ));
        _pendingItems = _pendingItemsObj = [];
        _controller.invokeEvent("savePending", [{}, _pendingItems]);
    }
    _controller.addToPending = (item) => {
        if (!_pendingItems.includes(item.id)) {
            _pendingItems.push(item.id);
            item.isPending = true;
            _pendingItemsObj.push(item);
            _controller.invokeEvent("savePending", [item, _pendingItems]);
        }
    }
    _controller.downloadWhenAvailble = async (item) =>
        navigator.onLine ?
            await _controller.download(item)
            :
            await _controller.addToPending(item)
    _controller.removeFromPending = (item) => {
        if (_pendingItems.includes(item.id)) {
            let _index = _pendingItems.findIndex((id) => id == item.id);
            _pendingItems.splice(_index, 1);
            item.isPending = false;
            _pendingItemsObj.splice(_index, 1);
            _controller.invokeEvent("savePending", [item, _pendingItems]);
        }
    }
    _controller.download = async function (item) {
        item.isDownloading = true;
        _downloadedItems.push(item.id);
        _controller.invokeEvent("downloadStart", [item]);
        await Promise.all(item.resources.map(async (resourceList, index) => await _controller.invokeEvent("download", [item, resourceList.resource.src, index])));
        item.isDownloading = false;
        item.isDownloaded = true;
        item.isPending = false;
        _controller.invokeEvent("downloadFinish", [item]);
        _controller.invokeEvent("save", [item, _downloadedItems]);
    }
    _controller.remove = async function (item) {
        item.isDownloaded = false;
        _downloadedItems.splice(_downloadedItems.findIndex((id) => id == item.id), 1);
        _controller.invokeEvent("removeStart", [item]);
        await Promise.all(item.resources.map(async (resource) => await _controller.invokeEvent("remove", [item, resource.resource.src])));
        _controller.invokeEvent("removeFinish", [item]);
        _controller.invokeEvent("save", [item, _downloadedItems]);
    }
    return _controller;
}());
const landingView = new View(VIEW.landing, APP.url.landing, { scrollY: -1, itemsLoaded: false }, {
    onNavigate: function () {
        if (this.data.scrollY >= 0)
            window.scroll(0, this.data.scrollY)
        document.title = APP.name;
    },
    onRegister: function () {
        let _pButton = getById("profile-link-button");
        _pButton.href = APP.url.profile;
        _pButton.addEventListener("click", () => {
            event.preventDefault();
            ViewController.navigate(VIEW.profile);
        });
        this.data.iList = getById("main-list");
    },
    onNavigateFrom: function () {
        this.data.scrollY = window.scrollY;
        this.rootNode.classList.remove(GLOBAL.error);
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
        this.data.iList.getElementsByClassName(GLOBAL.dataNode + " no-data").remove();
    },
    onLoad: async function () {
        this.rootNode.classList.add(GLOBAL.loading);
        if (ItemController.isItemsLoaded && ItemController.isGroupsLoaded)
            StorageResponseBuilder(await ItemController.getGroupById("landing"), this.data.iList, 1, -1)
    },
    onError: function (err) {
        this.rootNode.classList.add(GLOBAL.error);
        createErrorMsg(err, getById("landing-error-node"));
    }
}, VIEW.landing, true, ViewController.loadingModes.single);
const profileView = new View(VIEW.profile, APP.url.profile, {}, {
    onNavigate: () => { window.scroll(0, 0); document.title = "About me - " + APP.name }
}, VIEW.profile, false, ViewController.loadingModes.never);
const itemView = new View(VIEW.item, APP.url.item, { currentItem: null }, {
    onNavigate: () => window.scroll(0, 0),
    onNavigateFrom: function () {
        this.rootNode.classList.remove(GLOBAL.error);
    },
    onRegister: function () {
        let _data = this.data;
        this.data.iTitle = getById("item-title");
        this.data.iContent = getById("item-content");
        this.data.iInfo = getById("item-info");
        this.data._setIDBState = function (item) {
            if (item.id == _data.currentItem.id) {
                _iDB.classList.remove(GLOBAL.toggled);
                _iDB.classList.remove(GLOBAL.pending);
                _iDB.classList.remove(GLOBAL.progress);
                if (_data.currentItem.isDownloaded)
                    _iDB.classList.add(GLOBAL.toggled);
                else {
                    if (_data.currentItem.isDownloading)
                        _iDB.classList.add(GLOBAL.progress);
                    else
                        if (_data.currentItem.isPending)
                            _iDB.classList.add(GLOBAL.pending);
                }
            }
        }
        let _iDB = getById("item-download-button");
        _iDB.addEventListener("click", () => {
            if (_data.currentItem.isDownloaded)
                ResourceDownloadController.remove(_data.currentItem);
            else {
                _data.currentItem.isPending ?
                    ResourceDownloadController.removeFromPending(_data.currentItem)
                    :
                    ResourceDownloadController.downloadWhenAvailble(_data.currentItem)
            }
        });
        ResourceDownloadController.addEventListener("downloadStart", this.data._setIDBState);
        ResourceDownloadController.addEventListener("downloadFinish", this.data._setIDBState);
        ResourceDownloadController.addEventListener("remove", this.data._setIDBState);
        ResourceDownloadController.addEventListener("savePending", this.data._setIDBState);
    },
    onLoad: async function (arg) {
        this.rootNode.classList.add(GLOBAL.loading);
        if (ItemController.isItemsLoaded) {
            let item = await ItemController.getItemById(arg.routeArg[0]);
            if (item.isItemLinkToWeb) {
                window.open(item.isItemLinkToWeb, '_blank').focus();
                ViewController.navigateToDefaultView();
                return;
            }
            this.data.currentItem = item;
            this.data._setIDBState(item);
            document.title = item.title + " - " + APP.name;
            incrementVisitors(APP.itemFolder + "/" + item.id, true);
            this.data.iTitle.innerHTML = item.title;
            this.data.iInfo.innerHTML = APP.date(item.date.create) + ((item.date.modify) ? " <u class='dotted-separator'></u> Updated " + APP.date(item.date.modify) : "");
            this.data.iContent.innerHTML = "";
            item.content.forEach((content) => this.data.iContent.append(new ItemComponentBuilder(content, item.folder, item)));
        }
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
    },
    onError: function (err) {
        this.rootNode.classList.add(GLOBAL.error);
        createErrorMsg(err, getById("item-error-node"));
    }
}, VIEW.item, true, ViewController.loadingModes.always);
const groupView = new View(VIEW.group, APP.url.group, { scrollY: -1 }, {
    onRegister: function () {
        let _data = this.data;
        _data.groupData = getById("group-data")
        _data.groupList = getById("group-list");
        _data.groupTitle = getById("group-title");
        _data.groupInfo = getById("group-info");
    },
    onNavigate: () => window.scroll(0, 0),
    onNavigateFrom: function () {
        Array.prototype.forEach.call(this.data.groupList.getElementsByClassName(GLOBAL.dataNode), (node) => node.classList.add("loading", "no-data"));
        this.rootNode.classList.remove(GLOBAL.error);
    },
    onLoad: async function (arg) {
        this.rootNode.classList.add(GLOBAL.loading);
        this.data.groupData.classList.add(GLOBAL.loading);
        let group = await ItemController.getGroupById(arg.routeArg[0]);
        if (!group) {
            ViewController.invokeError("group_not_found");
            return;
        }
        this.data.currentGroup = group;
        this.data.groupTitle.innerHTML = group.title;
        document.title = group.title + " - " + APP.name;
        this.data.groupInfo.innerHTML = APP.date(group.date.create) + " <u class='dotted-separator'></u> " + group.content.length + "&nbsp;" + (group.content.length != 1 ? "items" : "item");
        this.data.groupData.classList.remove(GLOBAL.loading);
        await StorageResponseBuilder(group, this.data.groupList, 1, -1);
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
        this.data.groupList.getElementsByClassName("no-data").remove();
    },
    onError: function (err) {
        this.rootNode.classList.add(GLOBAL.error);
        createErrorMsg(err, getById("group-error-node"));
    }
}, VIEW.group, true, ViewController.loadingModes.always);
const resourceView = new View(VIEW.resource, APP.url.resource, {},
    {
        onNavigate: function () {
            document.title = "Gallery - " + APP.name
        },
        onRegister: function () {
            ViewController.addError(new ErrorClass("image_not_found", "Image not found", "Try refresh page", ["item_not_found", "item_outdated", "item_load_error"], true));
            let _sender = this;
            this.data.resSlider = new ResourceSlider();
            let _resList = getById("image-viewer-list");
            let _prevBtn = getById("image-viewer-prev");
            let _nextBtn = getById("image-viewer-next");
            getById("image-viewer-close").addEventListener("click", ViewController.back);
            _nextBtn.addEventListener("click", this.data.resSlider.next);
            _prevBtn.addEventListener("click", this.data.resSlider.previous);
            this.data.resSlider.addEventListener("render", function (res, index, oldres, old) {
                _resList.children[index].classList.add(GLOBAL.activeView);
                _resList.children[old]?.classList.remove(GLOBAL.activeView);
                history.replaceState(history.state, '', "/" + _sender.url + "/" + _sender.data.currentItem.id + "/" + res.hash);
            });
            this.data.resSlider.addEventListener("load", async function (res) {
                await new Promise((resolve, reject) => {
                    let _img = document.createElement("IMG");
                    _img.src = APP.itemFolder + _sender.data.currentItem.folder + APP.resourceFolder + res.resource.src;
                    _resList.appendChild(_img);
                    _img.onload = resolve;
                    _img.onerror = function () {
                        _img.src = "/img/image_error.webp";
                    };
                });
            });
            this.data.resSlider.addEventListener("loadFinish", function (res) {
                _nextBtn.classList.toggle(GLOBAL.disabled, res.length < 2);
                _prevBtn.classList.toggle(GLOBAL.disabled, res.length < 2);
            })
            this.data.resSlider.addEventListener("close", () => _resList.innerHTML = "")
        },
        onLoad: async function (arg) {
            this.rootNode.classList.add(GLOBAL.loading);
            this.data.currentItem = arg.currentItem || await ItemController.getItemById(arg.routeArg[0]);
            let resourceGroup = this.data.currentItem.findResourceByHash(arg.routeArg[1]);
            if (!resourceGroup) {
                ViewController.invokeError("image_not_found", false);
                return;
            }
            await this.data.resSlider.loadResources(resourceGroup.group, resourceGroup.resource);
        },
        onLoadFinish: function () {
            this.rootNode.classList.remove(GLOBAL.loading);
        },
        onNavigateFrom: function () {
            this.rootNode.classList.remove(GLOBAL.error);
            this.data.resSlider.close();
        },
        onError: function (err) {
            this.rootNode.classList.add(GLOBAL.error);
            createErrorMsg(err, getById("resources-error-node"));
        }
    }, VIEW.resource, true, ViewController.loadingModes.always);
ViewController.register(landingView, true);
ViewController.register(profileView);
ViewController.register(itemView);
ViewController.register(groupView);
ViewController.register(resourceView);
ResourceDownloadController.addEventListener("download", async (item, file) => await cacheResource(APP.itemFolder + item.folder + APP.resourceFolder + file));
ResourceDownloadController.addEventListener("remove", async (item, file) => await removeResourceFromCache(APP.itemFolder + item.folder + APP.resourceFolder + file));
ViewController.addEventListener("historyEdit", (historyItem, view) => {
    //url params are getted from navigation controller from navigate() arg
    let _url = "/" + view.url + ((historyItem.arg.routeArg?.length > 0) ? ("/" + (historyItem.arg.routeArg?.join('/') || '')) : "");
    (historyItem.index == 0) ?
        history.replaceState(historyItem, '', _url)
        :
        history.pushState(historyItem, '', _url);
});
ViewController.addEventListener("navigateDefault", () => (history.state.defaultViewIndex != -1 && (history.state.defaultViewIndex - history.state.index) != 0) ? history.go(history.state.defaultViewIndex - history.state.index) : "");
ViewController.addEventListener("navigateToView", (view, lastView) => { view.rootNode.classList.add(GLOBAL.activeView); APPNODE.classList.replace(lastView?.id, view.id) });
ViewController.addEventListener("navigateFromView", (lastView) => lastView.rootNode.classList.remove(GLOBAL.activeView));
ItemController.addEventListener("fetchItem", (item) => item.isDownloaded = ResourceDownloadController.isDownloaded(item.id));
ResourceDownloadController.addEventListener("save", (item, items) => window.localStorage[STORAGE.itemDownload] = JSON.stringify(items));
ResourceDownloadController.addEventListener("savePending", (item, items) => window.localStorage[STORAGE.itemPending] = JSON.stringify(items));
window.addEventListener("load", async function () {
    homeButton.addEventListener("click", () => ViewController.navigateToDefaultView());
    ResourceDownloadController.load(LocalStorageArrayParser(STORAGE.itemDownload));
    ViewController.addError(new ErrorClass("item_load_error", "Items cannot be loaded", "Try refreshing the page"));
    ViewController.addError(new ErrorClass("item_outdated", "Items are outdated", "Try refreshing the page"));
    try {
        if (APP.version != ITEM_VERSION)
            ViewController.invokeError("item_outdated", true);
        else
            await ItemController.fetchGroups(getGroups()).then(() => ItemController.fetchItems(getItems()));
    } catch {
        ViewController.invokeError("item_load_error", true);
    }
    await ViewController.navigate(START_ROUTE.target, { routeArg: START_URL.slice(1, START_URL.length - 1) });
    APPNODE.classList.toggle(GLOBAL.offline, !navigator.onLine);
    await ResourceDownloadController.loadPending(LocalStorageArrayParser(STORAGE.itemPending));
    if (this.navigator.onLine)
        ResourceDownloadController.downloadPending();
    setTimeout(() => document.body.classList.remove("first-start"), 300);
});
window.addEventListener("online", () => {
    APPNODE.classList.remove(GLOBAL.offline);
    ResourceDownloadController.loadPending(LocalStorageArrayParser(STORAGE.itemPending));
    ResourceDownloadController.downloadPending();
});
window.addEventListener("offline", () => APPNODE.classList.add(GLOBAL.offline));
window.addEventListener("popstate", (event) => ViewController.move((ViewController.currentHistoryIndex - event.state.index <= 0), event.state));
let createItemTile = async function (node, item) {
    if (node.nodeName != "A") {
        let oldNode = node;
        node = document.createElement("A");
        oldNode.parentElement.replaceChild(node, oldNode);
    }
    node.className = "item " + GLOBAL.dataNode + " " + GLOBAL.loading;
    node.innerHTML = "<div class='img'><img src='" + APP.itemFolder + item.folder + item.tile.image + "' alt='" + item.title + "'/></div><b class='font-subtitle'>" + item.title + "</b><span class='font-base'>" + item.tile.content + "</span><div class='labels'><div class='button'>" + (item.isItemLinkToWeb ? "Open link <i class='mi mi-OpenInNewWindow'></i>" : "Read more <i class='mi mi-BackMirrored'></i>") + "</div>" + (item.date.modify ? "<div class='label font-caption'><i class='mi mi-Update'></i> &nbsp;&nbsp;" + APP.date(item.date.modify) + "</div>" : "") + "</div>";
    let _iImage = node.children[0].children[0],
        imageLoaded = function () {
            if (!item.isTileImageNotLoaded) {
                if (item.arg.tileImageStyle)
                    _iImage.style = item.arg.tileImageStyle;
                cacheResource(APP.itemFolder + item.folder + item.tile.image);
            }
        }, imageIsNotLoaded = function () {
            item.isTileImageNotLoaded = true;
            _iImage.src = "/img/image_error.webp";
            _iImage.onload = function () { }
        }
    await new Promise((resolve) => {
        _iImage.onload = () => resolve(imageLoaded());
        _iImage.onerror = () => resolve(imageIsNotLoaded());
    });
    node.classList.replace(GLOBAL.loading, GLOBAL.loaded);
    node.onclick = function () {
        event.preventDefault();
        item.isItemLinkToWeb ?
            window.open(item.isItemLinkToWeb, '_blank').focus()
            :
            ViewController.navigate(VIEW.item, { routeArg: [item.id] });
    };
    node.href = item.isItemLinkToWeb || APP.url.item + item.id;
    setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
    return node;
}
let createGroupTile = function (node, group) {
    node.className = "group " + GLOBAL.dataNode;
    node.innerHTML = "<span class='font-title'></span><a class='button'><i class='mi mi-ShowAll'></i> <span>Show all</span></a>";
    node.children[0].innerHTML = group.title;
    node.children[1].onclick = function () {
        event.preventDefault();
        ViewController.navigate(VIEW.group, { routeArg: [group.id] });
    };
    node.children[1].href = APP.url.group + group.id;
    return node;
}
//universal slider class for resourceMap objects
let ResourceSlider = function () {
    let _res = [];
    let _currentIndex;
    let _oldIndex;
    EventController.call(this,
        {
            "load": [],
            "loadFinish": [],
            "next": [],
            "previous": [],
            "render": [],
            "remove": [],
            "close": [],
        });
    let _sender = this;
    let _renderIndex = async function (index) {
        _oldIndex = _currentIndex;
        _currentIndex = index;
        await _sender.invokeEvent("render", [_res[_currentIndex], _currentIndex, _res[_oldIndex], _oldIndex]);
    }
    this.loadResources = async function (resourcesList, current) {
        _res = resourcesList;
        await Promise.all(_res.map(async (res, index) => await _sender.invokeEvent("load", [res, index])));
        if (current) {
            _currentIndex = _res.findIndex((res) => res == current);
            await this.invokeEvent("render", [current, _currentIndex, null, _oldIndex]);
        } else
            _renderIndex(0);
        await this.invokeEvent("loadFinish", [_res]);
    }
    this.close = async () => { _oldIndex = -1; _currentIndex = -1; await _sender.invokeEvent("close", [_res[_currentIndex], _currentIndex]) };
    this.next = async function () {
        let _index = _currentIndex + 1;
        if (_index >= _res.length)
            _index = 0;
        await _renderIndex(_index);
        await _sender.invokeEvent("next", [_res[_currentIndex], _index])
    }
    this.previous = async function () {
        let _index = _currentIndex - 1;
        if (_index < 0)
            _index = _res.length - 1;
        await _renderIndex(_index);
        await _sender.invokeEvent("previous", [_res[_currentIndex], _index])
    }
}
let StorageResponseIndexer = function (response, depth = 1, limit = 3, startIndex = 0, limitOfDepth = 3) {
    let _indexedItems = [];
    response.content?.forEach((entry, index) => {
        if (entry.type == GLOBAL.group) {
            if (depth > 0) {
                _indexedItems.push({ index: startIndex, entry: entry });
                _indexedItems = _indexedItems.concat(StorageResponseIndexer(entry, depth - 1, limitOfDepth, startIndex + 1));
                startIndex = _indexedItems[_indexedItems.length - 1].index + 1;
            }
        } else {
            if (((limit > 0) && (!entry.isIndexed || (response.content.length - index) <= limit)) || limit == -1) {
                entry.isIndexed = true;
                _indexedItems.push({ index: startIndex, entry: entry });
                if (limit > 0)
                    limit -= 1;
                startIndex += 1;
            }
        }
    });
    return _indexedItems;
}
let StorageResponseBuilder = async function (response, targetNode = document.createElement("DIV"), depth = 1, limit = 3) {
    let _items = [...targetNode.getElementsByClassName(GLOBAL.dataNode)];
    let _indexedItems = StorageResponseIndexer(response, depth, limit, 0);
    await Promise.all(_indexedItems.map(async (entry) => {
        entry.entry.isIndexed = false;
        entry.entry.type == GLOBAL.group ?
            await createGroupTile(_items[entry.index] || targetNode.appendChild(document.createElement("div")), entry.entry)
            :
            await createItemTile(_items[entry.index] || targetNode.appendChild(document.createElement("a")), entry.entry);
    }));
}
let LocalStorageArrayParser = (name, _default = []) => window.localStorage[name] ? JSON.parse(window.localStorage[name]) : _default;
let createErrorMsg = function (err, node) {
    node.innerHTML = `<i class='mi mi-Error font-header'></i><div class='font-title'>` + err.title + `</div><span class='font-base'>` + err.message + `</span>`;
    if (err.refreshRequire) {
        let _but = document.createElement("A");
        _but.classList.add("button")
        _but.innerHTML = "<i class='mi mi-Refresh'></i><span>Refresh page</span>";
        _but.addEventListener("click", () => window.location.reload(true));
        node.appendChild(_but);
    }
}
//Item component builder for basic item content controls and sections
let ItemComponentBuilder = function (component, itemFolder, item) {
    let _type = component.type;
    let _arg = component.arguments || {};
    let _component
    switch (_type) {
        case "section":
            _component = document.createElement("DIV");
            _component.classList.add("section");
            if (!_arg.noTitle) {
                let _title = document.createElement("DIV");
                _title.className = "section-title font-subtitle";
                _title.innerText = component.title;
                _component.append(_title);
            }
            _component.append(component.content);
            break;
        case "image":
            _component = document.createElement("DIV");
            _component.classList.add("image");
            let _img = document.createElement("IMG");
            _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + component.resource[0].src;
            let _alt = document.createElement("SPAN");
            _alt.className = "img-alt";
            _alt.innerHTML = component.alt || "";
            _component.appendChild(_img);
            _component.appendChild(_alt);
            _img.onerror = function () { _img.onload = function () { }; _img.src = "/img/image_error.webp"; _img.classList.add("no-image"); }
            _img.onclick = function () {
                ViewController.navigate(VIEW.resource, { routeArg: [item.id, item.resources[component.resIndex].hash], currentItem: item })
            }
            // _img.onload = function () { };
            break;
        case "quote":
            _component = document.createElement("DIV");
            let _quoteText = document.createElement("DIV");
            let _quoteAuthor = document.createElement("SPAN");
            _component.className = "quote";
            _quoteText.className = "font-header";
            _quoteAuthor.className = "font-base";
            _quoteText.innerHTML = component.content;
            _quoteAuthor.innerHTML = component.author;
            _component.appendChild(_quoteText);
            _component.appendChild(_quoteAuthor);
            break;
        case "text":
            _component = document.createElement("DIV");
            _component.innerHTML = component.content;
            break;
        case "multi-section":
            _component = document.createElement("DIV");
            _component.classList.add("section");
            if (!_arg.noTitle) {
                let _title = document.createElement("DIV");
                _title.className = "section-title font-subtitle";
                _title.innerText = title;
                _component.append(_title);
            }
            _component.forEach((content) => _component.append(new ItemComponentBuilder(content, itemFolder)))
            break;
        case "gallery":
            _component = document.createElement("DIV");
            _component.classList.add("gallery");
            _component.innerHTML = "<div><b class='font-subtitle'>" + component.title + "</b></div><div class='list'></div>";
            let _button = document.createElement("A");
            _button.innerHTML = "<i class='mi mi-Picture'></i><span>Show all</span>";
            _button.classList.add("button");
            _button.onclick = function () {
                ViewController.navigate(VIEW.resource, {
                    routeArg: [item.id, item.resources[component.resIndex].hash],
                    currentItem: item,
                })
            }
            _component.children[0].appendChild(_button);
            let _max = component.resource.length > 5 ? 5 : component.resource.length;
            for (let i = 0; i < _max; i++) {
                let res = component.resource[i];
                let _img = document.createElement("IMG");
                _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + res.src;
                _component.children[1].appendChild(_img);
                _img.onclick = function () {
                    ViewController.navigate(VIEW.resource, {
                        routeArg: [item.id, item.resources[component.resIndex + i].hash],
                        currentItem: item,
                    })
                }
            };
            break;
        default:
            _component = document.createElement("DIV");
    }
    return _component
}