if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const backendDomain = "https://b.havedreams.top/";
  const config = {
    domain: "http://192.168.29.169/no1club/public/",
    voiceOver: "http://192.168.29.169/no1club/public/static/voice-over.jpg",
    defaultImg: "http://192.168.29.169/no1club/public/static/default.png"
  };
  const config$1 = {
    config,
    backendDomain
  };
  const user = {
    namespaced: true,
    state: {
      userId: 0,
      userName: "",
      userKey: "",
      token: "",
      isLogin: false,
      userAvatar: "",
      aimId: 0,
      userGroup: 1,
      groupExpiration: "",
      latestVersion: "",
      screen: "",
      //设备尺寸，用于背景图计算裁切长宽比
      darkMode: "light",
      powerLevel: 0,
      //用于限制提交本地崽的等级，非后台用户等级
      totalReward: 0,
      hasNewMsg: false,
      lastTimestampAd: 0,
      lastTimestampAccount: 0,
      lastTimestampSubmit: {},
      settingOpen: { global: true, bubble: true },
      ip: "",
      ippos: ""
    },
    getters: {},
    mutations: {
      setUserData: function(state, { key, data }) {
        state[key] = data;
        uni.setStorageSync("userInfo", state);
      },
      getUserData: function(state) {
        let data = uni.getStorageSync("userInfo");
        for (let key in state) {
          if (data[key] != void 0)
            state[key] = data[key];
        }
      }
    },
    actions: {}
  };
  const dialogue = {
    namespaced: true,
    state: {
      me: "你",
      entityId: 1,
      crtCharacterId: 0,
      //仅用于交互，不用来显示
      introduction: "",
      title: "",
      ai: 0,
      //模型的后台序号
      entityMode: "novel",
      //novel chat
      chatlist: [],
      //用于API传输的数据，只在character-part处更新， 删除时也要删
      chat65tlist: [],
      //群聊专用数据
      characterlist: {},
      //角色
      historylist: [],
      //对话
      options: [],
      //备选项
      messageTime: "",
      //时间戳
      prevMessageTime: "0",
      //上一个时间戳
      optionFlag: false,
      //用于optionFirst的刷新，及“消息提示”显示
      optionFirst: "",
      //最后一条记录
      editMode: false,
      //弹出编辑模块后，是否显示编辑框，只在3处更改状态
      openEdit: false,
      //是否弹出编辑模块
      blankMode: false,
      //是否纯手写模式
      editContent: {},
      //编辑的内容,{entityId: txt,}
      resetFlag: false,
      //是否编辑框初始化
      refreshList: false,
      //刷新chat列表
      breakpointMessageId: 0,
      //用于记录下拉加载的断点
      entityImage: "",
      bubbleOpacity: 1,
      //气泡透明度
      bgOpacity: false,
      //false 适用于滚动截屏
      cDisplayId: 0,
      //crtCharaterId 仅用户list展示时
      fontSize: 14,
      fontColor: ["rgb(52,52,52)", "rgb(52,52,52)"],
      bubbleColor: ["rgba(204,204,204, {{bubbleOpacity}})", "rgba(204,204,204,{{bubbleOpacity}})"],
      bubbleAlign: true,
      imgWidth: 40,
      imgRadius: 20,
      chatPattern: 1,
      chatHtml: '<div class="chat-bubble {{side}}">{{text}}</div>',
      chatCss: "<style>.chat-line .chat-bubble{background-color: {{bg-color1}};	padding: 10px 15px;	line-height: 1.5;	border-radius: 5px;}</style>",
      chatFgCss: ""
    },
    getters: {},
    mutations: {
      setDiaData: function(state, { key, data }) {
        state[key] = data;
        uni.setStorageSync("chatData", state);
      },
      getDiaData: function(state) {
        let data = uni.getStorageSync("chatData");
        for (let key in state) {
          if (data[key] != void 0)
            state[key] = data[key];
        }
      }
    },
    actions: {}
  };
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = { ...defaultSettings };
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        }
      };
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && pluginDescriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(pluginDescriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * vuex v4.1.0
   * (c) 2022 Evan You
   * @license MIT
   */
  var storeKey = "store";
  function forEachValue(obj, fn) {
    Object.keys(obj).forEach(function(key) {
      return fn(obj[key], key);
    });
  }
  function isObject(obj) {
    return obj !== null && typeof obj === "object";
  }
  function isPromise(val) {
    return val && typeof val.then === "function";
  }
  function assert(condition, msg) {
    if (!condition) {
      throw new Error("[vuex] " + msg);
    }
  }
  function partial(fn, arg) {
    return function() {
      return fn(arg);
    };
  }
  function genericSubscribe(fn, subs, options) {
    if (subs.indexOf(fn) < 0) {
      options && options.prepend ? subs.unshift(fn) : subs.push(fn);
    }
    return function() {
      var i = subs.indexOf(fn);
      if (i > -1) {
        subs.splice(i, 1);
      }
    };
  }
  function resetStore(store2, hot) {
    store2._actions = /* @__PURE__ */ Object.create(null);
    store2._mutations = /* @__PURE__ */ Object.create(null);
    store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
    store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    var state = store2.state;
    installModule(store2, state, [], store2._modules.root, true);
    resetStoreState(store2, state, hot);
  }
  function resetStoreState(store2, state, hot) {
    var oldState = store2._state;
    var oldScope = store2._scope;
    store2.getters = {};
    store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    var wrappedGetters = store2._wrappedGetters;
    var computedObj = {};
    var computedCache = {};
    var scope = vue.effectScope(true);
    scope.run(function() {
      forEachValue(wrappedGetters, function(fn, key) {
        computedObj[key] = partial(fn, store2);
        computedCache[key] = vue.computed(function() {
          return computedObj[key]();
        });
        Object.defineProperty(store2.getters, key, {
          get: function() {
            return computedCache[key].value;
          },
          enumerable: true
          // for local getters
        });
      });
    });
    store2._state = vue.reactive({
      data: state
    });
    store2._scope = scope;
    if (store2.strict) {
      enableStrictMode(store2);
    }
    if (oldState) {
      if (hot) {
        store2._withCommit(function() {
          oldState.data = null;
        });
      }
    }
    if (oldScope) {
      oldScope.stop();
    }
  }
  function installModule(store2, rootState, path, module, hot) {
    var isRoot = !path.length;
    var namespace = store2._modules.getNamespace(path);
    if (module.namespaced) {
      if (store2._modulesNamespaceMap[namespace] && true) {
        console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
      }
      store2._modulesNamespaceMap[namespace] = module;
    }
    if (!isRoot && !hot) {
      var parentState = getNestedState(rootState, path.slice(0, -1));
      var moduleName = path[path.length - 1];
      store2._withCommit(function() {
        {
          if (moduleName in parentState) {
            console.warn(
              '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join(".") + '"'
            );
          }
        }
        parentState[moduleName] = module.state;
      });
    }
    var local = module.context = makeLocalContext(store2, namespace, path);
    module.forEachMutation(function(mutation, key) {
      var namespacedType = namespace + key;
      registerMutation(store2, namespacedType, mutation, local);
    });
    module.forEachAction(function(action, key) {
      var type = action.root ? key : namespace + key;
      var handler = action.handler || action;
      registerAction(store2, type, handler, local);
    });
    module.forEachGetter(function(getter, key) {
      var namespacedType = namespace + key;
      registerGetter(store2, namespacedType, getter, local);
    });
    module.forEachChild(function(child, key) {
      installModule(store2, rootState, path.concat(key), child, hot);
    });
  }
  function makeLocalContext(store2, namespace, path) {
    var noNamespace = namespace === "";
    var local = {
      dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._actions[type]) {
            console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
            return;
          }
        }
        return store2.dispatch(type, payload);
      },
      commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._mutations[type]) {
            console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
            return;
          }
        }
        store2.commit(type, payload, options);
      }
    };
    Object.defineProperties(local, {
      getters: {
        get: noNamespace ? function() {
          return store2.getters;
        } : function() {
          return makeLocalGetters(store2, namespace);
        }
      },
      state: {
        get: function() {
          return getNestedState(store2.state, path);
        }
      }
    });
    return local;
  }
  function makeLocalGetters(store2, namespace) {
    if (!store2._makeLocalGettersCache[namespace]) {
      var gettersProxy = {};
      var splitPos = namespace.length;
      Object.keys(store2.getters).forEach(function(type) {
        if (type.slice(0, splitPos) !== namespace) {
          return;
        }
        var localType = type.slice(splitPos);
        Object.defineProperty(gettersProxy, localType, {
          get: function() {
            return store2.getters[type];
          },
          enumerable: true
        });
      });
      store2._makeLocalGettersCache[namespace] = gettersProxy;
    }
    return store2._makeLocalGettersCache[namespace];
  }
  function registerMutation(store2, type, handler, local) {
    var entry = store2._mutations[type] || (store2._mutations[type] = []);
    entry.push(function wrappedMutationHandler(payload) {
      handler.call(store2, local.state, payload);
    });
  }
  function registerAction(store2, type, handler, local) {
    var entry = store2._actions[type] || (store2._actions[type] = []);
    entry.push(function wrappedActionHandler(payload) {
      var res = handler.call(store2, {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store2.getters,
        rootState: store2.state
      }, payload);
      if (!isPromise(res)) {
        res = Promise.resolve(res);
      }
      if (store2._devtoolHook) {
        return res.catch(function(err) {
          store2._devtoolHook.emit("vuex:error", err);
          throw err;
        });
      } else {
        return res;
      }
    });
  }
  function registerGetter(store2, type, rawGetter, local) {
    if (store2._wrappedGetters[type]) {
      {
        console.error("[vuex] duplicate getter key: " + type);
      }
      return;
    }
    store2._wrappedGetters[type] = function wrappedGetter(store22) {
      return rawGetter(
        local.state,
        // local state
        local.getters,
        // local getters
        store22.state,
        // root state
        store22.getters
        // root getters
      );
    };
  }
  function enableStrictMode(store2) {
    vue.watch(function() {
      return store2._state.data;
    }, function() {
      {
        assert(store2._committing, "do not mutate vuex store state outside mutation handlers.");
      }
    }, { deep: true, flush: "sync" });
  }
  function getNestedState(state, path) {
    return path.reduce(function(state2, key) {
      return state2[key];
    }, state);
  }
  function unifyObjectStyle(type, payload, options) {
    if (isObject(type) && type.type) {
      options = payload;
      payload = type;
      type = type.type;
    }
    {
      assert(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
    }
    return { type, payload, options };
  }
  var LABEL_VUEX_BINDINGS = "vuex bindings";
  var MUTATIONS_LAYER_ID = "vuex:mutations";
  var ACTIONS_LAYER_ID = "vuex:actions";
  var INSPECTOR_ID = "vuex";
  var actionId = 0;
  function addDevtools(app, store2) {
    setupDevtoolsPlugin(
      {
        id: "org.vuejs.vuex",
        app,
        label: "Vuex",
        homepage: "https://next.vuex.vuejs.org/",
        logo: "https://vuejs.org/images/icons/favicon-96x96.png",
        packageName: "vuex",
        componentStateTypes: [LABEL_VUEX_BINDINGS]
      },
      function(api) {
        api.addTimelineLayer({
          id: MUTATIONS_LAYER_ID,
          label: "Vuex Mutations",
          color: COLOR_LIME_500
        });
        api.addTimelineLayer({
          id: ACTIONS_LAYER_ID,
          label: "Vuex Actions",
          color: COLOR_LIME_500
        });
        api.addInspector({
          id: INSPECTOR_ID,
          label: "Vuex",
          icon: "storage",
          treeFilterPlaceholder: "Filter stores..."
        });
        api.on.getInspectorTree(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            if (payload.filter) {
              var nodes = [];
              flattenStoreForInspectorTree(nodes, store2._modules.root, payload.filter, "");
              payload.rootNodes = nodes;
            } else {
              payload.rootNodes = [
                formatStoreForInspectorTree(store2._modules.root, "")
              ];
            }
          }
        });
        api.on.getInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            var modulePath = payload.nodeId;
            makeLocalGetters(store2, modulePath);
            payload.state = formatStoreForInspectorState(
              getStoreModule(store2._modules, modulePath),
              modulePath === "root" ? store2.getters : store2._makeLocalGettersCache,
              modulePath
            );
          }
        });
        api.on.editInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            var modulePath = payload.nodeId;
            var path = payload.path;
            if (modulePath !== "root") {
              path = modulePath.split("/").filter(Boolean).concat(path);
            }
            store2._withCommit(function() {
              payload.set(store2._state.data, path, payload.state.value);
            });
          }
        });
        store2.subscribe(function(mutation, state) {
          var data = {};
          if (mutation.payload) {
            data.payload = mutation.payload;
          }
          data.state = state;
          api.notifyComponentUpdate();
          api.sendInspectorTree(INSPECTOR_ID);
          api.sendInspectorState(INSPECTOR_ID);
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: Date.now(),
              title: mutation.type,
              data
            }
          });
        });
        store2.subscribeAction({
          before: function(action, state) {
            var data = {};
            if (action.payload) {
              data.payload = action.payload;
            }
            action._id = actionId++;
            action._time = Date.now();
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: action._time,
                title: action.type,
                groupId: action._id,
                subtitle: "start",
                data
              }
            });
          },
          after: function(action, state) {
            var data = {};
            var duration = Date.now() - action._time;
            data.duration = {
              _custom: {
                type: "duration",
                display: duration + "ms",
                tooltip: "Action duration",
                value: duration
              }
            };
            if (action.payload) {
              data.payload = action.payload;
            }
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: Date.now(),
                title: action.type,
                groupId: action._id,
                subtitle: "end",
                data
              }
            });
          }
        });
      }
    );
  }
  var COLOR_LIME_500 = 8702998;
  var COLOR_DARK = 6710886;
  var COLOR_WHITE = 16777215;
  var TAG_NAMESPACED = {
    label: "namespaced",
    textColor: COLOR_WHITE,
    backgroundColor: COLOR_DARK
  };
  function extractNameFromPath(path) {
    return path && path !== "root" ? path.split("/").slice(-2, -1)[0] : "Root";
  }
  function formatStoreForInspectorTree(module, path) {
    return {
      id: path || "root",
      // all modules end with a `/`, we want the last segment only
      // cart/ -> cart
      // nested/cart/ -> cart
      label: extractNameFromPath(path),
      tags: module.namespaced ? [TAG_NAMESPACED] : [],
      children: Object.keys(module._children).map(
        function(moduleName) {
          return formatStoreForInspectorTree(
            module._children[moduleName],
            path + moduleName + "/"
          );
        }
      )
    };
  }
  function flattenStoreForInspectorTree(result, module, filter, path) {
    if (path.includes(filter)) {
      result.push({
        id: path || "root",
        label: path.endsWith("/") ? path.slice(0, path.length - 1) : path || "Root",
        tags: module.namespaced ? [TAG_NAMESPACED] : []
      });
    }
    Object.keys(module._children).forEach(function(moduleName) {
      flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + "/");
    });
  }
  function formatStoreForInspectorState(module, getters, path) {
    getters = path === "root" ? getters : getters[path];
    var gettersKeys = Object.keys(getters);
    var storeState = {
      state: Object.keys(module.state).map(function(key) {
        return {
          key,
          editable: true,
          value: module.state[key]
        };
      })
    };
    if (gettersKeys.length) {
      var tree = transformPathsToObjectTree(getters);
      storeState.getters = Object.keys(tree).map(function(key) {
        return {
          key: key.endsWith("/") ? extractNameFromPath(key) : key,
          editable: false,
          value: canThrow(function() {
            return tree[key];
          })
        };
      });
    }
    return storeState;
  }
  function transformPathsToObjectTree(getters) {
    var result = {};
    Object.keys(getters).forEach(function(key) {
      var path = key.split("/");
      if (path.length > 1) {
        var target = result;
        var leafKey = path.pop();
        path.forEach(function(p) {
          if (!target[p]) {
            target[p] = {
              _custom: {
                value: {},
                display: p,
                tooltip: "Module",
                abstract: true
              }
            };
          }
          target = target[p]._custom.value;
        });
        target[leafKey] = canThrow(function() {
          return getters[key];
        });
      } else {
        result[key] = canThrow(function() {
          return getters[key];
        });
      }
    });
    return result;
  }
  function getStoreModule(moduleMap, path) {
    var names = path.split("/").filter(function(n) {
      return n;
    });
    return names.reduce(
      function(module, moduleName, i) {
        var child = module[moduleName];
        if (!child) {
          throw new Error('Missing module "' + moduleName + '" for path "' + path + '".');
        }
        return i === names.length - 1 ? child : child._children;
      },
      path === "root" ? moduleMap : moduleMap.root._children
    );
  }
  function canThrow(cb) {
    try {
      return cb();
    } catch (e) {
      return e;
    }
  }
  var Module = function Module2(rawModule, runtime) {
    this.runtime = runtime;
    this._children = /* @__PURE__ */ Object.create(null);
    this._rawModule = rawModule;
    var rawState = rawModule.state;
    this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
  };
  var prototypeAccessors$1 = { namespaced: { configurable: true } };
  prototypeAccessors$1.namespaced.get = function() {
    return !!this._rawModule.namespaced;
  };
  Module.prototype.addChild = function addChild(key, module) {
    this._children[key] = module;
  };
  Module.prototype.removeChild = function removeChild(key) {
    delete this._children[key];
  };
  Module.prototype.getChild = function getChild(key) {
    return this._children[key];
  };
  Module.prototype.hasChild = function hasChild(key) {
    return key in this._children;
  };
  Module.prototype.update = function update(rawModule) {
    this._rawModule.namespaced = rawModule.namespaced;
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions;
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations;
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters;
    }
  };
  Module.prototype.forEachChild = function forEachChild(fn) {
    forEachValue(this._children, fn);
  };
  Module.prototype.forEachGetter = function forEachGetter(fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  };
  Module.prototype.forEachAction = function forEachAction(fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  };
  Module.prototype.forEachMutation = function forEachMutation(fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  };
  Object.defineProperties(Module.prototype, prototypeAccessors$1);
  var ModuleCollection = function ModuleCollection2(rawRootModule) {
    this.register([], rawRootModule, false);
  };
  ModuleCollection.prototype.get = function get(path) {
    return path.reduce(function(module, key) {
      return module.getChild(key);
    }, this.root);
  };
  ModuleCollection.prototype.getNamespace = function getNamespace(path) {
    var module = this.root;
    return path.reduce(function(namespace, key) {
      module = module.getChild(key);
      return namespace + (module.namespaced ? key + "/" : "");
    }, "");
  };
  ModuleCollection.prototype.update = function update$1(rawRootModule) {
    update2([], this.root, rawRootModule);
  };
  ModuleCollection.prototype.register = function register2(path, rawModule, runtime) {
    var this$1$1 = this;
    if (runtime === void 0)
      runtime = true;
    {
      assertRawModule(path, rawModule);
    }
    var newModule = new Module(rawModule, runtime);
    if (path.length === 0) {
      this.root = newModule;
    } else {
      var parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rawModule.modules) {
      forEachValue(rawModule.modules, function(rawChildModule, key) {
        this$1$1.register(path.concat(key), rawChildModule, runtime);
      });
    }
  };
  ModuleCollection.prototype.unregister = function unregister(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    var child = parent.getChild(key);
    if (!child) {
      {
        console.warn(
          "[vuex] trying to unregister module '" + key + "', which is not registered"
        );
      }
      return;
    }
    if (!child.runtime) {
      return;
    }
    parent.removeChild(key);
  };
  ModuleCollection.prototype.isRegistered = function isRegistered(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    if (parent) {
      return parent.hasChild(key);
    }
    return false;
  };
  function update2(path, targetModule, newModule) {
    {
      assertRawModule(path, newModule);
    }
    targetModule.update(newModule);
    if (newModule.modules) {
      for (var key in newModule.modules) {
        if (!targetModule.getChild(key)) {
          {
            console.warn(
              "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
            );
          }
          return;
        }
        update2(
          path.concat(key),
          targetModule.getChild(key),
          newModule.modules[key]
        );
      }
    }
  }
  var functionAssert = {
    assert: function(value) {
      return typeof value === "function";
    },
    expected: "function"
  };
  var objectAssert = {
    assert: function(value) {
      return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
    },
    expected: 'function or object with "handler" function'
  };
  var assertTypes = {
    getters: functionAssert,
    mutations: functionAssert,
    actions: objectAssert
  };
  function assertRawModule(path, rawModule) {
    Object.keys(assertTypes).forEach(function(key) {
      if (!rawModule[key]) {
        return;
      }
      var assertOptions = assertTypes[key];
      forEachValue(rawModule[key], function(value, type) {
        assert(
          assertOptions.assert(value),
          makeAssertionMessage(path, key, type, value, assertOptions.expected)
        );
      });
    });
  }
  function makeAssertionMessage(path, key, type, value, expected) {
    var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
    if (path.length > 0) {
      buf += ' in module "' + path.join(".") + '"';
    }
    buf += " is " + JSON.stringify(value) + ".";
    return buf;
  }
  function createStore(options) {
    return new Store(options);
  }
  var Store = function Store2(options) {
    var this$1$1 = this;
    if (options === void 0)
      options = {};
    {
      assert(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
      assert(this instanceof Store2, "store must be called with the new operator.");
    }
    var plugins = options.plugins;
    if (plugins === void 0)
      plugins = [];
    var strict = options.strict;
    if (strict === void 0)
      strict = false;
    var devtools = options.devtools;
    this._committing = false;
    this._actions = /* @__PURE__ */ Object.create(null);
    this._actionSubscribers = [];
    this._mutations = /* @__PURE__ */ Object.create(null);
    this._wrappedGetters = /* @__PURE__ */ Object.create(null);
    this._modules = new ModuleCollection(options);
    this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    this._subscribers = [];
    this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    this._scope = null;
    this._devtools = devtools;
    var store2 = this;
    var ref = this;
    var dispatch2 = ref.dispatch;
    var commit2 = ref.commit;
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch2.call(store2, type, payload);
    };
    this.commit = function boundCommit(type, payload, options2) {
      return commit2.call(store2, type, payload, options2);
    };
    this.strict = strict;
    var state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    resetStoreState(this, state);
    plugins.forEach(function(plugin) {
      return plugin(this$1$1);
    });
  };
  var prototypeAccessors = { state: { configurable: true } };
  Store.prototype.install = function install(app, injectKey) {
    app.provide(injectKey || storeKey, this);
    app.config.globalProperties.$store = this;
    var useDevtools = this._devtools !== void 0 ? this._devtools : true;
    if (useDevtools) {
      addDevtools(app, this);
    }
  };
  prototypeAccessors.state.get = function() {
    return this._state.data;
  };
  prototypeAccessors.state.set = function(v) {
    {
      assert(false, "use store.replaceState() to explicit replace store state.");
    }
  };
  Store.prototype.commit = function commit(_type, _payload, _options) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;
    var mutation = { type, payload };
    var entry = this._mutations[type];
    if (!entry) {
      {
        console.error("[vuex] unknown mutation type: " + type);
      }
      return;
    }
    this._withCommit(function() {
      entry.forEach(function commitIterator(handler) {
        handler(payload);
      });
    });
    this._subscribers.slice().forEach(function(sub) {
      return sub(mutation, this$1$1.state);
    });
    if (options && options.silent) {
      console.warn(
        "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
      );
    }
  };
  Store.prototype.dispatch = function dispatch(_type, _payload) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;
    var action = { type, payload };
    var entry = this._actions[type];
    if (!entry) {
      {
        console.error("[vuex] unknown action type: " + type);
      }
      return;
    }
    try {
      this._actionSubscribers.slice().filter(function(sub) {
        return sub.before;
      }).forEach(function(sub) {
        return sub.before(action, this$1$1.state);
      });
    } catch (e) {
      {
        console.warn("[vuex] error in before action subscribers: ");
        console.error(e);
      }
    }
    var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
      return handler(payload);
    })) : entry[0](payload);
    return new Promise(function(resolve, reject) {
      result.then(function(res) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.after;
          }).forEach(function(sub) {
            return sub.after(action, this$1$1.state);
          });
        } catch (e) {
          {
            console.warn("[vuex] error in after action subscribers: ");
            console.error(e);
          }
        }
        resolve(res);
      }, function(error) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.error;
          }).forEach(function(sub) {
            return sub.error(action, this$1$1.state, error);
          });
        } catch (e) {
          {
            console.warn("[vuex] error in error action subscribers: ");
            console.error(e);
          }
        }
        reject(error);
      });
    });
  };
  Store.prototype.subscribe = function subscribe(fn, options) {
    return genericSubscribe(fn, this._subscribers, options);
  };
  Store.prototype.subscribeAction = function subscribeAction(fn, options) {
    var subs = typeof fn === "function" ? { before: fn } : fn;
    return genericSubscribe(subs, this._actionSubscribers, options);
  };
  Store.prototype.watch = function watch$1(getter, cb, options) {
    var this$1$1 = this;
    {
      assert(typeof getter === "function", "store.watch only accepts a function.");
    }
    return vue.watch(function() {
      return getter(this$1$1.state, this$1$1.getters);
    }, cb, Object.assign({}, options));
  };
  Store.prototype.replaceState = function replaceState(state) {
    var this$1$1 = this;
    this._withCommit(function() {
      this$1$1._state.data = state;
    });
  };
  Store.prototype.registerModule = function registerModule(path, rawModule, options) {
    if (options === void 0)
      options = {};
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
      assert(path.length > 0, "cannot register the root module by using registerModule.");
    }
    this._modules.register(path, rawModule);
    installModule(this, this.state, path, this._modules.get(path), options.preserveState);
    resetStoreState(this, this.state);
  };
  Store.prototype.unregisterModule = function unregisterModule(path) {
    var this$1$1 = this;
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    this._modules.unregister(path);
    this._withCommit(function() {
      var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
      delete parentState[path[path.length - 1]];
    });
    resetStore(this);
  };
  Store.prototype.hasModule = function hasModule(path) {
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    return this._modules.isRegistered(path);
  };
  Store.prototype.hotUpdate = function hotUpdate(newOptions) {
    this._modules.update(newOptions);
    resetStore(this, true);
  };
  Store.prototype._withCommit = function _withCommit(fn) {
    var committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  };
  Object.defineProperties(Store.prototype, prototypeAccessors);
  var mapState = normalizeNamespace(function(namespace, states) {
    var res = {};
    if (!isValidMap(states)) {
      console.error("[vuex] mapState: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(states).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res[key] = function mappedState() {
        var state = this.$store.state;
        var getters = this.$store.getters;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapState", namespace);
          if (!module) {
            return;
          }
          state = module.context.state;
          getters = module.context.getters;
        }
        return typeof val === "function" ? val.call(this, state, getters) : state[val];
      };
      res[key].vuex = true;
    });
    return res;
  });
  var mapMutations = normalizeNamespace(function(namespace, mutations) {
    var res = {};
    if (!isValidMap(mutations)) {
      console.error("[vuex] mapMutations: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(mutations).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res[key] = function mappedMutation() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var commit2 = this.$store.commit;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapMutations", namespace);
          if (!module) {
            return;
          }
          commit2 = module.context.commit;
        }
        return typeof val === "function" ? val.apply(this, [commit2].concat(args)) : commit2.apply(this.$store, [val].concat(args));
      };
    });
    return res;
  });
  function normalizeMap(map) {
    if (!isValidMap(map)) {
      return [];
    }
    return Array.isArray(map) ? map.map(function(key) {
      return { key, val: key };
    }) : Object.keys(map).map(function(key) {
      return { key, val: map[key] };
    });
  }
  function isValidMap(map) {
    return Array.isArray(map) || isObject(map);
  }
  function normalizeNamespace(fn) {
    return function(namespace, map) {
      if (typeof namespace !== "string") {
        map = namespace;
        namespace = "";
      } else if (namespace.charAt(namespace.length - 1) !== "/") {
        namespace += "/";
      }
      return fn(namespace, map);
    };
  }
  function getModuleByNamespace(store2, helper, namespace) {
    var module = store2._modulesNamespaceMap[namespace];
    if (!module) {
      console.error("[vuex] module namespace not found in " + helper + "(): " + namespace);
    }
    return module;
  }
  const store = createStore({
    modules: {
      user,
      dialogue
    },
    state: {},
    mutations: {
      /*setData(state, {key, data}) {
      	state[key] = data;
      }*/
    },
    getters: {},
    actions: {}
  });
  const common$1 = {
    getCurrentTimeStampStr() {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${second}`;
    }
  };
  const sqlite = {
    // 打开数据库
    openDB() {
      if (!this.isOpenDB()) {
        plus.sqlite.openDatabase({
          name: "localdb",
          path: "_doc/localdb.db",
          success: function() {
          },
          fail: function(e) {
            formatAppLog("log", "at func/common/sqlite.js:17", "openDatabase failed: " + JSON.stringify(e));
          }
        });
      }
    },
    // 初始化数据库，仅在开始时执行
    initTable() {
      this.openDB();
      formatAppLog("log", "at func/common/sqlite.js:26", "初始化表 ");
      this.initMessage();
      this.initEntity();
      this.initCharacter();
      this.initImg();
      this.initIncubator();
      this.initBubblePattern();
    },
    // 执行SQL语句，删除数据库
    async dropTable(tableName) {
      return new Promise((resolve, reject) => {
        this.openDB();
        formatAppLog("log", "at func/common/sqlite.js:40", "执行SQL语句: drop table " + tableName);
        plus.sqlite.executeSql({
          name: "localdb",
          sql: "drop table `" + tableName + "`",
          success: function(e) {
            formatAppLog("log", "at func/common/sqlite.js:45", "drop table " + tableName + " success!");
            resolve(e);
          },
          fail: function(e) {
            uni.showToast({
              title: "数据库操作失败，请联系管理员",
              icon: "none"
            });
            formatAppLog("log", "at func/common/sqlite.js:53", "drop table " + tableName + " failed: " + JSON.stringify(e));
            reject(e);
          }
        });
      });
    },
    // 增删改操作
    async executeSQL(sqlStr) {
      return new Promise((resolve, reject) => {
        this.openDB();
        formatAppLog("log", "at func/common/sqlite.js:64", "SQL语句: " + sqlStr);
        plus.sqlite.executeSql({
          name: "localdb",
          sql: sqlStr,
          success: function(data) {
            formatAppLog("log", "at func/common/sqlite.js:69", "executeSql success: " + JSON.stringify(data));
            resolve(data);
          },
          fail: function(e) {
            uni.showToast({
              title: "数据操作失败，请联系管理员",
              icon: "none"
            });
            formatAppLog("log", "at func/common/sqlite.js:77", "executeSql failed: " + JSON.stringify(e));
            reject(e);
          }
        });
      });
    },
    // 查询SQL语句
    async selectSQL(sqlStr) {
      return new Promise((resolve, reject) => {
        this.openDB();
        formatAppLog("log", "at func/common/sqlite.js:88", "查询SQL语句: " + sqlStr);
        plus.sqlite.selectSql({
          name: "localdb",
          sql: sqlStr,
          success: function(data) {
            resolve(data);
          },
          fail: function(e) {
            uni.showToast({
              title: "数据查询失败，请联系管理员",
              icon: "none"
            });
            formatAppLog("log", "at func/common/sqlite.js:104", "selectSql failed: " + JSON.stringify(e));
            reject(e);
          }
        });
      });
    },
    // 关闭数据库
    closeDB() {
      plus.sqlite.closeDatabase({
        name: "localdb",
        success: function() {
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:120", "closeDatabase failed: " + JSON.stringify(e));
        }
      });
    },
    isOpenDB() {
      if (plus.sqlite.isOpenDatabase({
        name: "localdb",
        path: "_doc/localdb.db"
      })) {
        return true;
      } else {
        formatAppLog("log", "at func/common/sqlite.js:135", "DB Unopened!");
        return false;
      }
    },
    initMessage() {
    },
    initEntity() {
      plus.sqlite.executeSql({
        name: "localdb",
        sql: "CREATE TABLE IF NOT EXISTS cybercafe_entity ( entity_id INTEGER PRIMARY KEY AUTOINCREMENT, entity_title TEXT NOT NULL, entity_img TEXT DEFAULT '', entity_created_at TEXT NOT NULL, entity_updated_at TEXT, subject_name TEXT NOT NULL DEFAULT '你', subject_img TEXT DEFAULT '" + config$1.config.voiceOver + "', subject_description TEXT, extra_description TEXT, ai_select INTEGER NOT NULL DEFAULT 1, entity_mode TEXT NOT NULL DEFAULT 'novel', bubble_opacity INTEGER NOT NULL DEFAULT 10 );",
        success: function() {
          formatAppLog("log", "at func/common/sqlite.js:155", "create table `cybercafe_entity` success!");
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:158", "create table `cybercafe_entity` failed: " + JSON.stringify(e));
        }
      });
      plus.sqlite.executeSql({
        name: "localdb",
        sql: "CREATE TABLE IF NOT EXISTS cybercafe_entity_detail ( entity_detail_id INTEGER PRIMARY KEY AUTOINCREMENT, entity_id INTEGER NOT NULL, character_id INTEGER NOT NULL, detail_status INTEGER NOT NULL DEFAULT 1 );",
        success: function() {
          formatAppLog("log", "at func/common/sqlite.js:168", "create table `cybercafe_entity_detail` success!");
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:171", "create table `cybercafe_entity_detail` failed: " + JSON.stringify(e));
        }
      });
    },
    initCharacter() {
      plus.sqlite.executeSql({
        name: "localdb",
        sql: "CREATE TABLE IF NOT EXISTS cybercafe_character ( character_id INTEGER PRIMARY KEY AUTOINCREMENT, character_name TEXT NOT NULL, character_description TEXT NOT NULL, character_prologue TEXT NOT NULL DEFAULT '', character_img TEXT DEFAULT '" + config$1.config.defaultImg + "', character_online_id INTEGER DEFAULT 7,  character_created_at TEXT NOT NULL DEFAULT '" + common$1.getCurrentTimeStampStr() + "' );",
        success: function() {
          formatAppLog("log", "at func/common/sqlite.js:185", "create table `cybercafe_character` success!");
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:188", "create table `cybercafe_character` failed: " + JSON.stringify(e));
        }
      });
      plus.sqlite.selectSql({
        name: "localdb",
        sql: "select * from cybercafe_character where character_name = '旁白';",
        //名字不可改
        success: function(data) {
          if (data.length == 0) {
            plus.sqlite.executeSql({
              name: "localdb",
              sql: "insert into cybercafe_character ( character_name, character_description, character_prologue, character_img ) values ( '旁白', '会客观总结当前情形的旁白，也会为推进剧情适时提供灵感或线索', '',  '" + config$1.config.voiceOver + "');",
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:204", "insert voice-over success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:207", "insert voice-over failed: " + JSON.stringify(e));
              }
            });
          } else {
            plus.sqlite.executeSql({
              name: "localdb",
              sql: "update cybercafe_character set character_img = '" + config$1.config.voiceOver + "' where character_name = '旁白';",
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:216", "update voice-over success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:219", "update voice-over failed: " + JSON.stringify(e));
              }
            });
          }
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:225", "find voice-over failed: " + JSON.stringify(e));
        }
      });
    },
    initImg() {
      plus.sqlite.executeSql({
        name: "localdb",
        sql: "CREATE TABLE IF NOT EXISTS cybercafe_images ( image_id INTEGER PRIMARY KEY AUTOINCREMENT, image_type TEXT NOT NULL, image_src TEXT NOT NULL, image_created_at TEXT NOT NULL, image_selected_count INTEGER DEFAULT 0, image_status INTEGER DEFAULT 1 );",
        //1已上传 4未上传
        success: function() {
          formatAppLog("log", "at func/common/sqlite.js:237", "create table `cybercafe_images` success!");
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:240", "create table `cybercafe_images` failed: " + JSON.stringify(e));
        }
      });
      plus.sqlite.selectSql({
        //0.3.3.24101018后增加
        name: "localdb",
        sql: "select * from cybercafe_images;",
        //仅在建表后执行一次
        success: function(data) {
          if (data.length == 0) {
            plus.sqlite.selectSql({
              name: "localdb",
              sql: "select * from cybercafe_images where image_src = '" + config$1.config.voiceOver + "' and image_type = '0';",
              //图片每类唯一
              success: function(data2) {
                if (data2.length == 0) {
                  plus.sqlite.executeSql({
                    name: "localdb",
                    sql: "insert into cybercafe_images ( image_type, image_src, image_created_at ) values ( '0', '" + config$1.config.voiceOver + "', '" + common$1.getCurrentTimeStampStr() + "');",
                    success: function() {
                      formatAppLog("log", "at func/common/sqlite.js:259", "insert default-subject success!");
                    },
                    fail: function(e) {
                      formatAppLog("log", "at func/common/sqlite.js:262", "insert default-subject failed: " + JSON.stringify(e));
                    }
                  });
                }
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:268", "find default-subject failed: " + JSON.stringify(e));
              }
            });
            plus.sqlite.executeSql({
              name: "localdb",
              sql: "insert into cybercafe_images ( image_type, image_src, image_created_at, image_selected_count ) values select 'entity', entity_img, entity_created_at, count(entity_img) from cybercafe_entity group by entity_img;",
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:277", "insert entity_img success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:280", "insert entity_img failed: " + JSON.stringify(e));
              }
            });
            plus.sqlite.executeSql({
              name: "localdb",
              sql: "insert into cybercafe_images ( image_type, image_src, image_created_at, image_selected_count ) values select '0', subject_img, entity_created_at, count(subject_img) from cybercafe_entity where subject_img <> '" + config$1.config.voiceOver + "' group by subject_img;",
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:289", "insert subject_img success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:292", "insert subject_img failed: " + JSON.stringify(e));
              }
            });
            plus.sqlite.executeSql({
              name: "localdb",
              sql: "insert into cybercafe_images ( image_type, image_src, image_created_at, image_selected_count ) values select character_online_id, character_img, character_created_at, count(character_img) from cybercafe_character where character_img <> '" + config$1.config.defaultImg + "' group by character_img;",
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:302", "insert character_img success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:305", "insert character_img failed: " + JSON.stringify(e));
              }
            });
            if (store.state.user.user_avatar) {
              plus.sqlite.selectSql({
                name: "localdb",
                sql: "select * from cybercafe_images where image_type = '0' and image_src = '" + store.state.user.user_avatar + "';",
                //玩家头像
                success: function(avatar_data) {
                  if (avatar_data.length == 0) {
                    plus.sqlite.executeSql({
                      name: "localdb",
                      sql: "insert into cybercafe_images ( image_type, image_src, image_created_at, image_selected_count ) values ('0', '" + store.state.user.user_avatar + "', '" + common$1.getCurrentTimeStampStr() + "', 1)",
                      success: function() {
                        formatAppLog("log", "at func/common/sqlite.js:320", "insert avatar_img success!");
                      },
                      fail: function(e) {
                        formatAppLog("log", "at func/common/sqlite.js:323", "insert avatar_img failed: " + JSON.stringify(e));
                      }
                    });
                  } else {
                    plus.sqlite.executeSql({
                      name: "localdb",
                      sql: "update cybercafe_images set image_selected_count = image_selected_count + 1 where type = '0' and image_src = '" + store.state.user.user_avatar + "')",
                      success: function() {
                        formatAppLog("log", "at func/common/sqlite.js:332", "update avatar_img success!");
                      },
                      fail: function(e) {
                        formatAppLog("log", "at func/common/sqlite.js:335", "update avatar_img failed: " + JSON.stringify(e));
                      }
                    });
                  }
                }
              });
            }
          }
        }
      });
    },
    initIncubator() {
      plus.sqlite.executeSql({
        name: "localdb",
        sql: "CREATE TABLE IF NOT EXISTS cybercafe_incubator ( incubator_id INTEGER PRIMARY KEY AUTOINCREMENT, character_name TEXT NOT NULL, character_gender INTEGER DEFAULT 0, character_description TEXT NOT NULL, character_prologue TEXT NOT NULL DEFAULT '', character_memo TEXT, character_img TEXT DEFAULT '" + config$1.config.defaultImg + "', character_tag TEXT DEFAULT '', character_online_id INTEGER DEFAULT 0, character_offline_id INTEGER DEFAULT 0, character_status INTEGER DEFAULT 4);",
        //0删除 1发布 2关注可见 3白名单可见 4草稿 5提交审核 7审核不通过 8举报争议
        success: function() {
          formatAppLog("log", "at func/common/sqlite.js:358", "create table `cybercafe_incubator` success!");
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:361", "create table `cybercafe_incubator` failed: " + JSON.stringify(e));
        }
      });
    },
    initBubblePattern() {
      plus.sqlite.executeSql({
        name: "localdb",
        sql: "CREATE TABLE IF NOT EXISTS cybercafe_bubble_pattern ( pattern_id INTEGER PRIMARY KEY AUTOINCREMENT, pattern_key TEXT NOT NULL, pattern_name TEXT NOT NULL, pattern_html TEXT NOT NULL, pattern_css TEXT NOT NULL, pattern_options TEXT NOT NULL, pattern_created_at TEXT NOT NULL, pattern_updated_at TEXT NOT NULL, pattern_status INTEGER DEFAULT 4 );",
        //1下载 4自建未上传 6自建已上传
        success: function() {
          formatAppLog("log", "at func/common/sqlite.js:375", "create table `cybercafe_bubble_pattern` success!");
        },
        fail: function(e) {
          formatAppLog("log", "at func/common/sqlite.js:378", "create table `cybercafe_bubble_pattern` failed: " + JSON.stringify(e));
        }
      });
      plus.sqlite.selectSql({
        name: "localdb",
        sql: "select * from cybercafe_bubble_pattern;",
        //自带样式
        success: function(pattern_data) {
          if (pattern_data.length == 0) {
            plus.sqlite.executeSql({
              name: "localdb",
              sql: `insert into cybercafe_bubble_pattern ( pattern_key, pattern_name, pattern_html, pattern_css, pattern_options, pattern_created_at, pattern_updated_at, pattern_status ) values ('JH84XYP5-b-1', '默认气泡', '<div class="chat-bubble">{{text}}</div>', '<style>.chat-line .chat-bubble{
    padding: 10px 15px;
    line-height: 1.5;
    background:{{bg-color1}};
    border-radius:5px;
}</style>', '{"bg-color1": "rgba(204,204,204, {{bubble_opacity}})"}', '2025-03-15 15:00:00', '2025-03-15 15:00:00', 6)`,
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:393", "insert cybercafe_bubble_pattern success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:396", "insert cybercafe_bubble_pattern failed: " + JSON.stringify(e));
              }
            });
            plus.sqlite.executeSql({
              name: "localdb",
              sql: `insert into cybercafe_bubble_pattern ( pattern_key, pattern_name, pattern_html, pattern_css, pattern_options, pattern_created_at, pattern_updated_at, pattern_status ) values ('JH84XYP5-b-2', '微信气泡', '<div class="chat-bubble {{side}}">{{text}}</div>', '<style>.chat-line .chat-bubble {
    position: relative;
    padding: 10px 15px;
    line-height: 1.5;
    border-radius: 5px;
    display:inline-block;
}
.chat-line .chat-bubble.left {
    background-color: {{bg-color1}};
}
.chat-line .chat-bubble.left::before {
    content: "";
    position: absolute;
    top: 12px;
    left: -6px;
    width: 0;
    height: 0;
    border-right: 7px solid {{bg-color1}};
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
}
.chat-line .chat-bubble.right {
    background-color: {{bg-color2}};
    float:right;
}
.chat-line .chat-bubble.right::before {
    content: "";
    position: absolute;
    top: 12px;
    right: -6px;
    width: 0;
    height: 0;
    border-left: 7px solid {{bg-color2}};
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
}</style>', '{"bg-color1": "#e5e5ea", "bg-color2": "#89b007"}', '2025-03-15 15:00:00', '2025-03-15 15:00:00', 6)`,
              success: function() {
                formatAppLog("log", "at func/common/sqlite.js:407", "insert cybercafe_bubble_pattern success!");
              },
              fail: function(e) {
                formatAppLog("log", "at func/common/sqlite.js:410", "insert cybercafe_bubble_pattern failed: " + JSON.stringify(e));
              }
            });
          }
        }
      });
    }
  };
  const request = {
    data() {
      return {
        last_called: 0
        // 存储上一次调用的时间戳
      };
    },
    async post(option, options = {}) {
      let configData = config$1.config;
      let url = configData.domain;
      let post_data;
      url += option;
      post_data = options;
      post_data["id"] = store.state.user.userId;
      post_data["token"] = store.state.user.token;
      formatAppLog("log", "at func/common/request.js:25", configData.domain + option);
      formatAppLog("log", "at func/common/request.js:26", "post_data:" + JSON.stringify(post_data));
      return new Promise((resolve, reject) => {
        uni.request({
          url,
          method: "POST",
          header: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify(post_data),
          success: (res) => {
            formatAppLog("log", "at func/common/request.js:37", res);
            formatAppLog("log", "at func/common/request.js:42", url, "response data:", res.data);
            if (res.data.code == 301) {
              uni.hideLoading();
              uni.showModal({
                title: "温馨提示",
                content: res.data.msg,
                showCancel: false,
                confirmText: "晓得了",
                success: function(res2) {
                  if (res2.confirm) {
                    formatAppLog("log", "at func/common/request.js:52", "用户点击确定");
                  }
                }
              });
              store.commit("user/setUserData", {
                key: "refreshFlag",
                data: "fail"
              });
              return;
            } else if (res.data.code == 302) {
              uni.hideLoading();
              uni.showModal({
                title: "温馨提示",
                content: res.data.msg,
                showCancel: false,
                confirmText: "晓得了",
                success: function(res2) {
                  if (res2.confirm) {
                    formatAppLog("log", "at func/common/request.js:70", "用户点击确定");
                  }
                }
              });
              uni.reLaunch({
                url: "/pages/login/login"
              });
            } else if (res.data.code == 300) {
              uni.hideLoading();
              uni.showToast({
                title: res.msg,
                icon: "none"
              });
              store.commit("user/setUserData", {
                key: "isLogin",
                data: false
              });
              formatAppLog("log", "at func/common/request.js:88", "重新登录，来自：" + option);
              uni.reLaunch({
                url: "../login/login"
              });
            } else {
              resolve(res.data);
            }
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({
              title: "网络问题，请稍后再试",
              icon: "none"
            });
            throw new Error("网络问题，请稍后再试:" + JSON.stringify(err));
          }
        });
      });
    },
    getIp() {
      let _self = this;
      uni.request({
        url: "https://api.ip.sb/jsonip",
        success: (res) => {
          if (res.data.ip != store.state.user.ip || store.state.user.ippos == "") {
            store.commit("user/setUserData", {
              key: "ip",
              data: res.data.ip
            });
            _self.post("userController/getIpPos", {
              "ip": store.state.user.ip
            }).then((response) => {
              if (response.code == 200) {
                store.commit("user/setUserData", {
                  key: "ippos",
                  data: response.result.regionName
                });
              }
            });
          }
        },
        fail: (res) => {
          formatAppLog("log", "at func/common/request.js:132", res);
        }
      });
    }
  };
  const userBaseInfo = {
    userInit
  };
  function userInit() {
    uni.getSystemInfo({
      success: function(res) {
        formatAppLog("log", "at func/user/userBaseInfo.js:12", res);
        let deviceData = {
          appLanguage: res.appLanguage,
          browserName: res.browserName,
          browserVersion: res.browserVersion,
          deviceBrand: res.deviceBrand,
          // 品牌
          deviceModel: res.deviceModel,
          // 型号
          deviceType: res.deviceType,
          devicePixelRatio: res.devicePixelRatio,
          // 设备像素比
          romName: res.romName,
          uniPlatform: res.uniPlatform,
          // 平台（iOS、Android、Windows等）
          uniRuntimeVersion: res.uniRuntimeVersion,
          brand: res.brand,
          model: res.model,
          platform: res.platform,
          screenWidth: res.screenWidth,
          // 屏幕宽度
          screenHeight: res.screenHeight,
          // 屏幕高度
          system: res.system,
          // 操作系统版本
          theme: res.osTheme,
          ip: store.state.user.ip,
          ippos: store.state.user.ippos
        };
        JSON.stringify(deviceData);
        store.commit("user/setUserData", {
          key: "screen",
          data: res.screenWidth + "*" + res.screenHeight
        });
      }
    });
    request.post("userController/relogin", {
      device: jsonData,
      version: VERSION
    }).then((res) => {
      if (res.code == 200) {
        formatAppLog("log", "at func/user/userBaseInfo.js:50", res.result);
        store.commit("user/setUserData", {
          key: "token",
          data: res.result.token
        });
        if (res.result.latest_version > store.state.user.latestVersion) {
          store.commit("user/setUserData", {
            key: "latestVersion",
            data: res.result.latest_version
          });
          store.commit("user/setUserData", {
            key: "userKey",
            data: res.result.key
          });
        }
        store.commit("user/setUserData", {
          key: "userGroup",
          data: res.result.group
        });
        store.commit("user/setUserData", {
          key: "groupExpiration",
          data: res.result.expiration
        });
        store.commit("user/setUserData", {
          key: "powerLevel",
          data: res.result.power_level
        });
        if (res.result.info) {
          common.checkPopup(function() {
            uni.showModal({
              title: "温馨提示",
              content: res.result.info,
              showCancel: false,
              confirmText: "明白了",
              success: function(res2) {
                if (res2.confirm)
                  ;
              }
            });
          });
        }
      } else {
        uni.showToast({
          title: res.data.msg,
          icon: "none"
        });
      }
    });
  }
  const baseQuery = {
    deleteDataByKey(tableName, whereArr = []) {
      return new Promise((resolve, reject) => {
        if (!tableName)
          reject("tableName: " + tableName);
        let sqlStr = `delete from ` + tableName;
        let whereStr = ` `;
        let i = 0;
        for (let key in whereArr) {
          if (i > 0) {
            sqlStr += ` and `;
          }
          whereStr += key + ` = '${whereArr[key]}' `;
          i++;
        }
        if (whereStr == ``) {
          reject("whereArr: " + whereArr);
        }
        if (whereStr != ` `) {
          sqlStr += ` where ` + whereStr;
        }
        formatAppLog("log", "at func/dbManager/baseQuery.js:24", sqlStr);
        sqlite.executeSQL(sqlStr).then((return_data) => {
          resolve(return_data);
        });
      });
    },
    getDataByKey(tableName, whereArr = []) {
      return new Promise((resolve, reject) => {
        if (!tableName)
          reject("tableName: " + tableName);
        let sqlStr = "select * from " + tableName;
        let whereStr = " ";
        let i = 0;
        for (let key in whereArr) {
          if (i > 0) {
            whereStr += " and ";
          }
          whereStr += key + " = '" + whereArr[key] + "' ";
          i++;
        }
        if (whereStr != " ") {
          sqlStr += " where " + whereStr;
        }
        sqlite.selectSQL(sqlStr).then((return_data) => {
          resolve(return_data);
        });
      });
    },
    insertDataByKey(tableName, insertArr, insertId = false) {
      return new Promise((resolve, reject) => {
        if (!tableName)
          reject("tableName: " + tableName);
        let sqlStr = `insert INTO ` + tableName + ` ( `;
        let i = 0;
        let sqlKey = ``;
        let sqlValue = ``;
        for (let key in insertArr) {
          if (i > 0) {
            sqlKey += `, `;
            sqlValue += `, `;
          }
          sqlKey += key;
          sqlValue += `'${insertArr[key]}'`;
          i++;
        }
        if (sqlKey == "")
          reject("insertArr: " + insertArr);
        sqlStr += sqlKey + ` ) values (` + sqlValue + `) `;
        sqlite.executeSQL(sqlStr).then(() => {
          if (insertId) {
            sqlite.selectSQL("select last_insert_rowid() as id;").then((res) => {
              if (res && res.length > 0) {
                resolve(res[0].id);
              } else {
                reject("Failed to retrieve inserted ID");
              }
            }).catch((e) => {
              formatAppLog("error", "at func/dbManager/baseQuery.js:85", e);
              uni.showToast({
                title: e,
                icon: "none"
              });
              reject(e);
            });
          } else {
            resolve("inserted");
          }
        });
      });
    },
    updateDataByKey(tableName, updateArr, whereArr) {
      return new Promise((resolve, reject) => {
        if (!tableName)
          reject("tableName: " + tableName);
        let sqlStr = `update ` + tableName + ` set `;
        let i = 0;
        let updateStr = ``;
        for (let fieldName in updateArr) {
          if (i > 0)
            updateStr += `, `;
          updateStr += fieldName + ` = '${updateArr[fieldName]}' `;
          i++;
        }
        if (updateStr == "") {
          reject("updateArr: " + updateStr);
        }
        i = 0;
        let whereStr = ``;
        for (let key in whereArr) {
          if (i > 0) {
            whereStr += ` and `;
          }
          whereStr += key + ` = '${whereArr[key]}' `;
          i++;
        }
        if (whereStr == "") {
          whereStr = ` 1 = 1 `;
        }
        sqlStr += updateStr + ` where ` + whereStr;
        sqlite.executeSQL(sqlStr).then(() => {
          resolve("updated");
        }).catch((e) => {
          formatAppLog("error", "at func/dbManager/baseQuery.js:131", e);
          uni.showToast({
            title: e,
            icon: "none"
          });
          reject(e);
        });
      });
    },
    async syncDBDownload() {
      let _self = this;
      uni.showModal({
        title: "下载前将删除已有数据",
        confirmText: "确定覆盖",
        showCancel: true,
        cancelText: "再想想",
        success: function(res) {
          if (res.confirm) {
            uni.showLoading({
              title: "下载中",
              mask: true
            });
            try {
              request.post("aiController/syncDBDownload").then((response) => {
                if (response.code == 200) {
                  let result = JSON.parse(response.result);
                  for (let table_name in result) {
                    formatAppLog("log", "at func/dbManager/baseQuery.js:161", "table_name:" + table_name);
                    let tableData = {};
                    let table = result[table_name];
                    sqlite.executeSQL("delete from cybercafe_" + table_name);
                    for (let key in table) {
                      for (let data_key in table[key]) {
                        formatAppLog("log", "at func/dbManager/baseQuery.js:168", "table_key:" + data_key);
                        formatAppLog("log", "at func/dbManager/baseQuery.js:169", "table_value:" + JSON.stringify(table[key][data_key]));
                        tableData[data_key] = table[key][data_key];
                      }
                      _self.insertDataByKey("cybercafe_" + table_name, tableData);
                    }
                  }
                  uni.showToast({
                    title: "下载完成",
                    icon: "success"
                  });
                  uni.hideLoading();
                } else {
                  uni.showToast({
                    title: response.msg,
                    icon: "none"
                  });
                }
              });
            } catch (error) {
              uni.hideLoading();
              formatAppLog("error", "at func/dbManager/baseQuery.js:193", "捕获到错误：", error);
              uni.showToast({
                title: error,
                icon: "none"
              });
            }
          } else if (res.cancel) {
            formatAppLog("log", "at func/dbManager/baseQuery.js:200", "用户点击取消");
          }
        }
      });
    },
    async syncDBUpload() {
      uni.showLoading({
        title: "上传中",
        mask: true
      });
      let data = {};
      data.message = await this.getDataByKey("cybercafe_message");
      data.entity = await this.getDataByKey("cybercafe_entity");
      data.entity_detail = await this.getDataByKey("cybercafe_entity_detail");
      data.character = await this.getDataByKey("cybercafe_character");
      data.images = await this.getDataByKey("cybercafe_images");
      data.incubator = await this.getDataByKey("cybercafe_incubator");
      data.bubble_pattern = await this.getDataByKey("cybercafe_bubble_pattern");
      if (JSON.stringify(data).length > 0) {
        request.post("aiController/syncDBUpload", {
          "data": JSON.stringify(data)
        }).then((response) => {
          uni.hideLoading();
          if (response) {
            uni.showToast({
              title: "上传成功",
              icon: "success"
            });
          }
        });
      } else {
        uni.hideLoading();
        uni.showToast({
          title: "无数据可上传",
          icon: "none"
        });
      }
    }
  };
  const incubatorBaseFun = {
    feedback
  };
  function feedback() {
    request.post("characterController/getIncubator", { creater: store.state.user.userId }).then((res) => {
      if (res.code == 200) {
        for (let i = 0; i < res.result.length; i++) {
          let updateArr = {
            character_description: res.result[i].character_description,
            character_prologue: res.result[i].character_prologue,
            character_tag: res.result[i].character_tag,
            character_status: res.result[i].character_status
          };
          let whereArr = {
            character_name: res.result[i].character_name,
            character_status: 6
          };
          baseQuery.updateDataByKey("cybercafe_incubator", updateArr, whereArr);
        }
      } else {
        uni.showToast({
          title: res.msg,
          icon: "none"
        });
      }
    });
  }
  const handleFun = {
    async beforeInit() {
      plus.navigator.setFullscreen(true);
      store.commit("user/getUserData");
      plus.nativeUI.setUIStyle(store.state.user.darkMode);
      request.getIp();
      if (store.state.user.isLogin == false) {
        uni.reLaunch({
          url: "../login/login"
        });
      } else {
        userBaseInfo.userInit();
        incubatorBaseFun.feedback();
      }
    }
  };
  const _imports_0 = "/static/logo.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {
    data() {
      return {
        slogan: "Cyber",
        slogan2: "Cafe"
      };
    },
    created() {
      sqlite.initTable();
      handleFun.beforeInit();
    },
    onLoad() {
    },
    methods: {}
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content text-center" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: _imports_0
      }),
      vue.createElementVNode("view", null, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.slogan),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "title2" },
          vue.toDisplayString($data.slogan2),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "D:/HBuilderProjects/cybercafe-git/pages/index/index.vue"]]);
  const _sfc_main$4 = {
    name: "cybercafe-view",
    props: {
      isAbsolute: {
        type: Boolean,
        default: false
      },
      isScrollable: {
        type: Boolean,
        default: false
      },
      closeAble: {
        type: Boolean,
        default: true
      },
      popViewStyle: {
        type: String,
        default: ""
      },
      viewTitle: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        visible: true
      };
    },
    mounted() {
      if (!this.isAbsolute) {
        this.visible = true;
      }
    },
    methods: {
      openView() {
        this.visible = true;
      },
      closeView() {
        this.visible = false;
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock(
      "view",
      null,
      [
        $props.isAbsolute ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "cybercafe-view-bg",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.closeView && $options.closeView(...args))
        })) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            class: "cybercafe-main-view",
            style: vue.normalizeStyle($props.popViewStyle)
          },
          [
            vue.createElementVNode("view", { class: "display-flex sp-between" }, [
              vue.createElementVNode(
                "view",
                { class: "title" },
                vue.toDisplayString($props.viewTitle),
                1
                /* TEXT */
              ),
              $props.isAbsolute && $props.closeAble ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "iconfont icon-guanbi",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.closeView && $options.closeView(...args))
              })) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("scroll-view", {
              class: "scroll-part2",
              "scroll-y": "true",
              "refresher-default-style": "black"
            }, [
              vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ])
          ],
          4
          /* STYLE */
        )
      ],
      512
      /* NEED_PATCH */
    )), [
      [vue.vShow, $data.visible]
    ]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-892e6924"], ["__file", "D:/HBuilderProjects/cybercafe-git/components/cybercafe-view/cybercafe-view.vue"]]);
  const _sfc_main$3 = {
    name: "login",
    props: {
      loginText: {
        type: String,
        default: ""
      },
      showIcon: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        account: "",
        pwd: "",
        repeatpwd: "",
        // 表单数据
        form_flag: "login"
        //login reset
      };
    },
    computed: {
      ...mapState("user", ["isLogin"])
    },
    methods: {
      ...mapMutations("user", ["setUserData", "getUserData"]),
      openReset() {
        this.form_flag = "reset";
        this.$forceUpdate();
      },
      closeReset() {
        this.form_flag = "login";
        this.$forceUpdate();
      },
      show() {
        this.$refs.loginView.openView();
      },
      hide() {
        this.$refs.loginView.closeView();
      },
      register() {
        this.hide();
        uni.$emit("chagePop", "cpRegister");
      },
      submit(ref) {
        uni.showLoading();
        let _self = this;
        if (this.form_flag == "login") {
          request.post("userController/login", {
            account: this.account,
            //Base64.encode(this.account),
            pwd: this.pwd
          }).then((res) => {
            uni.hideLoading();
            if (res.code == 200) {
              formatAppLog("log", "at modules/login/login.vue:112", res.result);
              _self.hide();
              let data = {
                userId: res.result.id,
                userName: res.result.name,
                //Base64.decode(res.result.name),
                userKey: res.result.key,
                token: res.result.token,
                userGroup: res.result.group,
                groupExpiration: res.result.expiration,
                latestVersion: res.result.latest_version,
                powerLevel: res.result.power_level,
                isLogin: true
              };
              for (let key in data) {
                _self.setUserData({ "key": key, "data": data[key] });
              }
              uni.showModal({
                title: "登录",
                content: "欢迎，" + res.result.name,
                showCancel: false,
                confirmText: "ok",
                success: function(res2) {
                  if (res2.confirm) {
                    formatAppLog("log", "at modules/login/login.vue:137", "用户点击确定");
                  }
                }
              });
              uni.navigateTo({
                url: "/pages/index/index"
              });
            } else {
              uni.showToast({
                title: res.msg,
                icon: "none"
              });
            }
          });
        } else {
          if (this.pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/) == null) {
            uni.showToast({
              title: "密码至少8个字符，包含至少1个大写字母、1个小写字母和1个数字",
              icon: "none"
            });
            return;
          }
          if (this.pwd != this.repeatpwd) {
            uni.showToast({
              title: "重复密码错误",
              icon: "none"
            });
            return;
          }
          let _self2 = this;
          uni.showLoading();
          request.post("userController/resetPwd", {
            qq: this.account,
            pwd: this.pwd
          }).then((res) => {
            uni.hideLoading();
            if (res.code == 200) {
              formatAppLog("log", "at modules/login/login.vue:177", res.result);
              uni.showModal({
                title: "温馨提示",
                content: res.result.msg,
                showCancel: false,
                confirmText: "明白了",
                success: function(res1) {
                  if (res1.confirm) {
                    if (res.result.msg == "密码已更新，请重新登录") {
                      _self2.form_flag = "login";
                      _self2.$forceUpdate();
                    }
                  }
                }
              });
            } else {
              uni.showToast({
                title: res.msg,
                icon: "none"
              });
            }
          });
        }
      },
      logoutConfirm() {
        formatAppLog("log", "at modules/login/login.vue:203", "logout");
        this.resetUserData();
        uni.showModal({
          title: "登出",
          content: "安全退出",
          showCancel: false,
          confirmText: "ok",
          success: function(res) {
            if (res.confirm) {
              formatAppLog("log", "at modules/login/login.vue:212", "用户点击确定");
            }
          }
        });
        this.$emit("afterLogout");
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_cybercafe_view = resolveEasycom(vue.resolveDynamicComponent("cybercafe-view"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", {
      onClick: _cache[9] || (_cache[9] = (...args) => _ctx.loginShow && _ctx.loginShow(...args))
    }, [
      vue.withDirectives(vue.createElementVNode(
        "view",
        { class: "iconfont icon-geren" },
        null,
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $props.showIcon]
      ]),
      vue.createVNode(_component_cybercafe_view, {
        ref: "loginView",
        "is-absolute": true,
        closeAble: false,
        viewTitle: $data.form_flag == "login" ? "登录" : "修改密码",
        popViewStyle: "width: 80vw;margin:20vh auto;"
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "content" }, [
            vue.createElementVNode("view", { class: "display-flex sp-between login-line" }, [
              vue.createElementVNode("label", null, [
                vue.createTextVNode("账号"),
                vue.createElementVNode("span", { class: "required" }, "*")
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.account = $event),
                  focus: "",
                  placeholder: "请输入账号(qq号@qq.com)"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.account]
              ])
            ]),
            $data.form_flag == "login" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "display-flex sp-between login-line"
            }, [
              vue.createElementVNode("label", null, [
                vue.createTextVNode("密码"),
                vue.createElementVNode("span", { class: "required" }, "*")
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "password",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.pwd = $event),
                  placeholder: "请输入密码"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.pwd]
              ])
            ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
              vue.createElementVNode("view", { class: "display-flex sp-between" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("新密码"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "password",
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.pwd = $event),
                    placeholder: "请输入新的密码"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.pwd]
                ])
              ]),
              vue.createElementVNode("view", {
                class: "display-flex login-line",
                style: { "justify-content": "flex-end" }
              }, [
                vue.createElementVNode("view", { class: "hint" }, "（至少8个字符，包含至少1个大写字母、1个小写字母和1个数字）")
              ]),
              vue.createElementVNode("view", { class: "display-flex sp-between login-line" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("重复密码"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "password",
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.repeatpwd = $event),
                    placeholder: "与密码一致"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.repeatpwd]
                ])
              ])
            ])),
            $data.form_flag == "login" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "display-flex sp-between"
            }, [
              vue.createElementVNode("view", {
                class: "hint",
                onClick: _cache[4] || (_cache[4] = (...args) => $options.openReset && $options.openReset(...args))
              }, "忘记密码？"),
              vue.createElementVNode("view", null, [
                vue.createElementVNode("button", {
                  onClick: _cache[5] || (_cache[5] = (...args) => $options.register && $options.register(...args)),
                  size: "mini"
                }, "注册")
              ]),
              vue.createElementVNode("view", null, [
                vue.createElementVNode("button", {
                  type: "primary",
                  onClick: _cache[6] || (_cache[6] = ($event) => $options.submit("loginForm")),
                  size: "mini"
                }, "登录")
              ])
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 3,
              class: "display-flex sp-between"
            }, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode("button", {
                  type: "primary",
                  onClick: _cache[7] || (_cache[7] = ($event) => $options.submit("resetForm")),
                  size: "mini"
                }, "修改")
              ]),
              vue.createElementVNode("view", null, [
                vue.createElementVNode("button", {
                  onClick: _cache[8] || (_cache[8] = (...args) => $options.closeReset && $options.closeReset(...args)),
                  size: "mini"
                }, "取消")
              ])
            ]))
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["viewTitle"])
    ]);
  }
  const login = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-619d6273"], ["__file", "D:/HBuilderProjects/cybercafe-git/modules/login/login.vue"]]);
  const _sfc_main$2 = {
    name: "register",
    data() {
      return {
        // 表单数据
        nickname: "",
        username: "",
        pwd: "",
        repeatpwd: "",
        inviteCode: ""
      };
    },
    computed: {
      ...mapState("user", ["isLogin"])
    },
    methods: {
      ...mapMutations("user", ["setUserData", "getUserData"]),
      show() {
        this.$refs.registerView.openView();
      },
      hide() {
        this.$refs.registerView.closeView();
      },
      login() {
        this.hide();
        uni.$emit("chagePop", "cpLogin");
      },
      submitRegister() {
        if (this.pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/) == null) {
          uni.showToast({
            title: "密码至少8个字符，包含至少1个大写字母、1个小写字母和1个数字",
            icon: "none"
          });
          return;
        }
        if (this.pwd != this.repeatpwd) {
          uni.showToast({
            title: "重复密码错误",
            icon: "none"
          });
          return;
        }
        if (this.username.match(/^[1-9][0-9]{6,11}$/) != this.username) {
          uni.showToast({
            title: "请正确填写QQ号",
            icon: "none"
          });
          return;
        }
        if (this.inviteCode.match(/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{8}$/) == null) {
          uni.showToast({
            title: "邀请码为8个大写字母或数字",
            icon: "none"
          });
          return;
        }
        uni.showLoading();
        request.post("userController/autoRegister", {
          nickname: this.nickname,
          qq: this.username,
          pwd: this.pwd,
          code: this.inviteCode
        }).then((res) => {
          uni.hideLoading();
          if (res.code == 200) {
            formatAppLog("log", "at modules/login/register.vue:118", res.result);
            uni.showModal({
              title: "温馨提示",
              content: res.result.msg,
              showCancel: false,
              confirmText: "明白了",
              success: function(res2) {
                if (res2.confirm)
                  ;
              }
            });
          } else {
            uni.showToast({
              title: res.msg,
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_cybercafe_view = resolveEasycom(vue.resolveDynamicComponent("cybercafe-view"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createVNode(
        _component_cybercafe_view,
        {
          ref: "registerView",
          isAbsolute: true,
          closeAble: false,
          viewTitle: "注册",
          popViewStyle: "width: 80vw;margin:20vh auto;"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "content" }, [
              vue.createElementVNode("label", { class: "hint required" }, "* 为必填项"),
              vue.createElementVNode("br"),
              vue.createElementVNode("view", { class: "display-flex sp-between register-line" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("昵称"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    focus: "",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.nickname = $event),
                    maxlength: "10"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.nickname]
                ])
              ]),
              vue.createElementVNode("view", { class: "display-flex sp-between register-line" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("QQ号"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.username = $event),
                    maxlength: "12"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.username]
                ])
              ]),
              vue.createElementVNode("view", { class: "display-flex sp-between" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("设置密码"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "password",
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.pwd = $event),
                    placeholder: "请输入密码"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.pwd]
                ])
              ]),
              vue.createElementVNode("view", { class: "display-flex register-line" }, [
                vue.createElementVNode("label", { class: "hint" }, "（至少8个字符，包含至少1个大写字母、1个小写字母和1个数字）")
              ]),
              vue.createElementVNode("view", { class: "display-flex sp-between register-line" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("重复密码"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "password",
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.repeatpwd = $event),
                    placeholder: "与密码一致"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.repeatpwd]
                ])
              ]),
              vue.createElementVNode("view", { class: "display-flex sp-between register-line" }, [
                vue.createElementVNode("label", null, [
                  vue.createTextVNode("邀请码"),
                  vue.createElementVNode("span", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.inviteCode = $event)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.inviteCode]
                ])
              ]),
              vue.createElementVNode("view", { class: "display-flex sp-between" }, [
                vue.createElementVNode("view", null, [
                  vue.createElementVNode("button", {
                    onClick: _cache[5] || (_cache[5] = (...args) => $options.login && $options.login(...args)),
                    size: "mini"
                  }, "已有账号")
                ]),
                vue.createElementVNode("view", null, [
                  vue.createElementVNode("button", {
                    type: "primary",
                    onClick: _cache[6] || (_cache[6] = (...args) => $options.submitRegister && $options.submitRegister(...args)),
                    size: "mini"
                  }, "注册")
                ])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const register = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-0836e41e"], ["__file", "D:/HBuilderProjects/cybercafe-git/modules/login/register.vue"]]);
  const _sfc_main$1 = {
    onLoad() {
      let _self = this;
      uni.$on("chagePop", function(param) {
        _self.$refs[param].show();
      });
      this.getUserData();
      if (this.isLogin === false) {
        this.$nextTick(() => {
          this.$refs.cpLogin.show();
          this.$refs.cpRegister.hide();
        });
      }
    },
    components: {
      login,
      register
    },
    computed: {
      ...mapState("user", ["isLogin", "darkMode"]),
      dynamicStyle() {
        return this.darkMode == "light" ? "#333" : "#999";
      }
    },
    methods: {
      ...mapMutations("user", ["getUserData"]),
      goIndex() {
        uni.switchTab({
          url: "/pages/index/index"
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_login = vue.resolveComponent("login", true);
    const _component_register = vue.resolveComponent("register");
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createVNode(
        _component_login,
        {
          ref: "cpLogin",
          showIcon: false
        },
        null,
        512
        /* NEED_PATCH */
      ),
      vue.createVNode(
        _component_register,
        { ref: "cpRegister" },
        null,
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "D:/HBuilderProjects/cybercafe-git/pages/login/login.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/login/login", PagesLoginLogin);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
      uni.getNetworkType({
        success: (res) => {
          if (res.networkType === "none") {
            formatAppLog("log", "at App.vue:13", "当前无网络连接");
          } else {
            formatAppLog("log", "at App.vue:16", "wdebug--res", res.networkType);
          }
        }
      });
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:22", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/HBuilderProjects/cybercafe-git/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(store);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
