//#region edge/proxy.ts
async function e({ request: e, env: t }) {
	let n = new URL(e.url);
	if (!n.pathname.startsWith("/api/")) return new Response(null, { status: 404 });
	let r;
	try {
		if (r = new URL(t?.DAILYLEX_API_ORIGIN || "https://daily-lex-api.mog.workers.dev"), r.protocol !== "https:" || r.username || r.password || r.origin === n.origin) throw Error("Invalid API origin");
	} catch {
		return Response.json({ error: "账号服务尚未配置" }, {
			status: 503,
			headers: { "Cache-Control": "no-store" }
		});
	}
	r.pathname = n.pathname, r.search = n.search;
	let i = new Headers(e.headers);
	for (let e of [
		"host",
		"connection",
		"content-length",
		"x-forwarded-host",
		"x-forwarded-proto",
		"x-forwarded-for",
		"forwarded"
	]) i.delete(e);
	try {
		let t = await fetch(r.href, {
			method: e.method,
			headers: i,
			body: ["GET", "HEAD"].includes(e.method) ? void 0 : await e.arrayBuffer(),
			redirect: "manual"
		}), n = new Headers(t.headers);
		return n.set("Cache-Control", "no-store"), new Response(t.body, {
			status: t.status,
			headers: n
		});
	} catch {
		return Response.json({ error: "暂时连不上学习服务，请稍后重试" }, {
			status: 502,
			headers: { "Cache-Control": "no-store" }
		});
	}
}
//#endregion
export { e as default };
