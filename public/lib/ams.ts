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

class AMSVariableMap<T> {
  private map;
  public constructor(parent: AMSVariableMap<T>) {
    this.map = parent ? Object.create(parent.getMap()) : {};
  }
  public has(name: string): boolean {
    return name in this.map;
  }
  public get(name: string): T {
    return this.map[name];
  }
  public set(name: string, object: T): void {
    this.map[name] = object;
  }
  private getMap(): {} {
    return this.map;
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
  public constructor(args: AbsAMSObject) {}
  public invoke(parent: AbsAMSObject): AbsAMSObject {
    if (parent) {
      return this.invokeWithinArguments(parent);
    } else {
      return this.invokeWithoutArguments();
    }
  }

  protected abstract invokeWithinArguments(parent: AbsAMSObject): AbsAMSObject;
  protected abstract invokeWithoutArguments(): AbsAMSObject;
}
