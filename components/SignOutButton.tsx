'use client'
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
    return (
        <button onClick={() => signOut({ callbackUrl: '/'})}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" 
        >
            Sign Out
        </button>
    )
}