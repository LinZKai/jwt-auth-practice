import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/configs/prisma";

describe("Auth Integration Test", () => {
  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /health should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("register and login should work", async () => {
    const email = "demo@example.com";
    const password = "password123";

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ email, password });

    expect(registerRes.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();

    // 檢查是否有 set-cookie
    expect(loginRes.headers["set-cookie"]).toBeDefined();
  });

  it("access expires -> refresh -> /api/me works again", async () => {
    const agent = request.agent(app);

    const email = "demo2@example.com";
    const password = "password123";

    // 1) register
    await agent.post("/api/auth/register").send({ email, password }).expect(201);

    // 2) login (agent will store refresh cookie)
    const loginRes = await agent.post("/api/auth/login").send({ email, password }).expect(200);
    const accessToken1 = loginRes.body.accessToken;
    expect(accessToken1).toBeDefined();

    // 3) call /api/me with valid access token
    const me1 = await agent
      .get("/api/me")
      .set("Authorization", `Bearer ${accessToken1}`)
      .expect(200);

    expect(me1.body.user.email).toBe(email);

    // 4) wait for access token to expire (ACCESS_TOKEN_TTL="3s")
    await new Promise((r) => setTimeout(r, 3500));

    // 5) /api/me should now fail with expired token
    await agent
      .get("/api/me")
      .set("Authorization", `Bearer ${accessToken1}`)
      .expect(401);

    // 6) refresh (agent sends refresh cookie automatically)
    const refreshRes = await agent.post("/api/auth/refresh").expect(200);
    const accessToken2 = refreshRes.body.accessToken;
    expect(accessToken2).toBeDefined();
    expect(accessToken2).not.toBe(accessToken1);

    // 7) call /api/me again with new access token -> success
    const me2 = await agent
      .get("/api/me")
      .set("Authorization", `Bearer ${accessToken2}`)
      .expect(200);

    expect(me2.body.user.email).toBe(email);
  });
});