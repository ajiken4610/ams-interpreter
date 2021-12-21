"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastUtils = exports.AjaxFragment = exports.FragmentManager = exports.FragmentFactory = exports.Fragment = exports.LevelPageSystem = exports.State = exports.HashSystem = exports.Hash = exports.URLSystem = exports.URLUtilities = void 0;
const Utils = __importStar(require("./utils"));
const $ = require("jquery");
/**
 * このクラスは、URLに関する静的な機能を提供します。
 */
class URLUtilities {
    /**
     * URLを履歴に残さず書き換えます。
     * @param newURL {string} 書き換えるURL
     */
    static replace(newURL) {
        history.replaceState(null, "", newURL);
    }
    /**
     * URLを履歴を残して書き換えます。
     * @param newURL {string} 書き換えるURL
     */
    static push(newURL) {
        history.pushState(null, "", newURL);
    }
    /**
     * アドレスバーにあるURLを返します
     * @return {string} アドレスバーに存在するURL
     */
    static get() {
        return location.href;
    }
    /**
     * ページを再読み込みします。
     */
    static reload() {
        location.reload();
    }
}
exports.URLUtilities = URLUtilities;
/**
 * このクラスは、URLに関する実装を提供します。
 */
class URLSystem {
    /**
     * ページの状態変更リスナーを追加
     *
     * @static
     * @param {URLSystem.OnPageStateChangeListener} listener 追加するリスナー
     * @memberof URLSystem
     */
    static addOnPageStateChangeListener(listener) {
        this.onPageStateChangeListeners.push(listener);
        if (!listener.createCalled) {
            listener.onCreate(location.href);
        }
    }
    /**
     * ページの変更状態リスナーを削除
     *
     * @static
     * @param {URLSystem.OnPageStateChangeListener} listener 削除するリスナー
     * @memberof URLSystem
     */
    static deleteOnPageStateChangeListener(listener) {
        this.onPageStateChangeListeners = this.onPageStateChangeListeners.filter((item) => item !== listener);
    }
    /**
     * リスナー登録
     */
    static staticInitialize() {
        // call onCreate
        this.onPageStateChangeListeners.forEach((listener) => {
            if (!listener.createCalled) {
                listener.onCreate(location.href);
                listener.createCalled = true;
            }
        });
        // call onDesoroy
        $(() => {
            $(window).on("beforeunload", () => {
                this.onPageStateChangeListeners.forEach((listener) => {
                    listener.onDestroy(location.href);
                });
            });
        });
    }
}
exports.URLSystem = URLSystem;
/**
 * URL変更リスナーコールバック
 */
URLSystem.OnPageStateChangeListener = class {
    constructor() {
        /**
         * onCreateが呼ばれたかどうか
         *
         */
        this.createCalled = false;
    }
    /**
     * ページ作成時に発火します
     * @param url {string} 作成されたURL
     */
    onCreate(url) {
        throw "Listener method must be overridden.";
    }
    /**
     * ページ破棄時に発火します
     * @param url {string} 破棄される時のURL
     */
    onDestroy(url) {
        throw "Listener method must be overridden.";
    }
};
/**
 * リスナー配列
 *
 * @static
 * @memberof URLSystem
 */
URLSystem.onPageStateChangeListeners = [];
URLSystem.staticInitialize();
/**
 *このクラスは、ハッシュ操作の静的メソッドを提供します。
 *
 * @class Hash
 */
class Hash {
    /**
     * ハッシュを履歴に残さずに書き換えます。
     *
     * @static
     * @param {string} newHash 書き換えるハッシュ
     * @memberof Hash
     */
    static replace(newHash) {
        history.replaceState(null, "", "#" + newHash);
        $(window).trigger("hashchange");
    }
    /**
     * ハッシュを履歴に残して書き換えます。
     *
     * @static
     * @param {string} newHash 書き換えるハッシュ
     * @memberof Hash
     */
    static push(newHash) {
        history.pushState(null, "", "#" + newHash);
        $(window).trigger("hashchange");
    }
    /**
     * アドレスバーに存在するハッシュを書き換えます。
     *
     * @static
     * @return {string} アドレスバーに存在するハッシュ
     * @memberof Hash
     */
    static get() {
        return location.hash.substring(1);
    }
}
exports.Hash = Hash;
/**
 * このクラスは、URLのハッシュ部分に関する実装を提供します。
 *
 * @class HashSystem
 */
class HashSystem {
    /**
     * ハッシュ変更リスナーを追加します。
     *
     * @static
     * @param {HashSystem.OnPageStateChangeListener} listener
     * @memberof HashSystem
     */
    static addOnHashChangeListener(listener) {
        this.onHashChangeListeners.push(listener);
    }
    /**
     *ハッシュ変更リスナーを削除します。
     * 指定されたリスナーが見つからなかった場合、無視されます。
     *
     * @static
     * @param {HashSystem.OnPageStateChangeListener} listener
     * @memberof HashSystem
     */
    static deleteOnHashChangeListener(listener) {
        this.onHashChangeListeners = this.onHashChangeListeners.filter((item) => item !== listener);
    }
    static staticInitialize() {
        $(window).on("hashchange", () => {
            let newHash = location.hash.substring(1);
            this.onHashChangeListeners.forEach((listener) => {
                listener.onChange(this.oldHash, newHash);
            });
            this.oldHash = newHash;
        });
        // URLSystem.addOnPageStateChangeListener(
        //   new (class extends URLSystem.OnPageStateChangeListener {
        //     /**
        //      * ページ作成時に発火します
        //      * @param url {string} 作成されたURL
        //      */
        //     onCreate(url) {
        //       // HashSystem._oldHash = location.hash.substring(1);
        //     }
        //     /**
        //      * ページ破棄時に発火します
        //      * @param url {string} 破棄される時のURL
        //      */
        //     onDestroy(url) {
        //       // do nothing ?
        //     }
        //   })()
        // );
    }
}
exports.HashSystem = HashSystem;
/**
 * このインターフェースは、ハッシュ変更のリスナーでし。
 *
 * @static
 * @memberof HashSystem
 */
HashSystem.OnHashChangeListener = class {
    /**
     * ハッシュ変更時に発火します。
     *
     * @param {string} oldHash 変更前のハッシュ
     * @param {string} newHash 現在のハッシュ
     */
    onChange(oldHash, newHash) {
        throw "Listener method must be overridden.";
    }
};
/**
 * ハッシュ変更リスナーのリストです。
 *
 * @static
 * @memberof HashSystem
 */
HashSystem.onHashChangeListeners = [];
/**
 * リスナーに渡す用の変更前のハッシュ
 *
 * @static
 * @memberof HashSystem
 */
HashSystem.oldHash = "";
HashSystem.staticInitialize();
/**
 * ページの状態保存に使用します。
 * 状態は決して暗号化されませんので、ユーザーに関する情報を格納しないでください。
 *
 * @class State
 */
class State {
    /**
     * Stateクラスのインスタンスをテキストから生成します。
     * このコンストラクタは、convertToTextメソッドと互換性があります。
     *
     *
     * @param {string} text 変換して格納するテキスト。JSON形式で記述される必要がある。
     * @memberof State
     */
    constructor(text) {
        try {
            if (text) {
                this.state = decodeURIComponent(text);
            }
            else {
                this.state = null;
            }
        }
        catch (e) {
            console.error(e);
            this.state = null;
        }
    }
    /**
     * インスタンスを復元可能なテキストに変換します。
     * インスタンスを復元する場合は、コンストラクタの引数に、このメソッドの戻り値を入れてください。
     *
     * @return {string} コンストラクタと互換性のあるテキスト。
     * @memberof State
     */
    convertToText() {
        if (this.state) {
            return encodeURIComponent(this.state);
        }
        else {
            return null;
        }
    }
}
exports.State = State;
/**
 * インナーのページに関するコールバックシステムを提供します。
 * このクラスは複数のインスタンスを同時に使えるように設計されていません。
 *
 * @class LevelPageSystem
 */
class LevelPageSystem {
    /**
     * LevelPageSystemはnewできません。
     * @memberof LevelPageSystem
     */
    constructor() {
        throw "This class cannot be instanced";
    }
    /**
     * レベルページコールバックを追加します。
     *
     * @static
     * @param {LevelPageSystem.Callback} levelPage 追加するコールバック
     * @memberof LevelPageSystem
     */
    static addCallback(levelPage) {
        this.levelPages.push(levelPage);
    }
    /**
     * レベルページコールバックを削除します。
     *
     * @static
     * @param {LevelPageSystem.Callback} levelPage 削除するコールバック
     * @memberof LevelPageSystem
     */
    static deleteCallback(levelPage) {
        this.levelPages = this.levelPages.filter((item) => item !== levelPage);
    }
    static staticInitialize() {
        // HashSystemのコールバック受け取る
        let listener = new (class extends HashSystem.OnHashChangeListener {
            /**
             * ハッシュ変更時に、何が変わったのかを検知してコールバックを呼び出します。
             *
             * @param {string} oldHash 変更前のハッシュ
             * @param {string} newHash 現在のハッシュ
             */
            onChange(oldHash, newHash) {
                // console.log("PAGE : \"" + oldHash + "\" --> \"" + newHash + "\"");
                let splitedOld = oldHash.split("/");
                let splitedNew = newHash.split("/");
                for (let i = 0; i < Math.max(splitedOld.length, splitedNew.length); i++) {
                    let currentNew = splitedNew[i];
                    let currentOld = splitedOld[i];
                    // LevelPageSystem._levelPages
                    if (!currentOld && currentNew) {
                        // 新しいページが追加された
                        LevelPageSystem.levelPages.forEach((callback) => {
                            callback.onCreate(i, currentNew);
                        });
                    }
                    else if (!currentNew && currentOld) {
                        // ページが削除された
                        LevelPageSystem.levelPages.forEach((callback) => {
                            callback.onDestroy(i);
                        });
                    }
                    else if (currentNew !== currentOld && currentNew && currentOld) {
                        // ページの状態が変更された
                        LevelPageSystem.levelPages.forEach((callback) => {
                            callback.onChangeState(i, currentOld, currentNew);
                        });
                    }
                }
            }
        })();
        HashSystem.addOnHashChangeListener(listener);
        /*LevelPageSystem.addCallback(new class extends LevelPageSystem.Callback {
                        onCreate(index, name) {
                            console.log("onCreate was called : " + index + " , \"" + name + "\"");
                        }
                        onDestroy(index) {
                            console.log("onDestroy was called : " + index);
                        }
                        onChangeState(index, oldState, newState) {
                            console.log("onChangeState was called : " + index + " , \"" + oldState + "\" --> \"" + newState + "\"");
                        }
                    });*/
    }
}
exports.LevelPageSystem = LevelPageSystem;
/**
 * インナーのページを表すクラスです。
 *
 * @class LevelPageSystem.Callback
 */
LevelPageSystem.Callback = class {
    /**
     * インナーのページ作成時に呼ばれます。
     * @param index 作成されたページのインデックス
     * @param name 作成されたページの名前
     * @memberof LevelPageSystem.Callback
     */
    onCreate(index, name) {
        throw "Call method must be overridden.";
    }
    /**
     * インナーのページ破棄時に呼ばれます。
     * @param index
     * @memberof LevelPageSystem.Callback
     */
    onDestroy(index) {
        throw "Call method must be overridden.";
    }
    /**
     * インナーのページの状態が外部から変更されたときに呼ばれます。
     * @param index
     * @memberof LevelPageSystem.Callback
     */
    onChangeState(index, oldState, newState) {
        throw "Call method must be overridden.";
    }
};
/**
 * このクラスが管理しているLevelPageSystem.Callbackのインスタンスを保持します。
 *
 * @static
 * @memberof LevelPageSystem
 */
LevelPageSystem.levelPages = [];
LevelPageSystem.staticInitialize();
class Fragment {
    constructor() {
        // package private ::
        this.manager = null;
        this.view = null;
    }
    // public ::
    onCreate() { }
    onViewCreated(view) { }
    onResume() { }
    onChangeState(oldState, newState) { }
    onPause() { }
    onDestroy() { }
    onSaveState(state) { }
    // final
    invalidateHash() {
        var _a;
        (_a = this.manager) === null || _a === void 0 ? void 0 : _a.invalidateHash();
    }
    escape() {
        var _a;
        (_a = this.manager) === null || _a === void 0 ? void 0 : _a.pop();
    }
    push(fragmentName) {
        var _a;
        (_a = this.manager) === null || _a === void 0 ? void 0 : _a.push(fragmentName);
    }
    replace(fragmentName) {
        var _a;
        (_a = this.manager) === null || _a === void 0 ? void 0 : _a.replace(fragmentName);
    }
    showOverlay() {
        var _a;
        (_a = this.manager) === null || _a === void 0 ? void 0 : _a.showOverlay();
    }
    hideOverlay() {
        var _a;
        (_a = this.manager) === null || _a === void 0 ? void 0 : _a.hideOverlay();
    }
    onStartManagement(manager) {
        this.manager = manager;
    }
}
exports.Fragment = Fragment;
class FragmentFactory {
    newFragment(fragmentName) {
        throw "Factory method must be implemented.";
    }
    getFragmentName(fragment) {
        throw "Factory method must be implemented.";
    }
}
exports.FragmentFactory = FragmentFactory;
class FragmentManager extends LevelPageSystem.Callback {
    constructor(view, fragmentFactory) {
        super();
        this.fragments = [];
        this.sync = new Utils.Synchronizer();
        this.shownOverlay = 0;
        this.view = view;
        this.overlay = $('<div class="full-overlay"></div>');
        this.overlay.appendTo(view);
        this.fragmentFactory = fragmentFactory;
        LevelPageSystem.addCallback(this);
        $(window).trigger("hashchange");
    }
    showOverlay() {
        this.shownOverlay++;
        // this._overlay.fadeIn();
        this.overlay.addClass("shown");
    }
    hideOverlay() {
        if (0 >= --this.shownOverlay) {
            // this._overlay.fadeOut();
            this.overlay.removeClass("shown");
        }
    }
    replace(fragmentName) {
        let splitedHash = FragmentManager.getSplitedHash();
        splitedHash.pop();
        splitedHash.push(fragmentName);
        Hash.push(splitedHash.join("/"));
    }
    push(fragmentName) {
        let splitedHash = FragmentManager.getSplitedHash();
        splitedHash.push(fragmentName);
        Hash.push(splitedHash.join("/"));
    }
    pop() {
        let splitedHash = FragmentManager.getSplitedHash();
        splitedHash.pop();
        Hash.push(splitedHash.join("/"));
    }
    static getSplitedHash() {
        let splitedHash = Hash.get().split("/");
        splitedHash = splitedHash.filter((element) => element);
        return splitedHash;
    }
    invalidateHash() {
        let ret = "";
        this.fragments.forEach((fragment) => {
            if (fragment) {
                ret += this.fragmentFactory.getFragmentName(fragment);
                let state = new State();
                fragment.onSaveState(state);
                let stateText = state.convertToText();
                if (stateText) {
                    ret += "-";
                    ret += stateText;
                }
                ret += "/";
            }
        });
        ret = ret.substring(0, ret.length - 1);
        Hash.push(ret);
    }
    invalidateFragments() {
        let originalHash = Hash.get();
        Hash.replace("");
        Hash.replace(originalHash);
    }
    onCreate(index, name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.showOverlay();
            yield this.sync.synchronized(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                let splitedName = name.split("-");
                let fragmentName = splitedName.splice(0, 1)[0];
                let fragmentState = splitedName.join("-");
                let currentFragment = this.fragments[index];
                if (this.fragments[index - 1]) {
                    (_a = this.fragments[index - 1]) === null || _a === void 0 ? void 0 : _a.onPause();
                }
                if (!currentFragment ||
                    this.fragmentFactory.getFragmentName(currentFragment) !== fragmentName) {
                    // ほかから作られたときは、まだ配列に追加されていない
                    currentFragment = this.fragments[index] =
                        this.fragmentFactory.newFragment(fragmentName);
                }
                (_b = this.fragments[index]) === null || _b === void 0 ? void 0 : _b.onStartManagement(this);
                yield ((_c = this.fragments[index]) === null || _c === void 0 ? void 0 : _c.onCreate());
                // ビューの作成
                let view = $('<div class="fragment"></div>');
                if (currentFragment)
                    currentFragment.view = view;
                view.appendTo(this.view);
                yield ((_d = this.fragments[index]) === null || _d === void 0 ? void 0 : _d.onViewCreated(view));
                yield ((_e = this.fragments[index]) === null || _e === void 0 ? void 0 : _e.onChangeState(new State(), new State(fragmentState)));
                yield ((_f = this.fragments[index]) === null || _f === void 0 ? void 0 : _f.onResume());
                yield Utils.Sleeper.sleep(50);
                view.addClass("shown");
            }));
            this.hideOverlay();
        });
    }
    onDestroy(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.showOverlay();
            yield this.sync.synchronized(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                // 残ってたら、onDestroyを読んでさよなら
                if (this.fragments[index]) {
                    yield ((_a = this.fragments[index]) === null || _a === void 0 ? void 0 : _a.onPause());
                    yield ((_c = (_b = this.fragments[index]) === null || _b === void 0 ? void 0 : _b.view) === null || _c === void 0 ? void 0 : _c.removeClass("shown"));
                    // アニメーション終わるの待ち
                    yield Utils.Sleeper.sleep(500);
                    yield ((_e = (_d = this.fragments[index]) === null || _d === void 0 ? void 0 : _d.view) === null || _e === void 0 ? void 0 : _e.remove());
                    yield ((_f = this.fragments[index]) === null || _f === void 0 ? void 0 : _f.onDestroy());
                    this.fragments[index] = null;
                }
                if (this.fragments[index - 1] !== null) {
                    yield ((_g = this.fragments[index - 1]) === null || _g === void 0 ? void 0 : _g.onResume());
                }
            }));
            this.hideOverlay();
        });
    }
    onChangeState(index, oldName, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            // とりあえず、分けておく
            let splitedOld = oldName.split("-");
            let fragmentOldName = splitedOld.splice(0, 1)[0];
            let fragmentOldState = splitedOld.join("-");
            let splitedNew = newName.split("-");
            let fragmentNewName = splitedNew.splice(0, 1)[0];
            let fragmentNewState = splitedNew.join("-");
            let currentFragment = this.fragments[index];
            if (currentFragment &&
                this.fragmentFactory.getFragmentName(currentFragment) === fragmentNewName) {
                // フラグメントがすでに生成されていた場合
                yield currentFragment.onChangeState(new State(fragmentOldState), new State(fragmentNewState));
            }
            else {
                // フラグメントごと取り換えられていた場合
                if (currentFragment) {
                    this.onDestroy(index);
                    this.onCreate(index, newName);
                }
            }
        });
    }
}
exports.FragmentManager = FragmentManager;
class AjaxFragment extends Fragment {
    constructor(ajaxURL) {
        super();
        this.url = ajaxURL;
    }
    onViewCreated(view) {
        let deferred = $.Deferred();
        view.load(this.url, (response, status) => {
            if (status !== "success") {
                view.html(response);
            }
            deferred.resolve();
        });
        return deferred.promise();
    }
}
exports.AjaxFragment = AjaxFragment;
class ToastUtils {
    static showToast(message) {
        $("#toast").toast("hide");
        $("#toast-body").html(message);
        $("#toast").toast("show");
    }
}
exports.ToastUtils = ToastUtils;
