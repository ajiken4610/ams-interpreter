export class StringIterator implements Iterator<string> {
    private index = 0;
    private src: string;
    /**
     * ソースを指定してイテレータを初期化します。
     * @param {string} src
     * @memberof StringIterator
     */
    public constructor(src: string) {
        this.src = src;
    }
    public next() {
        return this.hasNext()
            ? {
                  done: false,
                  value: this.src.charAt(this.index++),
              }
            : {
                  done: true,
                  value: "",
              };
    }
    public hasNext() {
        return this.src.length > this.index;
    }
    public readBeforeChar(detect: string): {
        detected: string;
        value: string;
    } {
        let value = "";
        while (this.hasNext()) {
            let current = this.next().value;
            for (var i = 0; i < detect.length; i++)
                if (current === detect.charAt(i)) {
                    return {
                        detected: current,
                        value: value,
                    };
                }
            value += current;
        }
        return { detected: "", value: value };
    }
    public readBeforeCharWithNest(
        detect: string,
        nest: string,
        detectContainNest?: false | true,
        inNest?: false | true
    ): { detected: string; value: string } {
        let symboles = detect + nest;
        let nestStart = nest.charAt(0);
        let nestEnd = nest.charAt(1);
        let nestCount = inNest ? 1 : 0;
        let ret = "";

        while (this.hasNext()) {
            if (nestCount > 0) {
                let current = this.readBeforeChar(nest);
                if (current.detected === nestStart) nestCount++;
                if (current.detected === nestEnd) {
                    if (--nestCount === 0 && inNest) {
                        return {
                            detected: current.detected,
                            value: ret + current.value,
                        };
                    }
                }
                ret += current.value + current.detected;
            } else {
                let current = this.readBeforeChar(symboles);
                // console.log(`detected: "${current.detected}"`);
                if (current.detected === nestStart) {
                    if (detectContainNest) {
                        return {
                            detected: nestStart,
                            value: ret + current.value,
                        };
                    } else {
                        nestCount++;
                    }
                } else if (current.detected === nestEnd) {
                    return {
                        detected: nestEnd,
                        value: ret + current.value,
                    };
                } else {
                    return {
                        detected: current.detected,
                        value: ret + current.value,
                    };
                }
                ret += current.value + current.detected;
            }
        }
        return { detected: "", value: ret };

        // while (this.hasNext() && nestCount >= 0) {
        //     let current = this.readBeforeChar(
        //         nestCount === 0 ? symboles : nest
        //     );
        //     ret += current.value;
        //     if (current.detected === nestStart) {
        //         // ネストの始まりなら
        //         ret += nestStart;
        //         nestCount++;
        //     } else if (current.detected === nestEnd) {
        //         // ネストの終わりなら
        //         ret += nestEnd;
        //         nestCount--;
        //     } else if (nestCount === 0) {
        //         // 文の切れ目なら => RETURN
        //         return { detected: current.detected, value: ret };
        //     }
        // }
        // return { detected: "}", value: ret };
    }
}

export class AMSVariableMap<T> {
    private map;
    private parent: AMSVariableMap<T> | null;
    public constructor(parent?: AMSVariableMap<T>) {
        this.map = parent ? Object.create(parent.getMap()) : {};
        this.parent = parent ?? null;
    }
    public has(name: string): boolean {
        return name in this.map;
    }
    public get(name: string): T {
        return this.map[name];
    }
    public set(name: string, object: T): void {
        if (this.parent?.has(name)) {
            this.parent.set(name, object);
        } else {
            this.map[name] = object;
        }
    }
    public setAsOwn(name: string, object: T): void {
        this.map[name] = object;
    }
    private getMap(): {} {
        return this.map;
    }
    public toString(): string {
        return "VariableMap: " + JSON.stringify(this, null, 2);
    }
}

class StackTrace {
    private position: any[];
    public constructor(position: any[]) {
        this.position = position;
    }
    public toString(): string {
        return `\tat (${this.position.join(":")})`;
    }
}

class AMSException {
    protected name: string;
    private message: string;
    private trace: StackTrace[];
    public constructor(name: string, message: string) {
        this.name = name;
        this.message = message;
        this.trace = [];
    }
    public addStackTrace(trace: StackTrace): void {
        this.trace.push(trace);
    }
    public getStackTraceString(): string {
        let traceStrings = [];
        for (let i = 0; i < this.trace.length; i++) {
            traceStrings.push(this.trace[i].toString());
        }
        return this.name + ":" + this.message + "\n" + traceStrings.join("\n");
    }
    public getStackTraces(): StackTrace[] {
        return this.trace;
    }
}

/**
 * 抽象的なAMSのオブジェクトを表すクラスです。
 *
 * @export
 * @abstract
 * @class AbsAMSObject
 */
export abstract class AbsAMSObject {
    public static Invokable = class {
        public invoke(variables: AMSVariableMap<AbsAMSObject>): AbsAMSObject {
            throw "This method must be implemented.";
        }
    };
    public static VariableInvokable = class {
        public value: string;
        public constructor(value: string) {
            //super();
            this.value = value;
        }
        public invoke(variables: AMSVariableMap<AbsAMSObject>): AbsAMSObject {
            let value = this.value;
            return new (class extends AbsAMSObject {
                public invoke(
                    argument: InstanceType<typeof AbsAMSObject.Arguments>,
                    variables: AMSVariableMap<AbsAMSObject>
                ): AbsAMSObject {
                    if (argument.length === 0) {
                        // 取得only
                        if (variables.has(value)) {
                            return variables.get(value);
                        } else {
                            let nullValue = AbsAMSObject.NULL;
                            variables.set(value, nullValue);
                            return nullValue;
                        }
                    } else {
                        // 代入
                        let invoked = argument.invokeAt(0, variables);
                        variables.set(value, invoked);
                        return invoked;
                    }
                }
                public finalInvoke(variables: AMSVariableMap<AbsAMSObject>) {
                    return this.invoke(
                        new AbsAMSObject.Arguments(new StringIterator("")),
                        variables
                    );
                }
                public toHtml(): string {
                    return "";
                }
            })();
        }
    };
    public static Sentence = class {
        private invokables: InstanceType<typeof AbsAMSObject.Invokable>[] = [];
        public constructor(iterator: StringIterator) {
            // AA:BB とか AA{...Arguments...}BBとかがiteratorに流れてくる

            // AA => 文字列
            // /AA => 変数
            // : => 引数なし呼び出し
            // {...} => Argumentsを引数として呼び出し
            let last = "";
            console.log("=\t=\t=\t=");
            while (iterator.hasNext()) {
                let current = iterator.readBeforeCharWithNest(
                    "/:",
                    "{}",
                    true,
                    last === "{"
                );
                // console.log(current);
                if (last === "}") last = "";
                let value = current.value;
                if (last === "/") {
                    // 変数
                    this.invokables.push(
                        new AbsAMSObject.VariableInvokable(value)
                    );
                    console.log("変数\t\t\t" + last + value);
                } else if (last === ":") {
                    // 呼び出し(引数なし)
                    console.log("省略呼び出し\t" + last + value);
                } else if (last === "{") {
                    // 呼び出し(引数あり)
                    console.log(
                        "通常呼び出し\t" + last + value + current.detected
                    );
                } else if (value.length > 0) {
                    // 文字列、文字列呼び出し
                    console.log("文字列\t\t\t" + last + value);
                }
                last = current.detected;
            }
        }
        /**
         *
         *
         * @param {AMSVariableMap<AbsAMSObject>} variables
         * @return {AbsAMSObject}
         */
        public invoke(variables: AMSVariableMap<AbsAMSObject>): AbsAMSObject {
            // TODO 実装
            console.log("=========================invoked");
            console.log(this.invokables);
            let invokables = this.invokables;
            if (invokables.length === 0) return AbsAMSObject.NULL;
            let last = invokables[0].invoke(variables);
            // 前から順番に呼び出していく
            for (var i = 0; i < invokables.length - 1; i++) {
                // last = last.invoke(i+1番目)
                console.log(i);
                last = last.invoke();
            }
            return AbsAMSObject.NULL;
        }
    };
    public static Arguments = class {
        private notLoaded: (string | null)[] = [];
        private loaded: InstanceType<typeof AbsAMSObject.Sentence>[];
        public constructor(iterator: StringIterator) {
            // AA;BB;CCとかがiteratorに流れてくる
            let sentences = [];
            while (iterator.hasNext()) {
                sentences.push(
                    iterator.readBeforeCharWithNest(";", "{}").value
                );
            }
            this.notLoaded = sentences;
            this.loaded = Array(sentences.length);
        }
        public invokeAt(
            index: number,
            variables: AMSVariableMap<AbsAMSObject>
        ): AbsAMSObject {
            let toLoad;
            if (!this.loaded[index] && (toLoad = this.notLoaded[index])) {
                // メモ化されていないとき
                // let toLoad = this.notLoaded[index];
                this.loaded[index] = new AbsAMSObject.Sentence(
                    new StringIterator(toLoad)
                );
                this.notLoaded[index] = null;
            }
            return this.loaded[index].invoke(variables);
        }
        public get length(): number {
            return this.loaded.length;
        }
    };

    public static NULL: AbsAMSObject = new (class extends AbsAMSObject {
        public invoke(
            argument: InstanceType<typeof AbsAMSObject.Arguments>,
            variables: AMSVariableMap<AbsAMSObject>
        ): AbsAMSObject {
            return this;
        }
        public toHtml(): string {
            return "null";
        }
    })();
    public load(
        iterator: StringIterator,
        variables: AMSVariableMap<AbsAMSObject>
    ): AbsAMSObject {
        let argument = new AbsAMSObject.Arguments(iterator);
        let childVariables = new AMSVariableMap<AbsAMSObject>(variables);
        return this.invoke(argument, childVariables);
    }

    protected abstract invoke(
        argument: InstanceType<typeof AbsAMSObject.Arguments>,
        variables: AMSVariableMap<AbsAMSObject>
    ): AbsAMSObject;

    protected finalInvoke(
        variables: AMSVariableMap<AbsAMSObject>
    ): AbsAMSObject {
        return this;
    }

    public abstract toHtml(): string;

    public toString(): string {
        return JSON.stringify(this, null, 2);
    }
}

export class AMSParser {
    private static symbols = "{};:/";
    private static ignores = " \n";
    private static isSymbol(char: string): boolean {
        for (var i = 0; i < this.symbols.length; i++) {
            if (char === this.symbols[i]) {
                return true;
            }
        }
        return false;
    }
    private static isIgnore(char: string): boolean {
        for (var i = 0; i < this.ignores.length; i++) {
            if (char === this.ignores[i]) {
                return true;
            }
        }
        return false;
    }
    public static parseAMS(ams: string): AbsAMSObject {
        let iterator = new StringIterator(ams);
        let last = "{";
        let ignored = false;
        let formatted = "";
        while (iterator.hasNext()) {
            let current = iterator.next().value;

            if (AMSParser.isIgnore(current)) {
                // 無視する文字
                ignored = true;
            } else {
                // 普通の文字
                if (ignored) {
                    // 無視している途中なら
                    ignored = false;
                    if (
                        !AMSParser.isSymbol(current) &&
                        !AMSParser.isSymbol(last)
                    ) {
                        // どちらもシンボルではない　＝＞　空白1つ
                        formatted += " ";
                    }
                }
                formatted += current;
                last = current;
            }
        }
        return new AMSSpan().load(
            new StringIterator(formatted),
            new AMSVariableMap<AbsAMSObject>()
        );
    }
}

class AMSSpan extends AbsAMSObject {
    private result: AbsAMSObject[] = [];
    protected invoke(
        argument: InstanceType<typeof AbsAMSObject.Arguments>,
        variables: AMSVariableMap<AbsAMSObject>
    ): AbsAMSObject {
        let parentVariables = new AMSVariableMap(variables);
        this.result = Array(argument.length);
        for (var i = 0; i < argument.length; i++) {
            this.result[i] = argument.invokeAt(i, parentVariables);
        }
        return this;
    }
    public toHtml(): string {
        let ret = "";
        for (var i = 0; i < this.result.length; i++) {
            ret += this.result[i].toHtml();
        }
        return ret;
    }
}
