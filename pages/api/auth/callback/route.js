import createClient from "../../../../utils/supbaseClients/server";

export default async function handler(req, res) {
	const { code, next } = req.query;
	const origin = req.headers['x-forwarded-host'] || req.headers.host;

	if (code) {
		const supabase = createClient(req, res);
		console.log("reached");
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			const data = await supabase.auth.getUser();
			console.log("user data:", data.session?.user)
			return res.redirect(`http://${origin}${next ? next : '/chat'}`);
		}
	}

	// Return the user to an error page with instructions
	return res.redirect(200, `${origin}/auth`);
}
