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
            this.parent?.set(name, object);
        } else {
            this.map[name] = object;
        }
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
    public static Arguments = class {
        private notLoad: string[] = [];
        private load: {
            object: AbsAMSObject;
            argument: InstanceType<typeof AbsAMSObject.Arguments>;
        }[];
        private variables: AMSVariableMap<AbsAMSObject>;
        public constructor(
            iterator: StringIterator,
            variables: AMSVariableMap<AbsAMSObject>
        ) {
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
            this.notLoad = sentences;
            this.load = Array(sentences.length);
            this.variables = variables;
        }
        public invokeAt(index: number): AbsAMSObject {
            if (!this.load[index]) {
                // メモ化されていないとき
                // TODO メモ化！！
                let current = this.notLoad[index];

                this.load[index] = {
                    object: new (class extends AbsAMSObject {
                        public toHtml() {
                            return "";
                        }
                        public invoke(
                            argument: InstanceType<
                                typeof AbsAMSObject.Arguments
                            >
                        ) {
                            return this;
                        }
                    })(),
                    argument: new AbsAMSObject.Arguments(
                        new StringIterator(""),
                        new AMSVariableMap(this.variables)
                    ),
                };
            }
            let current = this.load[index];
            return current.object.invoke(current.argument);
        }
        public get length(): number {
            return this.load.length;
        }
    };
    public load(
        iterator: StringIterator,
        variables: AMSVariableMap<AbsAMSObject>
    ): AbsAMSObject {
        return this.invoke(new AbsAMSObject.Arguments(iterator, variables));
    }

    protected abstract invoke(
        argument: InstanceType<typeof AbsAMSObject.Arguments>
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

            if (!AMSParser.isIgnore(current)) {
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
            } else {
                // 無視する文字
                ignored = true;
            }
        }
        return new AMSSpan().load(
            new StringIterator(formatted),
            new AMSVariableMap<AbsAMSObject>()
        );
    }
}

class AMSSpan extends AbsAMSObject {
    protected invoke(
        argument: InstanceType<typeof AbsAMSObject.Arguments>
    ): AbsAMSObject {
        return this;
    }
    public toHtml(): string {
        return "";
    }
}
