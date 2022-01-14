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

    public readAll(): string {
        let index = this.index;
        this.index = this.src.length;
        return this.src.substring(index, this.src.length);
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

class StringUtils {
    public static repeat(str: string, count: number): string {
        let ret = "";
        for (var i = 0; i < count; i++) {
            ret += str;
        }
        return ret;
    }
}
export class ImportedNamespace {
    private imported: string[];
    public constructor(parent?: ImportedNamespace) {
        this.imported = parent ? parent.get().slice() : [];
    }
    public add(prefix: string): void {
        this.imported.push(prefix);
    }
    public get(): string[] {
        return this.imported;
    }
}
export class AMSVariableMap<T> {
    private map;
    private parent: AMSVariableMap<T> | null;
    private imported: ImportedNamespace;
    public constructor(
        parent?: AMSVariableMap<T>,
        imported?: ImportedNamespace
    ) {
        this.map = parent ? Object.create(parent.getMap()) : {};
        this.parent = parent ?? null;
        this.imported = imported ?? new ImportedNamespace();
    }
    public newScope() {
        return new AMSVariableMap<T>(this, this.imported);
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
    public getStructureString(): string {
        return "VariableMap: " + JSON.stringify(this, null, 2);
    }
}
export class ReservedWord {
    static NEST = "{}";
    static NEST_START = this.NEST.charAt(0);
    static NEST_END = this.NEST.charAt(1);
    static VARIABLE = "/";
    static INVOKE = ":";
    static SEPARATOR = ";";
}

export abstract class Invokable {
    public static NULL = new (class extends Invokable {
        public invoke(
            argument: Invokable,
            variables: AMSVariableMap<Invokable>
        ): Invokable {
            return this;
        }
        public getStructureString(indentOffset: string = ""): string {
            return indentOffset + "null\n";
        }
        private TAG = "NULL";
    })();
    private childs: Invokable[] = [];
    protected indenter = "|   ";

    public iterator() {
        let outerThis = this;
        let childs = this.childs;
        return new (class implements IterableIterator<Invokable> {
            private index = -1;
            public next(): IteratorResult<Invokable> {
                let current;
                let hasNext = (current = outerThis.getAt(++this.index))
                    ? true
                    : false;
                return {
                    done: !hasNext,
                    value: hasNext ? (current as Invokable) : Invokable.NULL,
                };
            }
            [Symbol.iterator](): IterableIterator<Invokable> {
                return this;
            }
        })();
    }
    /**
     * 次の要素を引数として呼び出されます。
     *
     * @abstract
     * @param {Invokable} argument 引数となる次の要素
     * @param {AMSVariableMap<Invokable>} variables 実行時に存在する変数
     * @return {Invokable} 呼び出した結果
     * @memberof Invokable
     */
    public abstract invoke(
        argument: Invokable,
        variables: AMSVariableMap<Invokable>
    ): Invokable;
    /**
     * 次の要素なしで呼び出されます。
     *
     * @param {AMSVariableMap<Invokable>} variables 実行時に存在する変数
     * @return {Invokable} 呼び出した結果
     * @memberof Invokable
     */
    public invokeFinal(variables: AMSVariableMap<Invokable>): Invokable {
        return this;
    }
    public getAt(index: number): Invokable | null {
        return this.childs[index];
    }
    public set(childs: Invokable[]): void {
        this.childs = childs;
    }
    public setAt(index: number, child: Invokable): void {
        this.childs[index] = child;
    }
    public append(child: Invokable): void {
        this.childs.push(child);
    }
    public abstract getStructureString(indentOffset?: string): string;
}

class Paragraph extends Invokable {
    private notLoaded: (string | null)[];
    public constructor(iterator: StringIterator) {
        super();
        // AA;BB;CCとかがiteratorに流れてくる
        let sentences = [];
        while (iterator.hasNext()) {
            sentences.push(
                iterator.readBeforeCharWithNest(
                    ReservedWord.SEPARATOR,
                    ReservedWord.NEST
                ).value
            );
        }
        this.notLoaded = sentences;
        this.set(Array(sentences.length));
    }

    public getAt(index: number): Invokable | null {
        let toLoad;
        if (!super.getAt(index) && (toLoad = this.notLoaded[index])) {
            this.setAt(
                index,
                new Invokable$Builder()
                    .setIterator(new StringIterator(toLoad))
                    .setType(Invokable$Type.SENTENCE)
                    .build()
            );
            this.notLoaded[index] = null;
        }
        return super.getAt(index);
    }
    public invoke(
        argument: Invokable,
        variables: AMSVariableMap<Invokable>
    ): Invokable {
        let scopedVariables = variables.newScope();
        for (let current of this.iterator()) {
            current.invoke(argument, scopedVariables);
        }
        return this;
    }
    public invokeFinal(variables: AMSVariableMap<Invokable>) {
        let scopedVariables = variables.newScope();
        for (let current of this.iterator()) {
            current.invokeFinal(scopedVariables);
        }
        return this;
    }
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        let result = "";
        let repeatedIndenter = indentOffset + indenter;
        for (var i = 0; i < this.notLoaded.length; i++) {
            let currentText = this.notLoaded[i];
            let child;
            if (currentText) {
                result += repeatedIndenter;
                result += currentText;
                result += "\n";
            } else if ((child = this.getAt(i))) {
                result += child.getStructureString(indentOffset + indenter);
            } else {
                result += Invokable.NULL.getStructureString();
            }
        }
        return `${indentOffset}Paragraph: {
${result}${indentOffset}}
`;
    }
}

class Sentence extends Invokable {
    protected indenter = "-   ";
    public constructor(iterator: StringIterator) {
        super();
        // AA:BB とか AA{...Arguments...}BBとかがiteratorに流れてくる
        // AA => 文字列
        // /AA => 変数
        // : => 引数なし呼び出し
        // {...} => Argumentsを引数として呼び出し
        let last = "";
        // console.log("=\t=\t=\t=");
        while (iterator.hasNext()) {
            let current = iterator.readBeforeCharWithNest(
                "/:",
                "{}",
                true,
                last === ReservedWord.NEST_START
            );
            // console.log(current);
            if (last === ReservedWord.NEST_END) last = "";
            let value = current.value;
            if (
                last === ReservedWord.VARIABLE ||
                last === ReservedWord.INVOKE ||
                last === ReservedWord.NEST_START ||
                value.length > 0
            ) {
                this.append(
                    new Invokable$Builder()
                        .setIterator(new StringIterator(last + value))
                        .setType(Invokable$Type.WORD)
                        .build()
                );
            }
            last = current.detected;
        }
    }
    public invoke(
        argument: Invokable,
        variables: AMSVariableMap<Invokable>
    ): Invokable {
        // sentenceにinvokeは呼ばれることはないはず。
        return this.invokeFinal(variables);
    }
    public invokeFinal(variables: AMSVariableMap<Invokable>): Invokable {
        let iterator = this.iterator();
        let iterated = iterator.next();
        if (!iterated.done) {
            let last = iterated.value;
            for (let current of iterator) {
                last = last.invoke(current, variables);
            }
            return last.invokeFinal(variables);
        } else {
            // この場合そもそもSentenceオブジェクトが生成されることはない
            return Invokable.NULL;
        }
    }
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        let result = indentOffset + "Sentence: \n";
        for (let current of this.iterator()) {
            result += current.getStructureString(indentOffset + indenter);
        }
        return result;
    }
}

abstract class Word extends Invokable {
    protected indenter = "+   ";
}

class Variable extends Word {
    private name;
    constructor(name: string) {
        super();
        this.name = name;
    }
    public invoke(
        argument: Invokable,
        variables: AMSVariableMap<Invokable>
    ): Invokable {
        let name = this.name;
        return new (class extends Invokable {
            public invoke(
                argument: Invokable,
                variables: AMSVariableMap<Invokable>
            ) {
                if (argument.iterator().next().done) {
                    if (variables.has(name)) {
                        // 宣言されてたら返し、
                        return variables.get(name);
                    } else {
                        // 宣言されてなかったらNULLを代入してNULL返し、
                        variables.set(name, Invokable.NULL);
                        return Invokable.NULL;
                    }
                } else {
                    // 代入
                    variables.set(name, argument);
                    return argument;
                }
            }
            public invokeFinal(variables: AMSVariableMap<Invokable>) {
                return this;
            }
            public getStructureString(indentOffset: string = ""): string {
                let indenter = this.indenter;
                return `${indentOffset}VariableReference: 
${indentOffset}${indenter}/${name}
`;
            }
        })();
    }
    public invokeFinal(variables: AMSVariableMap<Invokable>) {
        return this.invoke(Invokable.NULL, variables);
    }
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        return `${indentOffset}Variable: 
${indentOffset}${indenter}/${this.name}
`;
    }
}
class Text extends Word {
    private text;
    public constructor(text: string) {
        super();
        this.text = text;
    }
    public invoke(argument: Invokable, variables: AMSVariableMap<Invokable>) {
        return this;
    }
    public getStructureString(indentOffset: string = ""): string {
        let indenter: string = this.indenter;
        return `${indentOffset}Text: 
${indentOffset}${indenter}"${this.text}"
`;
    }
}
const enum Invokable$Type {
    PARAGRAPH,
    SENTENCE,
    WORD,
}
class Invokable$Builder {
    private iterator: StringIterator | null = null;
    private type: Invokable$Type | null = null;
    setIterator(iterator: StringIterator) {
        this.iterator = iterator;
        return this;
    }
    setType(type: Invokable$Type) {
        this.type = type;
        return this;
    }
    build(): Invokable {
        if (!this.type) {
            this.type = Invokable$Type.PARAGRAPH;
        }
        if (!this.iterator) throw "iterator must be set.";
        if (this.type === Invokable$Type.PARAGRAPH) {
            return new Paragraph(this.iterator);
        } else if (this.type === Invokable$Type.SENTENCE) {
            return new Sentence(this.iterator);
        } else {
            let first = this.iterator.next().value;
            if (first === ReservedWord.VARIABLE) {
                return new Variable(this.iterator.readAll());
            } else if (first === ReservedWord.NEST_START) {
                return new Paragraph(this.iterator);
            } else {
                let text = first + this.iterator.readAll();
                if (text.length > 0) {
                    return new Text(text);
                } else {
                    return Invokable.NULL;
                }
            }
        }
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
    public static parseAMS(ams: string): Invokable {
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
        return new Invokable$Builder()
            .setIterator(new StringIterator(formatted))
            .build()
            .invokeFinal(new AMSVariableMap<Invokable>());
    }
}
