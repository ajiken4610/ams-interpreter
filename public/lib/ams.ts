class StringIterator implements Iterator<string> {
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
        nest: string
    ): { detected: string; value: string } {
        return { detected: "", value: "" };
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
    public static Sentence = class {
        public static Invokable = class {
            public constructor(iterator: StringIterator) {
                // AAとか/AAとか:とか{...}とかがiteratorに流れてくる
            }
            public invoke(
                last: AbsAMSObject,
                variables: AMSVariableMap<AbsAMSObject>
            ): AbsAMSObject {
                throw "This method must be implemented.";
            }
        };
        private invokables: InstanceType<
            typeof AbsAMSObject.Sentence.Invokable
        >[] = [];
        public constructor(iterator: StringIterator) {
            // AA:BB とか AA{...Arguments...}BBとかがiteratorに流れてくる
        }
        public invoke(variables: AMSVariableMap<AbsAMSObject>): AbsAMSObject {
            // TODO 実装
            return new (class extends AbsAMSObject {
                public invoke(
                    argument: InstanceType<typeof AbsAMSObject.Arguments>,
                    variables: AMSVariableMap<AbsAMSObject>
                ) {
                    return this;
                }
                public toHtml(): string {
                    return "";
                }
            })();
        }
    };
    public static Arguments = class {
        private notLoaded: (string | null)[] = [];
        private loaded: InstanceType<typeof AbsAMSObject.Sentence>[];
        public constructor(iterator: StringIterator) {
            // {AA;BB;CC}とかがiteratorに流れてくる
            let nestCount = 0;
            let currentSentence = "";
            let sentences = [];
            while (iterator.hasNext() && nestCount >= 0) {
                let current = iterator.next().value;
                if (current === "{") {
                    nestCount++;
                }
                if (current === "}") {
                    nestCount--;
                }
                if (current === ";" && nestCount === 0) {
                    sentences.push(currentSentence);
                    currentSentence = "";
                } else {
                    currentSentence += current;
                }
            }
            sentences.push(currentSentence);
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
