# AjiMarkupScriptについて
## 動機

昔、文字の装飾をする規格として、`AjiML`というものを設計したのですが、自分的にいまいちだったので、新しい規格を作るべく、`AjiMarkupScript`、略して`AMS`を設計しました。  
　設計するにあたって、`AjiML`のいまいちな点を挙げました。

### 構文に一貫性がない

AjiML では、それぞれの種類の文を表すのにそれぞれ異なる記号(`!`,`#`,`$`,`&`,`[`,`{`)を使っていたため、似た機能に対して異なる記号を用いる必要がある箇所がいくらか存在しました。  
　そこで、AMS では、使用する記号は「`;`,`:`,`{`,`}`,`/`」の 5 つとし、あらゆる場合で同じ記号の使い方をするようにしました。

### 書きずらい

AjiML では、上記の通りキーボードの上のほうにあるキーをたくさん使うので、シフトキーを押しすぎて小指が壊れます。  
　そこで、AMS では、基本的にキーボードの右側にあるキーをそのまま押せるようになっています。  
　 ▼AjiML(上)と AMS(下)の使用するキーの比較
![AjiMLとAMSのキーボード使用の比較](https://drive.google.com/uc?id=11HJ5tAQp85_wojD1zCN70C_uB5qMrnvv "上：AjiML、下：AMS")

### 拡張性がない

AjiML では、`$`記号で変数宣言が可能でしたが、変数に入れることができるのは文字の装飾タイプだけで、それ以外は全く入れることができませんでした。  
　これは、AjiML がマークアップ言語として設計されたための制約でした。(もはや意味がなかった制約事項。)  
　そこで、AMS では、存在するあらゆるオブジェクトを変数に入れることができるようにしました。

## 仕様ざっくり

AjiMarkupScript(以下 AMS)は、マークアップ調のスクリプト型言語です。  
　基本的に、構文を解析しながら実行されますが、一度解析された部分をもう 1 度構文解析するのは無駄なので、メモ化を利用しています。  
　マークアップ調の言語ですので、エスケープをせずに書くと文字列として認識されます。なので、AMS での HelloWorld は以下の通りです。

```:helloworld.ams
Hello world!!!
```

なお、ソースコード中の空白、改行は無視され、空白が 1 つのみ挿入されます。

```:ignorebreaking.ams
Hello
World
```

```:実行結果
Hello world
```

改行する場合は明示的に(`;/\n;`)を挿入します。

```:breakingexplicitly.ams
Hello;/\n;World
```

```:実行結果
Hello
World
```

# 仕様詳細

-   AMS では、以下の 5 つの記号が予約されています。  
    `;`,`:`,`{`,`}`,`/`
-   AMS の 1 つのブロックは「Arguments」という名前で定義されます。
-   Arguments は 0 つ以上の「Sentence」の集合として定義されます。  
    Arguments 内で区切り文字「`;`」を使用して Sentence を分離します。
-   Sentence は 0 つ以上の「Invokable」の集合として定義されます。  
     Sentence 内で区切り文字「`:`」または、「`{...}`」を用いて分離します。  
    なお、以下の記述はすべて同じ動作をします。  
    `AA:BB;AA{BB};{AA}{BB};{AA}BB`  
    この場合では、シンプルな「`:`」を使用すると良いでしょう。
-   Invokable は最大で 1 つの Arguments を保持します。

AMS の階層構造を図に示すと以下のようになります。
(`A:Arguments,S:Sentence,I:Invokable`)

```:AMSの階層構造
PPP{QQQ:RRR;SSS};WWW{XXX{YYY:ZZZ}}
^^^ ^^^ ^^^ ^^^  ^^^ ^^^ ^^^ ^^^
 I   I   I   I    I   I   I   I
    ^^^^^^^ ^^^          ^^^^^^^
       S     S              S
    ^^^^^^^^^^^          ^^^^^^^
         A                  A
   ^^^^^^^^^^^^^        ^^^^^^^^^
         I                  I
^^^^^^^^^^^^^^^^     ^^^^^^^^^^^^
       S                   S
                     ^^^^^^^^^^^^
                           A
                    ^^^^^^^^^^^^^^
                           I
                 ^^^^^^^^^^^^^^^^^
                         S
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                A
```
