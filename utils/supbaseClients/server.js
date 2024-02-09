import { createServerClient, serialize } from '@supabase/ssr'

export default function createClient(req, res) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_API_KEY,
        {
            cookies: {
                get(name) {
                    return req.cookies[name]
                },
                set(name, value, options) {
                    res.appendHeader('Set-Cookie', serialize(name, value, options))
                },
                remove(name, options) {
                    res.appendHeader('Set-Cookie', serialize(name, '', options))
                },
            },
        }
    )

    return supabase
}