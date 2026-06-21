import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload payment receipt.' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 3. Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.',
          allowedTypes: ['JPG', 'PNG', 'WEBP', 'PDF']
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File too large. Maximum file size is 2MB.',
          maxSizeMB: 2,
          fileSizeMB: (file.size / 1024 / 1024).toFixed(2)
        },
        { status: 400 }
      );
    }

    // 5. Sanitize and generate unique filename
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ext = rawExt.replace(/[^a-z0-9]/g, '').slice(0, 6) || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext) ? ext : 'jpg';
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const filename = `receipt-${timestamp}-${uniqueId.slice(0, 8)}.${safeExt}`;
    const filepath = `${session.user.id}/${filename}`;

    // 6. Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600' // Cache for 1 hour
      });

    if (error) {
      console.error('[Supabase Upload Error]', {
        message: error.message,
        name: error.name,
        status: (error as { status?: number }).status,
        details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      return NextResponse.json(
        { 
          error: 'Failed to upload receipt to storage',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // 8. Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(filepath);

    // 9. Log successful upload
    console.log(`✅ Payment receipt uploaded: ${filepath} by user ${session.user.id}`);

    // 10. Return success response
    return NextResponse.json({
      success: true,
      receiptUrl: publicUrl,
      uploadedAt: new Date().toISOString(),
      filename: filename,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred during upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
