//#region edge/proxy.ts
async function onRequest({ request, env }) {
	const incoming = new URL(request.url);
	if (!incoming.pathname.startsWith("/api/")) return new Response(null, { status: 404 });
	let origin;
	try {
		origin = new URL(env?.DAILYLEX_API_ORIGIN || "https://daily-lex-api.vercel.app");
		if (origin.protocol !== "https:" || origin.username || origin.password || origin.origin === incoming.origin) throw new Error("Invalid API origin");
	} catch {
		return new Response(JSON.stringify({ error: "账号服务尚未配置" }), {
			status: 503,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	}
	origin.pathname = incoming.pathname;
	origin.search = incoming.search;
	const headers = new Headers(request.headers);
	for (const name of [
		"host",
		"connection",
		"content-length",
		"x-forwarded-host",
		"x-forwarded-proto",
		"x-forwarded-for",
		"forwarded"
	]) headers.delete(name);
	headers.set("Accept-Encoding", "identity");
	try {
		const response = await fetch(origin.href, {
			method: request.method,
			headers,
			body: ["GET", "HEAD"].includes(request.method) ? void 0 : await request.arrayBuffer(),
			redirect: "manual"
		});
		const outgoing = new Headers(response.headers);
		for (const name of [
			"Content-Encoding",
			"Content-Length",
			"Transfer-Encoding"
		]) outgoing.delete(name);
		outgoing.set("Cache-Control", "no-store");
		return new Response(response.body, {
			status: response.status,
			headers: outgoing
		});
	} catch {
		return new Response(JSON.stringify({ error: "暂时连不上学习服务，请稍后重试" }), {
			status: 502,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	}
}
//#endregion
export { onRequest };
