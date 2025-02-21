'use client'
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        // Sign out and redirect to signin page
        await signOut({ 
            redirect: true,
            callbackUrl: '/auth/signin'
        });
        
        // Clear any client-side state/cache if needed
        router.refresh();
    };

    return (
        <button 
            onClick={handleSignOut}
            className="text-inherit font-normal" 
        >
            Sign Out
        </button>
    );
}