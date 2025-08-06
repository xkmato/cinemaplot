'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/lib/auth-context';
import { ScreenplayInvitation } from '@/lib/types';
import { Check, FileText, Mail, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface InvitationClientProps {
    invitation: ScreenplayInvitation;
    token: string;
}

export default function InvitationClient({ invitation, token }: InvitationClientProps) {
    const { user } = useAppContext();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleAccept = async () => {
        if (!user) {
            // Redirect to login with return URL
            router.push(`/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (user.email !== invitation.invitedEmail) {
            setError('This invitation is for a different email address. Please log in with the correct account.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch(`/api/invitations/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to accept invitation');
            }

            setSuccess(true);

            // Redirect to the screenplay after a brief delay
            setTimeout(() => {
                router.push(`/screenplays/${data.screenplayId}`);
            }, 2000);

        } catch (error) {
            console.error('Error accepting invitation:', error);
            setError(error instanceof Error ? error.message : 'Failed to accept invitation');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch(`/api/invitations/${token}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to decline invitation');
            }

            // Redirect to home page
            router.push('/');

        } catch (error) {
            console.error('Error declining invitation:', error);
            setError(error instanceof Error ? error.message : 'Failed to decline invitation');
        } finally {
            setIsProcessing(false);
        }
    };

    if (invitation.status !== 'pending') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center">
                            {invitation.status === 'accepted' ? (
                                <Check className="w-6 h-6 mr-2 text-green-600" />
                            ) : (
                                <X className="w-6 h-6 mr-2 text-red-600" />
                            )}
                            Invitation {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                            This invitation has already been {invitation.status}.
                        </p>
                        {invitation.status === 'accepted' && (
                            <Button onClick={() => router.push(`/screenplays/${invitation.screenplayId}`)}>
                                View Screenplay
                            </Button>
                        )}
                        {invitation.status === 'declined' && (
                            <Button onClick={() => router.push('/')}>
                                Go to Home
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center text-green-600">
                            <Check className="w-6 h-6 mr-2" />
                            Invitation Accepted!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                            You&apos;ve successfully joined as a collaborator. Redirecting to the screenplay...
                        </p>
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            <span className="text-sm">Loading screenplay...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center">
                        <Mail className="w-6 h-6 mr-2" />
                        Screenplay Collaboration Invitation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Invitation Details */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-lg mb-2">
                                You&apos;ve been invited to collaborate on a screenplay!
                            </p>
                            <p className="text-muted-foreground">
                                Invited by: <strong>{invitation.invitedBy}</strong>
                            </p>
                            <p className="text-muted-foreground">
                                Invited to: <strong>{invitation.invitedEmail}</strong>
                            </p>
                        </div>

                        {/* Screenplay Info */}
                        <div className="p-4 bg-accent/20 rounded-lg border">
                            <div className="flex items-center mb-3">
                                <FileText className="w-5 h-5 mr-2" />
                                <span className="font-medium">Screenplay Details</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Screenplay ID: {invitation.screenplayId}</p>
                                <p>Invited: {new Date(invitation.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="p-4 bg-accent/20 rounded-lg border">
                            <div className="flex items-center mb-3">
                                <Users className="w-5 h-5 mr-2" />
                                <span className="font-medium">Your Permissions</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {invitation.permissions.canRead && (
                                    <Badge variant="secondary">Read</Badge>
                                )}
                                {invitation.permissions.canComment && (
                                    <Badge variant="secondary">Comment</Badge>
                                )}
                                {invitation.permissions.canHighlight && (
                                    <Badge variant="secondary">Highlight</Badge>
                                )}
                                {invitation.permissions.canDownload && (
                                    <Badge variant="secondary">Download</Badge>
                                )}
                                {invitation.permissions.canInvite && (
                                    <Badge variant="secondary">Invite Others</Badge>
                                )}
                            </div>
                        </div>

                        {/* Personal Message */}
                        {invitation.message && (
                            <div className="p-4 bg-accent/20 rounded-lg border">
                                <div className="font-medium mb-2">Personal Message:</div>
                                <p className="text-sm italic">&ldquo;{invitation.message}&rdquo;</p>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* User Status */}
                    {!user ? (
                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700 mb-3">
                                You need to be logged in to accept this invitation.
                            </p>
                            <Button onClick={handleAccept} className="mr-2">
                                Log In to Accept
                            </Button>
                        </div>
                    ) : user.email !== invitation.invitedEmail ? (
                        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700 mb-3">
                                This invitation is for <strong>{invitation.invitedEmail}</strong>, but you&apos;re logged in as <strong>{user.email}</strong>.
                            </p>
                            <p className="text-yellow-600 text-sm">
                                Please log in with the correct account to accept this invitation.
                            </p>
                        </div>
                    ) : (
                        /* Action Buttons */
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={handleAccept}
                                disabled={isProcessing}
                                className="flex items-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Accept Invitation
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDecline}
                                disabled={isProcessing}
                                className="flex items-center"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
