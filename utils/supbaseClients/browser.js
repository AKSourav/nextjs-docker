import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowser = () =>
	createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_API_KEY
	);
