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
