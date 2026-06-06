import { Hono } from "hono";

const app = new Hono();
const api = new Hono();

// Helper function to get client's global IP
function getClientIp(c: any): string {
  // Try to get IP from various headers (reverse proxy, load balancer, etc.)
  const forwardedFor = c.req.header("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(",")[0].trim();
  }

  const clientIp =
    c.req.header("cf-connecting-ip") || // Cloudflare
    c.req.header("x-client-ip") ||
    c.req.header("x-real-ip") ||
    c.req.header("x-public-ip");

  if (clientIp) {
    return clientIp;
  }

  // Fallback to socket remote address if available
  return "Unknown";
}

// GET endpoint for root path - returns greeting with global IP
app.get("/", (c) => {
  const clientIp = getClientIp(c);
  return c.json({
    message: `Hello ${clientIp}`,
  });
});

// GET endpoint for greeting with name and birth year
api.get("/greeting/:name/:birth{[0-9]{4}}", (c) => {
  const { name, birth } = c.req.param();
  return c.json({
    name: `Hello, ${name}!`,
    birth: `Your birth is ${birth}`,
  });
});

// GET endpoint for basic calculator operations using query parameters
// Usage: /api/calc?num1=10&op=+&num2=5
api.get("/calc", (c) => {
  const num1Str = c.req.query("num1");
  const num2Str = c.req.query("num2");
  const op = c.req.query("op");

  // Validate that all parameters are provided
  if (!num1Str || !num2Str || !op) {
    return c.json(
      {
        error: "Missing parameters. Required: num1, num2, op",
        example: "/api/calc?num1=10&op=+&num2=5",
      },
      400,
    );
  }

  // Validate that num1 and num2 are valid numbers
  const num1 = Number(num1Str);
  const num2 = Number(num2Str);

  if (isNaN(num1) || isNaN(num2)) {
    return c.json({ error: "num1 and num2 must be valid numbers" }, 400);
  }

  // Validate that operator is one of the supported operators
  if (!["+", "-", "*", "/"].includes(op)) {
    return c.json(
      {
        error: "Invalid operator. Supported operators: +, -, *, /",
      },
      400,
    );
  }

  let result = 0;

  // Perform calculation based on the operator
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
  }

  // Return the calculation result as JSON
  return c.json({
    num1: num1,
    op: op,
    num2: num2,
    result: result,
  });
});

app.route("/api", api);
export default app;
