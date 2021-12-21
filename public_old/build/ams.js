"use strict";
class StringIterator {
    /**
     * ソースを指定してイテレータを初期化します。
     * @param {string} src
     * @memberof StringIterator
     */
    constructor(src) {
        this.index = 0;
        this.src = src;
    }
    next() {
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
    hasNext() {
        return this.src.length > this.index;
    }
}
class AMSVariableMap {
    constructor(parent) {
        this.map = parent ? Object.create(parent.getMap()) : {};
    }
    has(name) {
        return name in this.map;
    }
    get(name) {
        return this.map[name];
    }
    set(name, object) {
        this.map[name] = object;
    }
    getMap() {
        return this.map;
    }
}
class StackTrace {
    constructor(position) {
        this.position = position;
    }
    toString() {
        return `\tat (${this.position.join(":")})`;
    }
}
class AMSException {
    constructor(name, message) {
        this.name = name;
        this.message = message;
        this.trace = [];
    }
    addStackTrace(trace) {
        this.trace.push(trace);
    }
    getStackTraceString() {
        let traceStrings = [];
        for (let i = 0; i < this.trace.length; i++) {
            traceStrings.push(this.trace[i].toString());
        }
        return this.name + ":" + this.message + "\n" + traceStrings.join("\n");
    }
    getStackTraces() {
        return this.trace;
    }
}
/**
 * AMSのオブジェクトを表す抽象クラスです。
 *
 * @class AMSObject
 */
class AMSObject {
    invoke(parent) {
        if (parent) {
            return this.invokeWithinArguments(parent);
        }
        else {
            return this.invokeWithoutArguments();
        }
    }
}
