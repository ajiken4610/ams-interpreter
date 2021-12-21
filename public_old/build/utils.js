"use strict";
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
exports.DateTexter = exports.BiGram = exports.Sleeper = exports.Synchronizer = void 0;
// synchronizeブロックを使用するためのロジックが入ってるクラス
class Synchronizer {
    constructor() {
        this.tasks = [];
    }
    synchronized(func) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tasks.length > 0) {
                let promise = (function (synchronizer) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield synchronizer.tasks[synchronizer.tasks.length - 1];
                        yield func();
                        synchronizer.tasks = synchronizer.tasks.filter((task) => task !== promise);
                    });
                })(this);
                this.tasks.push(promise);
                //console.log("waiting")
                yield promise;
                //console.log("waited")
            }
            else {
                let promise = func();
                this.tasks.push(promise);
                yield promise;
                this.tasks = this.tasks.filter((task) => task !== promise);
            }
        });
    }
}
exports.Synchronizer = Synchronizer;
// awaitでスリープを実現するクラス。synchronizerのお供に使うといい感じ
class Sleeper {
    static sleep(ms, callback) {
        let promise = new Promise((resolve) => setTimeout(resolve, ms));
        promise.then(() => {
            if (callback)
                callback();
        });
        return promise;
    }
}
exports.Sleeper = Sleeper;
// BiGramに分割したりするクラス。別に特筆することはない
class BiGram {
    static splitBy(text, separators) {
        if (!separators)
            separators = [" ", "　", "\n"];
        for (let i = 1; i < text.length; i++) {
            text = text.replace(separators[i], separators[0]);
        }
        return text.split(separators[0]);
    }
    // ビグラムをオブジェクトで作成
    static createBiGramObject(text, separators) {
        if (separators) {
            return this.createBiGramObjectFromTexts(this.splitBy(text, separators));
        }
        else {
            let returnObject = {};
            for (let i = 0; i < text.length - 1; i++) {
                returnObject[text.substring(i, i + 2)] = true;
            }
            return returnObject;
        }
    }
    // ビグラムを配列で作成
    static createBiGramArray(text, separators) {
        return Object.keys(this.createBiGramObject(text, separators));
    }
    static createBiGramObjectFromTexts(array, separators) {
        let returnObject = {};
        if (separators) {
            array.forEach((text) => {
                console.log(text);
                Object.assign(returnObject, this.createBiGramObjectFromTexts(this.splitBy(text, separators)));
            });
        }
        else {
            array.forEach((text) => {
                Object.assign(returnObject, this.createBiGramObject(text));
            });
        }
        return returnObject;
    }
    static createBiGramArrayFromTexts(array, separators) {
        return Object.keys(this.createBiGramObjectFromTexts(array, separators));
    }
}
exports.BiGram = BiGram;
class DateTexter {
    static convertDateToText(date, timeUnit) {
        if (date) {
            let now = new Date();
            let sub = DateTexter.YEAR + 1;
            if (date.getFullYear() === now.getFullYear()) {
                sub = DateTexter.YEAR;
                if (date.getMonth() === now.getMonth()) {
                    sub = DateTexter.MONTH;
                    if (date.getDate() === now.getDate()) {
                        sub = DateTexter.DAY;
                    }
                }
            }
            let unit = timeUnit;
            let text = "";
            switch (unit) {
                case DateTexter.MS:
                    text = date.getMilliseconds() + DateTexter.TIME_UNIT[DateTexter.MS];
                case DateTexter.SEC:
                    text =
                        date.getSeconds() + DateTexter.TIME_UNIT[DateTexter.SEC] + text;
                case DateTexter.MIN:
                    text =
                        date.getMinutes() + DateTexter.TIME_UNIT[DateTexter.MIN] + text;
                case DateTexter.HOUR:
                    text = date.getHours() + DateTexter.TIME_UNIT[DateTexter.HOUR] + text;
                case DateTexter.DAY:
                    if (sub > DateTexter.DAY)
                        text = date.getDate() + DateTexter.TIME_UNIT[DateTexter.DAY] + text;
                    else if (text.length == 0)
                        text = "今日中";
                    else
                        text = "本日 " + text;
                case DateTexter.MONTH:
                    if (sub > DateTexter.MONTH)
                        text =
                            date.getMonth() +
                                1 +
                                DateTexter.TIME_UNIT[DateTexter.MONTH] +
                                text;
                    else if (text.length == 0)
                        text = "今月中";
                case DateTexter.YEAR:
                    if (sub > DateTexter.YEAR)
                        text =
                            date.getFullYear() + DateTexter.TIME_UNIT[DateTexter.YEAR] + text;
                    else if (text.length == 0)
                        text = "今年中";
            }
            return text;
        }
        else {
            return null;
        }
    }
}
exports.DateTexter = DateTexter;
DateTexter.MS = 0;
DateTexter.SEC = 1;
DateTexter.MIN = 2;
DateTexter.HOUR = 3;
DateTexter.DAY = 4;
DateTexter.MONTH = 5;
DateTexter.YEAR = 6;
DateTexter.TIME_UNIT = ["ミリ秒", "秒", "分", "時", "日", "月", "年"];
