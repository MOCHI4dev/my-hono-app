import { Hono } from "hono";

const app = new Hono();
const api = new Hono();

// GET endpoint for greeting with name and birth year
api.get("/greeting/:name/:birth{[0-9]{4}}", (c) => {
  const { name, birth } = c.req.param();
  return c.json({
    name: `Hello, ${name}!`,
    birth: `Your birth is ${birth}`,
  });
});

// GET endpoint for basic calculator operations
// Supports addition (+), subtraction (-), multiplication (*), and division (/)
// Note: To avoid URL encoding issues with slashes, alternative separators like "_" or "div" can be used,
// but here we use the standard four mathematical symbols directly in the route pattern
api.get(
  "/calc/:firstnum{[0-9]{1,4}}/:op{[+\\-*/]}/:secnum{[0-9]{1,4}}",
  (c) => {
    const { firstnum, op, secnum } = c.req.param();

    // 1. Convert string parameters to numbers since URL parameters are strings
    const num1 = Number(firstnum);
    const num2 = Number(secnum);
    let result = 0;

    // 2. Perform calculation based on the operator
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
        // Check for division by zero - good practice for production code!
        if (num2 === 0) {
          return c.json({ error: "Cannot divide by zero" }, 400);
        }
        result = num1 / num2;
        break;
      default:
        return c.json({ error: "Invalid operator" }, 400);
    }

    // 3. Return the calculation result as JSON
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
