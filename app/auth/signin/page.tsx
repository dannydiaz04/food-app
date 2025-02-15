'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await signIn('credentials', {
            ...credentials,
            redirect: false,
        });

        if (result?.ok) {
            router.push('/'); // Redirect to home page
            router.refresh(); // Refresh the page to update the auth state
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
                <button type="submit">Sign In</button>
            </form>
            <div>
                Don&apos;t have an account?{' '}
                <button onClick={() => router.push('/auth/signup')}>
                    Sign Up
                </button>
            </div>
        </div>
    );
}