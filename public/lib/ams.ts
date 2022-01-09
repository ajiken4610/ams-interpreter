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

// class Invokable {
//     public invoke(
//         argument: Arguments,
//         variables: AMSVariableMap<Sentence>
//     ): Invokable {
//         return this;
//     }
//     public finalInvoke(variables: AMSVariableMap<Sentence>): Invokable {
//         return this;
//     }
//     public toArguments(): Arguments {
//         let invokable = this;
//         return new (class extends Arguments {
//             public constructor() {
//                 super();
//                 this.notLoaded[0] = new (class extends Sentence {
//                     public invoke(
//                         variables: AMSVariableMap<Sentence>
//                     ): Invokable {
//                         return invokable;
//                     }
//                 })();
//             }
//         })();
//     }
// }

// class VariableInvokable extends Invokable {
//     public value: string;
//     public constructor(value: string) {
//         super();
//         this.value = value;
//     }
//     public invoke(
//         argument: Arguments,
//         variables: AMSVariableMap<Sentence>
//     ): Invokable {
//         let value = this.value;
//         return new (class extends Invokable {
//             public invoke(
//                 argument: Arguments,
//                 variables: AMSVariableMap<Sentence>
//             ): Invokable {
//                 if (argument.length === 0) {
//                     // 取得only
//                     if (variables.has(value)) {
//                         return variables.get(value);
//                     } else {
//                         let nullValue = Sentence.NULL;
//                         variables.set(value, nullValue);
//                         return nullValue;
//                     }
//                 } else {
//                     // 代入
//                     let invoked = argument.invokeAt(0, variables);
//                     variables.set(value, invoked);
//                     return invoked;
//                 }
//             }
//             public finalInvoke(variables: AMSVariableMap<Sentence>): Invokable {
//                 return this.invoke(new Arguments(), variables);
//             }
//         })();
//     }
// }

// class Sentence {
//     public static NULL = new (class extends Sentence {
//         public invoke(variables: AMSVariableMap<Sentence>): Sentence {
//             return this;
//         }
//     })();
//     private invokables: Invokable[] = [];
//     public constructor(iterator?: StringIterator) {
//         // AA:BB とか AA{...Arguments...}BBとかがiteratorに流れてくる
//         if (iterator) {
//             // AA => 文字列
//             // /AA => 変数
//             // : => 引数なし呼び出し
//             // {...} => Argumentsを引数として呼び出し
//             let last = "";
//             console.log("=\t=\t=\t=");
//             while (iterator.hasNext()) {
//                 let current = iterator.readBeforeCharWithNest(
//                     "/:",
//                     "{}",
//                     true,
//                     last === "{"
//                 );
//                 // console.log(current);
//                 if (last === "}") last = "";
//                 let value = current.value;
//                 if (last === "/") {
//                     // 変数
//                     this.invokables.push(new VariableInvokable(value));
//                     console.log("変数\t\t\t" + last + value);
//                 } else if (last === ":") {
//                     // 呼び出し(引数なし)
//                     console.log("省略呼び出し\t" + last + value);
//                 } else if (last === "{") {
//                     // 呼び出し(引数あり)
//                     console.log(
//                         "通常呼び出し\t" + last + value + current.detected
//                     );
//                 } else if (value.length > 0) {
//                     // 文字列、文字列呼び出し
//                     console.log("文字列\t\t\t" + last + value);
//                 }
//                 last = current.detected;
//             }
//         }
//     }
//     /**
//      *
//      *
//      * @param {AMSVariableMap<Sentence>} variables
//      * @return {Sentence}
//      */
//     public invoke(variables: AMSVariableMap<Sentence>): Sentence {
//         // TODO 実装
//         console.log("=========================invoked");
//         console.log(this.invokables);
//         let invokables = this.invokables;
//         if (invokables.length === 0) return Sentence.NULL;
//         let last = invokables[0];
//         // 前から順番に呼び出していく
//         for (var i = 0; i < invokables.length - 1; i++) {
//             // last = last.invoke(i+1番目)
//             console.log(i);
//             last = last.invoke();
//         }
//         return Sentence.NULL;
//     }
// }

// class Arguments {
//     private notLoaded: (string | null)[] = [];
//     private loaded: Sentence[] = [];
//     public constructor(iterator?: StringIterator) {
//         if (iterator) {
//             // AA;BB;CCとかがiteratorに流れてくる
//             let sentences = [];
//             while (iterator.hasNext()) {
//                 sentences.push(
//                     iterator.readBeforeCharWithNest(";", "{}").value
//                 );
//             }
//             this.notLoaded = sentences;
//             this.loaded = Array(sentences.length);
//         }
//     }
//     public invokeAt(
//         index: number,
//         variables: AMSVariableMap<Sentence>
//     ): Invokable {
//         let toLoad;
//         if (!this.loaded[index] && (toLoad = this.notLoaded[index])) {
//             // メモ化されていないとき
//             // let toLoad = this.notLoaded[index];
//             this.loaded[index] = new Sentence(new StringIterator(toLoad));
//             this.notLoaded[index] = null;
//         }
//         return this.loaded[index].invoke(variables);
//     }
//     public get length(): number {
//         return this.loaded.length;
//     }
// }

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
    public static parseAMS(ams: string): string {
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
        return formatted;
        // return new AMSSpan().load(
        //     new StringIterator(formatted),
        //     new AMSVariableMap<AbsAMSObject>()
        // );
    }
}
