import { Hono } from "hono";

const app = new Hono();
const api = new Hono();

api.get("/greeting/:name/:birth{[0-9]{4}}", (c) => {
  const { name, birth } = c.req.param();
  return c.json({
    name: `こんにちは、${name}!`,
    birth: `Your birth is ${birth}`,
  });
});

// スラッシュのバグを避けるため、割り算は暫定で「_」や「div」にするのも手ですが、
// ここでは一般的な4つの記号をそのまま指定する書き方に直します。
api.get(
  "/calc/:firstnum{[0-9]{1,4}}/:op{[+\\-*/]}/:secnum{[0-9]{1,4}}",
  (c) => {
    const { firstnum, op, secnum } = c.req.param();

    // 1. 文字列で入ってくるので、計算できるように数値（Number）に変換する
    const num1 = Number(firstnum);
    const num2 = Number(secnum);
    let result = 0;

    // 2. op（演算子）の値によって計算を切り分ける
    switch (op) {
      case "+":
        result = num1 + num2;
        break;
      case "-":
        result = num1 - num2;
        break;
      case "*":
        result = num1 * num2;
        break;
      case "/":
        // ゼロ除算（0で割る）のチェックを入れておくとプロっぽい！
        if (num2 === 0) {
          return c.json({ error: "Cannot divide by zero" }, 400);
        }
        result = num1 / num2;
        break;
      default:
        return c.json({ error: "Invalid operator" }, 400);
    }

    // 3. 計算結果をJSONで返す
    return c.json({
      firstnum: num1,
      op: op,
      secnum: num2,
      result: result,
    });
  },
);
app.route("/api", api);
export default app;
