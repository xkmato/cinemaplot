'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/lib/auth-context';
import { Screenplay, ScreenplayPermissions } from '@/lib/types';
import {
    Globe,
    Lock,
    Mail,
    Plus,
    Settings,
    Trash2,
    Users,
    X
} from 'lucide-react';
import { useState } from 'react';

interface ScreenplayPrivacyManagerProps {
    screenplay: Screenplay;
    onClose?: () => void;
}

export default function ScreenplayPrivacyManager({ screenplay, onClose }: ScreenplayPrivacyManagerProps) {
    const { user, updateScreenplayPrivacy, inviteCollaborator, removeCollaborator } = useAppContext();
    const [visibility, setVisibility] = useState<'private' | 'public' | 'collaborators'>(
        screenplay.visibility || (screenplay.isPublic ? 'public' : 'private')
    );
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [invitePermissions] = useState<ScreenplayPermissions>({
        canRead: true,
        canComment: true,
        canHighlight: true,
        canDownload: false,
        canInvite: false
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);

    // Check if current user is the owner
    if (!user || screenplay.authorId !== user.uid) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">You don&apos;t have permission to manage privacy settings for this screenplay.</p>
                </CardContent>
            </Card>
        );
    }

    const handleVisibilityChange = async (newVisibility: 'private' | 'public' | 'collaborators') => {
        setIsUpdating(true);
        try {
            await updateScreenplayPrivacy(screenplay.id, newVisibility);
            setVisibility(newVisibility);
        } catch (error) {
            console.error('Error updating privacy:', error);
            alert('Failed to update privacy settings. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleInviteCollaborator = async () => {
        if (!inviteEmail.trim()) return;

        setIsInviting(true);
        try {
            await inviteCollaborator(
                screenplay.id,
                inviteEmail.trim(),
                invitePermissions,
                inviteMessage.trim() || undefined
            );
            setInviteEmail('');
            setInviteMessage('');
            setShowInviteForm(false);
            alert(`Invitation sent to ${inviteEmail}`);
        } catch (error) {
            console.error('Error inviting collaborator:', error);
            alert(error instanceof Error ? error.message : 'Failed to send invitation. Please try again.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveCollaborator = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this collaborator?')) return;

        try {
            await removeCollaborator(screenplay.id, userId);
        } catch (error) {
            console.error('Error removing collaborator:', error);
            alert('Failed to remove collaborator. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                            <Settings className="w-5 h-5 mr-2" />
                            Privacy Settings: {screenplay.title}
                        </CardTitle>
                        {onClose && (
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Visibility Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Visibility
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Private */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${visibility === 'private'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleVisibilityChange('private')}
                        >
                            <div className="flex items-center mb-2">
                                <Lock className="w-5 h-5 mr-2" />
                                <span className="font-medium">Private</span>
                                {visibility === 'private' && (
                                    <Badge variant="default" className="ml-2">Current</Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                Only you can access this screenplay
                            </p>
                        </div>

                        {/* Collaborators Only */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${visibility === 'collaborators'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleVisibilityChange('collaborators')}
                        >
                            <div className="flex items-center mb-2">
                                <Users className="w-5 h-5 mr-2" />
                                <span className="font-medium">Collaborators</span>
                                {visibility === 'collaborators' && (
                                    <Badge variant="default" className="ml-2">Current</Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                Only invited collaborators can access
                            </p>
                        </div>

                        {/* Public */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${visibility === 'public'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleVisibilityChange('public')}
                        >
                            <div className="flex items-center mb-2">
                                <Globe className="w-5 h-5 mr-2" />
                                <span className="font-medium">Public</span>
                                {visibility === 'public' && (
                                    <Badge variant="default" className="ml-2">Current</Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                Anyone can discover and read this screenplay
                            </p>
                        </div>
                    </div>

                    {isUpdating && (
                        <div className="flex items-center justify-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            <span className="text-sm text-gray-600">Updating privacy settings...</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Collaborators Management */}
            {(visibility === 'collaborators' || screenplay.collaborators?.length || screenplay.invitedCollaborators?.length) && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Collaborators
                            </CardTitle>
                            <Button
                                size="sm"
                                onClick={() => setShowInviteForm(!showInviteForm)}
                                className="flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Invite
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Invite Form */}
                        {showInviteForm && (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="invite-email">Email Address</Label>
                                        <Input
                                            id="invite-email"
                                            type="email"
                                            placeholder="colleague@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="invite-permissions">Permissions</Label>
                                        <Select value="standard" onValueChange={() => { }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select permissions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard (Read, Comment, Highlight)</SelectItem>
                                                <SelectItem value="advanced">Advanced (+ Download, Invite)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                                    <Textarea
                                        id="invite-message"
                                        placeholder="Add a personal message to your invitation..."
                                        value={inviteMessage}
                                        onChange={(e) => setInviteMessage(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowInviteForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleInviteCollaborator}
                                        disabled={!inviteEmail.trim() || isInviting}
                                    >
                                        {isInviting ? 'Sending...' : 'Send Invitation'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Pending Invitations */}
                        {screenplay.invitedCollaborators && screenplay.invitedCollaborators.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Pending Invitations</h4>
                                <div className="space-y-2">
                                    {screenplay.invitedCollaborators.map((invitation) => (
                                        <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-yellow-600" />
                                                <div>
                                                    <p className="font-medium">{invitation.invitedEmail}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Invited {new Date(invitation.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="secondary">Pending</Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {/* TODO: Cancel invitation */ }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Collaborators */}
                        {screenplay.collaborators && screenplay.collaborators.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Active Collaborators</h4>
                                <div className="space-y-2">
                                    {screenplay.collaborators.map((collaboratorId) => (
                                        <div key={collaboratorId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-green-600" />
                                                <div>
                                                    <p className="font-medium">Collaborator</p>
                                                    <p className="text-sm text-gray-600">
                                                        User ID: {collaboratorId}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="default">Active</Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveCollaborator(collaboratorId)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Collaborators */}
                        {(!screenplay.collaborators || screenplay.collaborators.length === 0) &&
                            (!screenplay.invitedCollaborators || screenplay.invitedCollaborators.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No collaborators yet. Invite people to collaborate on your screenplay!</p>
                                </div>
                            )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
