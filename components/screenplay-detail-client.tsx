'use client';

import ScreenplayReader from "@/components/screenplay-reader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { Screenplay, ScreenplayComment } from "@/lib/types";
import { FileText, MessageCircle, RefreshCw, Share2, Star, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ScreenplayDetailClientProps {
    screenplayId: string;
}

export default function ScreenplayDetailClient({ screenplayId }: ScreenplayDetailClientProps) {
    const { user, screenplays, screenplayComments, submitScreenplayComment, retryScreenplayProcessing } = useAppContext();
    const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
    const [comments, setComments] = useState<ScreenplayComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [showQuoteComment, setShowQuoteComment] = useState(false);
    const [quoteComment, setQuoteComment] = useState("");
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        const foundScreenplay = screenplays.find(s => s.id === screenplayId);
        setScreenplay(foundScreenplay || null);
    }, [screenplays, screenplayId]);

    useEffect(() => {
        const screenplayCommentsForThis = screenplayComments.filter(comment => comment.screenplayId === screenplayId);
        setComments(screenplayCommentsForThis);
    }, [screenplayComments, screenplayId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!screenplay || !user || !newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            await submitScreenplayComment(screenplay.id, newComment.trim());
            setNewComment("");
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleQuoteCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!screenplay || !user || !quoteComment.trim() || !selectedText) return;

        setIsSubmittingComment(true);
        try {
            await submitScreenplayComment(screenplay.id, quoteComment.trim(), undefined, undefined, selectedText);
            setQuoteComment("");
            setSelectedText("");
            setShowQuoteComment(false);
        } catch (error) {
            console.error('Failed to submit quote comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            setSelectedText(selection.toString().trim());
            setShowQuoteComment(true);
        }
    };

    const handleRetryProcessing = async () => {
        if (!screenplay || !retryScreenplayProcessing) return;

        setIsRetrying(true);
        try {
            await retryScreenplayProcessing(screenplay.id);
        } catch (error) {
            console.error('Failed to retry processing:', error);
        } finally {
            setIsRetrying(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (!screenplay) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/screenplays" className="text-lg font-semibold hover:text-primary">
                                ← Back to Screenplays
                            </Link>
                        </div>
                    </div>
                </header>
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading screenplay...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/screenplays" className="text-lg font-semibold hover:text-primary">
                            ← Back to Screenplays
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Screenplay Info */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">{screenplay.title}</h1>
                                <p className="text-lg text-muted-foreground mb-4">{screenplay.logLine}</p>
                                <div className="flex items-center space-x-4 mb-6">
                                    <Badge>{screenplay.genre}</Badge>
                                    <Badge variant="outline">
                                        {screenplay.pageCount ? `${screenplay.pageCount} pages` : 'Processing...'}
                                    </Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <User className="w-4 h-4 mr-1" />
                                        {screenplay.creatorName}
                                    </div>
                                </div>
                            </div>

                            {/* Screenplay Reader/Viewer */}
                            {screenplay.isProcessed && screenplay.content ? (
                                // Use interactive reader for processed screenplays
                                <ScreenplayReader screenplay={screenplay} />
                            ) : (
                                // Fall back to PDF viewer for unprocessed screenplays
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Read Screenplay
                                            {screenplay.processingStatus === 'processing' && (
                                                <Badge variant="secondary" className="ml-2">
                                                    Processing...
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {screenplay.processingStatus === 'processing' ? (
                                                <div className="text-center py-8">
                                                    <div className="w-full max-w-md mx-auto mb-4">
                                                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                            <span>Processing...</span>
                                                            <span>{screenplay.processingProgress || 0}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                                                style={{ width: `${screenplay.processingProgress || 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Processing screenplay for interactive reading...
                                                    </p>
                                                </div>
                                            ) : screenplay.processingStatus === 'failed' ? (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-red-600 mb-4">
                                                        Failed to process screenplay for interactive reading.
                                                    </p>
                                                    {(screenplay.processingAttempts || 0) < (screenplay.maxRetryAttempts || 3) && (
                                                        <div className="mb-4">
                                                            <Button
                                                                onClick={handleRetryProcessing}
                                                                disabled={isRetrying}
                                                                variant="outline"
                                                                size="sm"
                                                                className="mr-2"
                                                            >
                                                                {isRetrying ? (
                                                                    <>
                                                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                                        Retrying...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <RefreshCw className="w-4 h-4 mr-2" />
                                                                        Retry Processing
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <span className="text-xs text-muted-foreground">
                                                                Attempt {(screenplay.processingAttempts || 0) + 1} of {screenplay.maxRetryAttempts || 3}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        You can still view the original PDF below.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    Viewing original PDF. Interactive features will be available once processing is complete.
                                                </div>
                                            )}

                                            <div
                                                className="w-full h-[600px] border rounded-lg overflow-hidden"
                                                onMouseUp={handleTextSelection}
                                            >
                                                <iframe
                                                    src={`${screenplay.fileUrl}#toolbar=1&view=FitH`}
                                                    className="w-full h-full"
                                                    title={screenplay.title}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>File size: {formatFileSize(screenplay.fileSize)}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(screenplay.fileUrl, '_blank')}
                                                >
                                                    Open in New Tab
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Synopsis */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Synopsis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap">{screenplay.synopsis}</p>
                                    {screenplay.tags && screenplay.tags.length > 0 && (
                                        <div className="mt-4">
                                            <div className="text-sm font-medium mb-2">Tags:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {screenplay.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quote Comment Form */}
                            {showQuoteComment && selectedText && user && (
                                <Card className="border-primary/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Comment on Selection</CardTitle>
                                        <div className="bg-accent/20 p-3 rounded-lg border">
                                            <div className="text-sm font-medium mb-1">Selected text:</div>
                                            <div className="text-sm italic">&ldquo;{selectedText}&rdquo;</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleQuoteCommentSubmit} className="space-y-4">
                                            <Textarea
                                                placeholder="Share your thoughts on this section..."
                                                value={quoteComment}
                                                onChange={(e) => setQuoteComment(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="flex space-x-2">
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmittingComment || !quoteComment.trim()}
                                                    size="sm"
                                                >
                                                    {isSubmittingComment ? "Submitting..." : "Submit Comment"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowQuoteComment(false);
                                                        setSelectedText("");
                                                        setQuoteComment("");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Comments Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Discussion ({comments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Add Comment Form */}
                                    {user && (
                                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                                            <Textarea
                                                placeholder="Share your thoughts about this screenplay..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={3}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={isSubmittingComment || !newComment.trim()}
                                            >
                                                {isSubmittingComment ? "Submitting..." : "Add Comment"}
                                            </Button>
                                        </form>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {comments.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>No comments yet. Be the first to share your thoughts!</p>
                                            </div>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} className="border-b border-border/50 pb-4 last:border-0">
                                                    <div className="flex items-start space-x-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                                            <AvatarFallback>
                                                                {comment.userName.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="font-medium text-sm">
                                                                    {comment.userName}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(comment.createdAt)}
                                                                </span>
                                                            </div>
                                                            {comment.selectedText && (
                                                                <div className="bg-accent/20 p-2 rounded text-xs mb-2 border-l-2 border-primary/50">
                                                                    <div className="font-medium mb-1">Referenced:</div>
                                                                    <div className="italic">&ldquo;{comment.selectedText}&rdquo;</div>
                                                                </div>
                                                            )}
                                                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Rating</span>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm">
                                                {screenplay.averageRating?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Comments</span>
                                        <span className="text-sm">{screenplay.totalComments || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Views</span>
                                        <span className="text-sm">{screenplay.viewCount || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Published</span>
                                        <span className="text-sm">{formatDate(screenplay.createdAt)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Creator Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>About the Writer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {(screenplay.creatorName || screenplay.author || '??').slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{screenplay.creatorName}</div>
                                            <div className="text-sm text-muted-foreground">Screenplay Writer</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Share Screenplay</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowShareModal(false)}
                                    className="h-8 w-8 p-0 rounded-full"
                                >
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg">
                                <FileText className="w-12 h-12 text-primary" />
                                <div className="flex-1">
                                    <div className="font-medium line-clamp-1">{screenplay.title}</div>
                                    <div className="text-sm text-muted-foreground">by {screenplay.creatorName}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Share URL:</div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={window.location.href}
                                        readOnly
                                        className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
