import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
    process.env.SUPABASE_URL! as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY! as string
);

export async function POST(request: NextRequest) {
    try {
        // 1. Parse the request body
        const { name, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // 2. Check if user already exists
        const { data: existingUser} = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 400 }
            );
        }

        // 3. Hash the password before storing 
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4, Insert the new user with name
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
                { 
                    email, 
                    password: hashedPassword,
                    name: name || null // Include name field, but allow it to be null
                }
            ])
            .select()
            .single();

        if (insertError || !newUser) {
            console.error("Sign-up insert error:", insertError);
            throw new Error("Error creating new user.");
        }

        // 5. Return success
        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Sign-up error:", error);
        return NextResponse.json(
            { error: "An error occurred during sign-up" },
            { status: 500 }
        );
    }
}