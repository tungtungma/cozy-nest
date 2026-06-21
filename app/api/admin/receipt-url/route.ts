import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { receiptUrl } = await request.json();

    if (!receiptUrl) {
      return NextResponse.json(
        { error: "Receipt URL is required" },
        { status: 400 }
      );
    }

    // Extract the file path from the full URL
    // Format: https://[project].supabase.co/storage/v1/object/public/payment-receipts/[path]
    const urlParts = receiptUrl.split('/payment-receipts/');
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: "Invalid receipt URL format" },
        { status: 400 }
      );
    }

    const filePath = urlParts[1];

    // Generate a signed URL valid for 1 hour
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: "Failed to generate signed URL", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Error in receipt-url API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
