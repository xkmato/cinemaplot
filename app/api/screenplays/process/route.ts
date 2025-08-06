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

        // For development, skip Firebase Admin updates and just process the Fountain file
        // Client will handle progress updates through the regular Firebase client SDK
        
        // Download Fountain and process it
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to download Fountain: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileContent = buffer.toString('utf-8');
        
        // Dynamically import the processor to avoid build-time issues
        const { processScreenplayFountain } = await import('@/lib/screenplay-processor');
        
        const processedContent = await processScreenplayFountain(fileContent);

        return NextResponse.json({
            success: true,
            pageCount: processedContent.pages.length,
            content: processedContent.pages, // Returns ScreenplayPage[] with structured elements
            message: `Screenplay processed successfully - ${processedContent.pages.length} pages extracted from Fountain file`
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
