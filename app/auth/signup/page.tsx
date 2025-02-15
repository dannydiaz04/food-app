'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    });
    const router = useRouter();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Signup error:', error);
      }
    };
  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="submit">Sign Up</button>
        </form>
        <div>
          Already have an account?{' '}
          <button onClick={() => router.push('/auth/signin')}>
            Sign in here
          </button>
        </div>
      </div>
    );
  }