import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let requestBody: { screenplayId?: string; fileUrl?: string; appId?: string } | null = null;
    
    try {
        // Parse request body once and store it
        requestBody = await request.json();
        
        if (!requestBody) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }
        
        const { screenplayId, fileUrl, appId } = requestBody;

        if (!screenplayId || !fileUrl || !appId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // For development, skip Firebase Admin updates and just process the PDF
        // Client will handle progress updates through the regular Firebase client SDK
        
        // Download PDF and process it
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Dynamically import the processor to avoid build-time issues
        const { processScreenplayPDF } = await import('@/lib/screenplay-processor');
        
        const processedContent = await processScreenplayPDF(buffer);

        return NextResponse.json({
            success: true,
            pageCount: processedContent.totalPageCount,
            content: processedContent.pages, // Now returns ScreenplayPage[] instead of string[]
            message: `Screenplay processed successfully - ${processedContent.totalPageCount} pages extracted with PDF page consistency maintained`
        });

    } catch (error) {
        console.error('Error processing screenplay:', error);

        return NextResponse.json(
            { 
                error: 'Failed to process screenplay',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
