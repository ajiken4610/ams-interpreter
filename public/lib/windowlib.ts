import * as Utils from "./utils";

import "bootstrap";

/**
 * このクラスは、URLに関する静的な機能を提供します。
 */
export class URLUtilities {
  /**
   * URLを履歴に残さず書き換えます。
   * @param newURL {string} 書き換えるURL
   */
  static replace(newURL: string) {
    history.replaceState(null, "", newURL);
  }

  /**
   * URLを履歴を残して書き換えます。
   * @param newURL {string} 書き換えるURL
   */
  static push(newURL: string) {
    history.pushState(null, "", newURL);
  }

  /**
   * アドレスバーにあるURLを返します
   * @return {string} アドレスバーに存在するURL
   */
  static get(): string {
    return location.href;
  }

  /**
   * ページを再読み込みします。
   */
  static reload() {
    location.reload();
  }
}

/**
 * このクラスは、URLに関する実装を提供します。
 */
export class URLSystem {
  /**
   * URL変更リスナーコールバック
   */
  public static OnPageStateChangeListener = class {
    /**
     * onCreateが呼ばれたかどうか
     *
     */
    createCalled = false;

    /**
     * ページ作成時に発火します
     * @param url {string} 作成されたURL
     */
    onCreate(url: string) {
      throw "Listener method must be overridden.";
    }

    /**
     * ページ破棄時に発火します
     * @param url {string} 破棄される時のURL
     */
    onDestroy(url: string) {
      throw "Listener method must be overridden.";
    }
  };

  /**
   * リスナー配列
   *
   * @static
   * @memberof URLSystem
   */
  static onPageStateChangeListeners: InstanceType<
    typeof URLSystem.OnPageStateChangeListener
  >[] = [];

  /**
   * ページの状態変更リスナーを追加
   *
   * @static
   * @param {URLSystem.OnPageStateChangeListener} listener 追加するリスナー
   * @memberof URLSystem
   */
  static addOnPageStateChangeListener(
    listener: InstanceType<typeof URLSystem.OnPageStateChangeListener>
  ) {
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
  static deleteOnPageStateChangeListener(
    listener: InstanceType<typeof URLSystem.OnPageStateChangeListener>
  ) {
    this.onPageStateChangeListeners = this.onPageStateChangeListeners.filter(
      (item) => item !== listener
    );
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
    $(window).on("beforeunload", () => {
      this.onPageStateChangeListeners.forEach((listener) => {
        listener.onDestroy(location.href);
      });
    });
  }
}
URLSystem.staticInitialize();

/**
 *このクラスは、ハッシュ操作の静的メソッドを提供します。
 *
 * @class Hash
 */
export class Hash {
  /**
   * ハッシュを履歴に残さずに書き換えます。
   *
   * @static
   * @param {string} newHash 書き換えるハッシュ
   * @memberof Hash
   */
  public static replace(newHash: string) {
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
  public static push(newHash: string) {
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
  public static get(): string {
    return location.hash.substring(1);
  }
}

/**
 * このクラスは、URLのハッシュ部分に関する実装を提供します。
 *
 * @class HashSystem
 */
export class HashSystem {
  /**
   * このインターフェースは、ハッシュ変更のリスナーでし。
   *
   * @static
   * @memberof HashSystem
   */
  public static OnHashChangeListener = class {
    /**
     * ハッシュ変更時に発火します。
     *
     * @param {string} oldHash 変更前のハッシュ
     * @param {string} newHash 現在のハッシュ
     */
    onChange(oldHash: string, newHash: string) {
      throw "Listener method must be overridden.";
    }
  };

  /**
   * ハッシュ変更リスナーのリストです。
   *
   * @static
   * @memberof HashSystem
   */
  private static onHashChangeListeners: InstanceType<
    typeof HashSystem.OnHashChangeListener
  >[] = [];

  /**
   * ハッシュ変更リスナーを追加します。
   *
   * @static
   * @param {HashSystem.OnPageStateChangeListener} listener
   * @memberof HashSystem
   */
  public static addOnHashChangeListener(
    listener: InstanceType<typeof HashSystem.OnHashChangeListener>
  ) {
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
  public static deleteOnHashChangeListener(
    listener: InstanceType<typeof HashSystem.OnHashChangeListener>
  ) {
    this.onHashChangeListeners = this.onHashChangeListeners.filter(
      (item) => item !== listener
    );
  }

  /**
   * リスナーに渡す用の変更前のハッシュ
   *
   * @static
   * @memberof HashSystem
   */
  private static oldHash = "";

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
HashSystem.staticInitialize();

/**
 * ページの状態保存に使用します。
 * 状態は決して暗号化されませんので、ユーザーに関する情報を格納しないでください。
 *
 * @class State
 */
export class State {
  /**
   * Stateクラスのインスタンスをテキストから生成します。
   * このコンストラクタは、convertToTextメソッドと互換性があります。
   *
   *
   * @param {string} text 変換して格納するテキスト。JSON形式で記述される必要がある。
   * @memberof State
   */
  constructor(text?: string | null | undefined) {
    try {
      if (text) {
        this.state = decodeURIComponent(text);
      } else {
        this.state = null;
      }
    } catch (e) {
      console.error(e);
      this.state = null;
    }
  }

  /**
   * 状態を表します。
   *
   * @memberof State
   */
  state;

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
    } else {
      return null;
    }
  }
}

/**
 * インナーのページに関するコールバックシステムを提供します。
 * このクラスは複数のインスタンスを同時に使えるように設計されていません。
 *
 * @class LevelPageSystem
 */
export class LevelPageSystem {
  /**
   * インナーのページを表すクラスです。
   *
   * @class LevelPageSystem.Callback
   */
  public static Callback = class {
    /**
     * インナーのページ作成時に呼ばれます。
     * @param index 作成されたページのインデックス
     * @param name 作成されたページの名前
     * @memberof LevelPageSystem.Callback
     */
    onCreate(index: number, name: string) {
      throw "Call method must be overridden.";
    }

    /**
     * インナーのページ破棄時に呼ばれます。
     * @param index
     * @memberof LevelPageSystem.Callback
     */
    onDestroy(index: number) {
      throw "Call method must be overridden.";
    }

    /**
     * インナーのページの状態が外部から変更されたときに呼ばれます。
     * @param index
     * @memberof LevelPageSystem.Callback
     */
    onChangeState(index: number, oldState: string, newState: string) {
      throw "Call method must be overridden.";
    }
  };

  /**
   * LevelPageSystemはnewできません。
   * @memberof LevelPageSystem
   */
  constructor() {
    throw "This class cannot be instanced";
  }

  /**
   * このクラスが管理しているLevelPageSystem.Callbackのインスタンスを保持します。
   *
   * @static
   * @memberof LevelPageSystem
   */
  static levelPages: InstanceType<typeof LevelPageSystem.Callback>[] = [];

  /**
   * レベルページコールバックを追加します。
   *
   * @static
   * @param {LevelPageSystem.Callback} levelPage 追加するコールバック
   * @memberof LevelPageSystem
   */
  static addCallback(levelPage: InstanceType<typeof LevelPageSystem.Callback>) {
    this.levelPages.push(levelPage);
  }

  /**
   * レベルページコールバックを削除します。
   *
   * @static
   * @param {LevelPageSystem.Callback} levelPage 削除するコールバック
   * @memberof LevelPageSystem
   */
  static deleteCallback(
    levelPage: InstanceType<typeof LevelPageSystem.Callback>
  ): void {
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
      onChange(oldHash: string, newHash: string) {
        // console.log("PAGE : \"" + oldHash + "\" --> \"" + newHash + "\"");
        let splitedOld = oldHash.split("/");
        let splitedNew = newHash.split("/");
        for (
          let i = 0;
          i < Math.max(splitedOld.length, splitedNew.length);
          i++
        ) {
          let currentNew = splitedNew[i];
          let currentOld = splitedOld[i];
          // LevelPageSystem._levelPages
          if (!currentOld && currentNew) {
            // 新しいページが追加された
            LevelPageSystem.levelPages.forEach((callback) => {
              callback.onCreate(i, currentNew);
            });
          } else if (!currentNew && currentOld) {
            // ページが削除された
            LevelPageSystem.levelPages.forEach((callback) => {
              callback.onDestroy(i);
            });
          } else if (currentNew !== currentOld && currentNew && currentOld) {
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
LevelPageSystem.staticInitialize();

export class Fragment {
  // public ::
  public onCreate(): Promise<any> | any {}
  public onViewCreated(view: JQuery): Promise<any> | any {}
  public onResume(): Promise<any> | any {}
  public onChangeState(oldState: State, newState: State): Promise<any> | any {}
  public onPause(): Promise<any> | any {}
  public onDestroy(): Promise<any> | any {}
  public onSaveState(state: State): Promise<any> | any {}

  // final
  protected invalidateHash(): void {
    this.manager?.invalidateHash();
  }

  protected escape(): void {
    this.manager?.pop();
  }

  protected push(fragmentName: string): void {
    this.manager?.push(fragmentName);
  }

  protected replace(fragmentName: string): void {
    this.manager?.replace(fragmentName);
  }

  protected showOverlay(): void {
    this.manager?.showOverlay();
  }

  protected hideOverlay(): void {
    this.manager?.hideOverlay();
  }

  // package private ::
  manager: FragmentManager | null = null;
  view: JQuery | null = null;
  onStartManagement(manager: FragmentManager): void {
    this.manager = manager;
  }
}

export abstract class FragmentFactory {
  abstract newFragment(fragmentName: string): Fragment;
  abstract getFragmentName(fragment: Fragment): string;
}

export class FragmentManager extends LevelPageSystem.Callback {
  private fragments: Fragment[] | null[] = [];
  private fragmentFactory: FragmentFactory;
  private view: JQuery;
  private overlay: JQuery;
  private sync = new Utils.Synchronizer();

  constructor(view: JQuery, fragmentFactory: FragmentFactory) {
    super();
    this.view = view;
    this.overlay = $('<div class="full-overlay"></div>');
    this.overlay.appendTo(view);
    this.fragmentFactory = fragmentFactory;

    LevelPageSystem.addCallback(this);
    $(window).trigger("hashchange");
  }

  private shownOverlay: number = 0;
  showOverlay(): void {
    this.shownOverlay++;
    // this._overlay.fadeIn();
    this.overlay.addClass("shown");
  }

  hideOverlay(): void {
    if (0 >= --this.shownOverlay) {
      // this._overlay.fadeOut();
      this.overlay.removeClass("shown");
    }
  }

  replace(fragmentName: string): void {
    let splitedHash = FragmentManager.getSplitedHash();
    splitedHash.pop();
    splitedHash.push(fragmentName);
    Hash.push(splitedHash.join("/"));
  }

  push(fragmentName: string): void {
    let splitedHash = FragmentManager.getSplitedHash();
    splitedHash.push(fragmentName);
    Hash.push(splitedHash.join("/"));
  }

  pop(): void {
    let splitedHash = FragmentManager.getSplitedHash();
    splitedHash.pop();
    Hash.push(splitedHash.join("/"));
  }

  static getSplitedHash(): string[] {
    let splitedHash = Hash.get().split("/");
    splitedHash = splitedHash.filter((element) => element);
    return splitedHash;
  }

  invalidateHash(): void {
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

  async onCreate(index: number, name: string) {
    this.showOverlay();

    await this.sync.synchronized(async () => {
      let splitedName = name.split("-");
      let fragmentName = splitedName.splice(0, 1)[0];
      let fragmentState = splitedName.join("-");
      let currentFragment = this.fragments[index];
      if (this.fragments[index - 1]) {
        this.fragments[index - 1]?.onPause();
      }
      if (
        !currentFragment ||
        this.fragmentFactory.getFragmentName(currentFragment) !== fragmentName
      ) {
        // ほかから作られたときは、まだ配列に追加されていない
        currentFragment = this.fragments[index] =
          this.fragmentFactory.newFragment(fragmentName);
      }
      this.fragments[index]?.onStartManagement(this);
      await this.fragments[index]?.onCreate();
      // ビューの作成
      let view = $('<div class="fragment"></div>');
      if (currentFragment) currentFragment.view = view;
      view.appendTo(this.view);
      await this.fragments[index]?.onViewCreated(view);
      await this.fragments[index]?.onChangeState(
        new State(),
        new State(fragmentState)
      );
      await this.fragments[index]?.onResume();
      await Utils.Sleeper.sleep(50);
      view.addClass("shown");
    });

    this.hideOverlay();
  }

  async onDestroy(index: number) {
    this.showOverlay();

    await this.sync.synchronized(async () => {
      // 残ってたら、onDestroyを読んでさよなら
      if (this.fragments[index]) {
        await this.fragments[index]?.onPause();
        await this.fragments[index]?.view?.removeClass("shown");

        // アニメーション終わるの待ち
        await Utils.Sleeper.sleep(500);

        await this.fragments[index]?.view?.remove();
        await this.fragments[index]?.onDestroy();
        this.fragments[index] = null;
      }
      if (this.fragments[index - 1] !== null) {
        await this.fragments[index - 1]?.onResume();
      }
    });

    this.hideOverlay();
  }

  async onChangeState(index: number, oldName: string, newName: string) {
    // とりあえず、分けておく
    let splitedOld = oldName.split("-");
    let fragmentOldName = splitedOld.splice(0, 1)[0];
    let fragmentOldState = splitedOld.join("-");
    let splitedNew = newName.split("-");
    let fragmentNewName = splitedNew.splice(0, 1)[0];
    let fragmentNewState = splitedNew.join("-");

    let currentFragment = this.fragments[index];

    if (
      currentFragment &&
      this.fragmentFactory.getFragmentName(currentFragment) === fragmentNewName
    ) {
      // フラグメントがすでに生成されていた場合
      await currentFragment.onChangeState(
        new State(fragmentOldState),
        new State(fragmentNewState)
      );
    } else {
      // フラグメントごと取り換えられていた場合
      if (currentFragment) {
        this.onDestroy(index);
        this.onCreate(index, newName);
      }
    }
  }
}

export class AjaxFragment extends Fragment {
  private url: string;
  constructor(ajaxURL: string) {
    super();
    this.url = ajaxURL;
  }

  onViewCreated(view: JQuery) {
    let deferred = $.Deferred();
    view.load(this.url, (response: string, status: string) => {
      if (status !== "success") {
        view.html(response);
      }
      deferred.resolve();
    });
    return deferred.promise();
  }
}

export class ToastUtils {
  static showToast(message: string) {
    $("#toast").toast("hide");
    $("#toast-body").html(message);
    $("#toast").toast("show");
  }
}
