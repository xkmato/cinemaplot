import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/lib/auth-context';
import {
    Screenplay,
    ScreenplayElement
} from '@/lib/types';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Download,
    MessageCircle,
    RefreshCw,
    X
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface ScreenplayReaderProps {
    screenplay: Screenplay;
}

interface Selection {
    startElement: number;
    startOffset: number;
    endElement: number;
    endOffset: number;
    text: string;
}

export default function ScreenplayReader({ screenplay }: ScreenplayReaderProps) {
    const { user, submitScreenplayComment, retryScreenplayProcessing, hasScreenplayAccess, getScreenplayPermissions } = useAppContext();
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedText, setSelectedText] = useState<Selection | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectionPosition, setSelectionPosition] = useState<{ x: number, y: number } | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    // Handle text selection - moved to top level to avoid conditional hook
    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !pageRef.current) return;

        const range = selection.getRangeAt(0);
        const selectedTextValue = selection.toString().trim();

        if (selectedTextValue.length < 3) return; // Minimum selection length

        // Get the position of the selection to position the popup
        const rect = range.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top - 10 // Position above the selection
        };

        // Find the element indices and offsets
        // This is a simplified version - in practice, you'd need more sophisticated
        // logic to map DOM ranges to screenplay elements
        const selectionData: Selection = {
            startElement: 0, // Would need to calculate based on DOM position
            startOffset: range.startOffset,
            endElement: 0, // Would need to calculate based on DOM position
            endOffset: range.endOffset,
            text: selectedTextValue
        };

        setSelectedText(selectionData);
        setSelectionPosition(position);
    }, []);

    // Handle retry processing
    const handleRetryProcessing = async () => {
        if (!user) return;

        setIsRetrying(true);
        try {
            await retryScreenplayProcessing(screenplay.id);
        } catch (error) {
            console.error('Error retrying processing:', error);
        } finally {
            setIsRetrying(false);
        }
    };

    // Check if user has access to this screenplay
    if (!hasScreenplayAccess(screenplay)) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BookOpen className="w-6 h-6 mr-2" />
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="text-red-600 mb-4">
                            <X className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-medium mb-2">Private Screenplay</p>
                            <p className="text-sm text-gray-600 mb-4">
                                This screenplay is private and you don&apos;t have permission to view it.
                            </p>
                        </div>
                        {!user && (
                            <p className="text-sm text-gray-600">
                                Please sign in to access this screenplay if you have been granted permission.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Get user's permissions for this screenplay
    const permissions = getScreenplayPermissions(screenplay);

    // Check if screenplay has processed content
    if (!screenplay.content || screenplay.content.length === 0) {
        const progress = screenplay.processingProgress || 0;
        const attempts = screenplay.processingAttempts || 0;
        const maxAttempts = screenplay.maxRetryAttempts || 3;
        const canRetry = screenplay.processingStatus === 'failed' && attempts < maxAttempts;

        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BookOpen className="w-6 h-6 mr-2" />
                        {screenplay.processingStatus === 'processing' ? 'Processing Screenplay...' :
                            screenplay.processingStatus === 'failed' ? 'Processing Failed' :
                                'Processing Screenplay...'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        {screenplay.processingStatus === 'processing' ? (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 mb-4">
                                    Processing screenplay content for interactive reading...
                                </p>
                                {/* Progress Bar */}
                                <div className="w-full max-w-md mx-auto">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </>
                        ) : screenplay.processingStatus === 'failed' ? (
                            <>
                                <div className="text-red-600 mb-4">
                                    <X className="w-12 h-12 mx-auto mb-2" />
                                    <p className="font-medium mb-2">Processing Failed</p>
                                    {screenplay.processingError && (
                                        <p className="text-sm text-gray-600 mb-4">
                                            {screenplay.processingError}
                                        </p>
                                    )}
                                </div>

                                {/* Retry Information */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Attempt {attempts} of {maxAttempts}
                                    </p>
                                    {canRetry && (
                                        <Button
                                            onClick={handleRetryProcessing}
                                            disabled={isRetrying}
                                            className="flex items-center mx-auto"
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                                            {isRetrying ? 'Retrying...' : 'Retry Processing'}
                                        </Button>
                                    )}
                                    {!canRetry && attempts >= maxAttempts && (
                                        <p className="text-sm text-red-600">
                                            Maximum retry attempts reached. Please contact support or try uploading a different file.
                                        </p>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600">
                                    You can still view the original file while we work on processing.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="animate-pulse rounded-full h-8 w-8 bg-gray-300 mx-auto mb-4"></div>
                                <p className="text-gray-600">
                                    Screenplay is being prepared for interactive reading.
                                </p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Handle both legacy format (string[]) and new format (ScreenplayPage[])
    const isLegacyFormat = screenplay.content.length > 0 && typeof screenplay.content[0] === 'string';

    let currentPageData: { content: ScreenplayElement[] } | undefined;
    let totalPages: number;

    if (isLegacyFormat) {
        // Legacy format: screenplay.content is string[]
        const pages = screenplay.content as unknown as string[];
        totalPages = pages.length;
        const currentPageText = pages[currentPage] || '';
        currentPageData = {
            content: currentPageText ? [{
                id: `page-${currentPage}-text`,
                type: 'general' as const,
                text: currentPageText,
                lineNumber: 1,
                startIndex: 0,
                endIndex: currentPageText.length
            }] : []
        };
    } else {
        // New format: screenplay.content is ScreenplayPage[]
        totalPages = screenplay.content?.length || 0;
        currentPageData = screenplay.content?.[currentPage];
    }

    // Navigate to previous page
    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            setSelectedText(null);
            setSelectionPosition(null);
        }
    };

    // Navigate to next page
    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            setSelectedText(null);
            setSelectionPosition(null);
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!selectedText || !commentText.trim() || !user) return;

        try {
            await submitScreenplayComment(
                screenplay.id,
                commentText.trim(),
                currentPage,
                undefined,
                selectedText.text
            );

            setCommentText('');
            setShowCommentModal(false);
            setSelectedText(null);
            setSelectionPosition(null);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Render screenplay element with proper formatting
    const renderElement = (element: ScreenplayElement, index: number) => {
        const baseClasses = "whitespace-pre-wrap leading-normal";
        let elementClasses = baseClasses;
        const elementStyle: React.CSSProperties = {};

        switch (element.type) {
            case 'scene_heading':
                elementClasses += " font-bold uppercase mb-4 mt-6";
                elementStyle.marginLeft = '0';
                elementStyle.fontSize = '12pt';
                elementStyle.letterSpacing = '0.5px';
                break;
            case 'action':
                elementClasses += " text-gray-900 mb-3";
                elementStyle.marginLeft = '0';
                elementStyle.marginRight = '0';
                elementStyle.fontSize = '12pt';
                elementStyle.textAlign = 'left';
                break;
            case 'character':
                elementClasses += " font-bold uppercase mb-1 mt-4 text-center";
                elementStyle.marginLeft = '0';
                elementStyle.marginRight = '0';
                elementStyle.fontSize = '12pt';
                elementStyle.letterSpacing = '1px';
                elementStyle.display = 'flex';
                elementStyle.justifyContent = 'center';
                break;
            case 'dialogue':
                elementClasses += " mb-3";
                // Make dialogue much wider for more words per line
                elementStyle.marginLeft = '0.75in';
                elementStyle.marginRight = '0.75in';
                elementStyle.maxWidth = 'none';
                elementStyle.fontSize = '12pt';
                elementStyle.textAlign = 'left';
                break;
            case 'parenthetical':
                elementClasses += " text-gray-600 italic mb-1";
                elementStyle.marginLeft = '1.5in';
                elementStyle.marginRight = '1.5in';
                elementStyle.fontSize = '12pt';
                break;
            case 'transition':
                elementClasses += " font-bold uppercase mt-4 mb-4";
                elementStyle.marginLeft = '4in';
                elementStyle.fontSize = '12pt';
                elementStyle.textAlign = 'right';
                elementStyle.letterSpacing = '0.5px';
                break;
            case 'general':
                elementClasses += " text-gray-900 mb-3";
                elementStyle.marginLeft = '0';
                elementStyle.fontSize = '12pt';
                break;
            default:
                elementClasses += " text-gray-900 mb-3";
                elementStyle.marginLeft = '0';
                elementStyle.fontSize = '12pt';
        }

        return (
            <div
                key={`${currentPage}-${index}`}
                className={elementClasses}
                style={elementStyle}
                data-element-index={index}
            >
                {element.text}
            </div>
        );
    };



    return (
        <>
            <div
                className="w-full mx-auto"
                style={{
                    maxWidth: '1200px', // wider than before
                    paddingLeft: 0,
                    paddingRight: 0
                }}
            >
                {/* Reader Header */}
                <Card className="mb-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center">
                                <BookOpen className="w-6 h-6 mr-2" />
                                {screenplay.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                    Page {currentPage + 1} of {totalPages}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(screenplay.fileUrl, '_blank')}
                                    className="flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Selection Actions - Popup over selected text */}
                {selectedText && user && selectionPosition && permissions?.canComment && (
                    <div
                        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                        style={{
                            left: `${selectionPosition.x}px`,
                            top: `${selectionPosition.y}px`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCommentModal(true)}
                                className="flex items-center"
                            >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Comment
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedText(null);
                                    setSelectionPosition(null);
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Screenplay Content */}
                <Card className="overflow-x-auto">
                    <CardContent className="p-0">
                        <div
                            ref={pageRef}
                            className="screenplay-page font-mono text-sm leading-relaxed select-text bg-white"
                            onMouseUp={handleMouseUp}
                            style={{
                                minHeight: '800px',
                                fontFamily: 'Courier New, Courier, monospace',
                                fontSize: '12pt',
                                lineHeight: '1.5',
                                width: '100%',
                                maxWidth: '100%',
                                margin: 0,
                                padding: '4vw 2vw', // Responsive padding
                                color: '#000000',
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* Page Header */}
                            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200 text-xs text-gray-400">
                                <span className="uppercase font-mono">
                                    {screenplay.title}
                                </span>
                                <div className="flex items-center space-x-4">
                                    <span className="font-medium">
                                        Page {currentPage + 1}
                                    </span>
                                </div>
                            </div>

                            {/* Page Elements */}
                            {currentPageData?.content?.map((element: ScreenplayElement, index: number) =>
                                renderElement(element, index)
                            ) || (
                                    <div className="text-center text-gray-500 py-8">
                                        <p>No content available for this page.</p>
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Comment Modal */}
                {showCommentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Add Comment
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowCommentModal(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Selected text:</p>
                                        <blockquote className="text-sm italic text-gray-800 pl-2 border-l-2 border-gray-300 ml-2">
                                            &ldquo;{selectedText?.text}&rdquo;
                                        </blockquote>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Your comment:
                                        </label>
                                        <Textarea
                                            placeholder="Share your thoughts about this passage..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowCommentModal(false);
                                                setSelectedText(null);
                                                setSelectionPosition(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddComment}
                                            disabled={!commentText.trim()}
                                        >
                                            Add Comment
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </div>
            <style jsx>{`
                @media (max-width: 900px) {
                    .screenplay-page {
                        padding: 2vw 1vw !important;
                        font-size: 11pt !important;
                    }
                }
                @media (max-width: 600px) {
                    .screenplay-page {
                        padding: 2vw 0.5vw !important;
                        font-size: 10pt !important;
                    }
                }
            `}</style>
        </>
    );
}
