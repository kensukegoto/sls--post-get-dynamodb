# APIGatewayに関する設定

https://serverless.com/framework/docs/providers/aws/events/apigateway/#http-endpoints-with-custom-authorizers

# マッピングテンプレート（Custom Request Templates）

APIGatewayは受信リクエストをまずマッピングテンプレートで変換してからバックエンドのLambdaなどに送信する。

## デフォルトで使われるテンプレート

- application/json
- application/x-www-form-urlencoded

## カスタムテンプレート

前提として、昔は、APIGatewayからリクエストをバックエンドに投げる際に、自分で加工が必要だった。<br>
<br>
Content-Typeごとにテンプレートを作成出来る。下記例では、text/xhtmlとapplication/jsonをリクエストで受け取った場合の変換テンプレート。それぞれテンプレートを定義している。

```yaml
functions:
  create:
    handler: posts.create
    events:
      - http:
          method: get
          path: whatever
          integration: lambda
          request:
            template:
              text/xhtml: '{ "stage" : "$context.stage" }'
              application/json: '{ "httpMethod" : "$context.httpMethod" }'
```




# imgをBase64で送り保存、取得しHTMLで表示する

- Base64画像をformで送ると保存は出来るが取り出した際にそのままでは表示出来ない（未解決）。
- Base64画像を送る際はjsonに入れて送ると取り出しも手間無しで成功する。