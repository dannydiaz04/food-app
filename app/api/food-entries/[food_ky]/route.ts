import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { food_ky: string } }
) {
  try {
    const resolvedParams = await params;
    console.log('Server-side DELETE params:', resolvedParams);
    console.log('Server-side food_ky value:', resolvedParams.food_ky);

    const food_ky = resolvedParams.food_ky;

    if (!food_ky) {
      return NextResponse.json({ error: 'Missing food_ky' }, { status: 400 });
    }

    // Get the authenticated user's session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's ID from Supabase using their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the food entry
    const { error } = await supabase
      .from('food')
      .delete()
      .eq('food_ky', food_ky)
      .eq('userId', userData.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 