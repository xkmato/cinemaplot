'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuditionRole, AuditionTape, Event } from "@/lib/types";
import { Clock, ExternalLink, Eye, FileText, MessageCircle, Play, Star, User } from "lucide-react";
import { useState } from "react";

interface AuditionTapeManagerProps {
    auditionEvent: Event;
    tapes: AuditionTape[];
    roles: AuditionRole[];
    onUpdateTapeStatus: (tapeId: string, status: AuditionTape['status'], notes?: string) => Promise<void>;
    canReview: boolean; // Whether current user can review tapes
}

export default function AuditionTapeManager({
    auditionEvent,
    tapes,
    roles,
    onUpdateTapeStatus,
    canReview
}: AuditionTapeManagerProps) {
    const [selectedTape, setSelectedTape] = useState<AuditionTape | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (tape: AuditionTape, newStatus: AuditionTape['status']) => {
        setIsUpdating(true);
        try {
            await onUpdateTapeStatus(tape.id, newStatus, reviewNotes);
            setSelectedTape(null);
            setReviewNotes('');
        } catch (error) {
            console.error('Error updating tape status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredTapes = tapes.filter(tape => {
        if (filterStatus !== 'all' && tape.status !== filterStatus) return false;
        if (filterRole !== 'all' && tape.roleId !== filterRole) return false;
        return true;
    });

    const getStatusColor = (status: AuditionTape['status']) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'reviewed': return 'bg-gray-100 text-gray-800';
            case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: AuditionTape['status']) => {
        switch (status) {
            case 'submitted': return <Clock className="w-3 h-3" />;
            case 'reviewed': return <Eye className="w-3 h-3" />;
            case 'shortlisted': return <Star className="w-3 h-3" />;
            case 'accepted': return <Play className="w-3 h-3" />;
            case 'rejected': return <FileText className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const getRoleName = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        return role?.roleName || 'Unknown Role';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tapesByStatus = {
        submitted: tapes.filter(t => t.status === 'submitted').length,
        reviewed: tapes.filter(t => t.status === 'reviewed').length,
        shortlisted: tapes.filter(t => t.status === 'shortlisted').length,
        accepted: tapes.filter(t => t.status === 'accepted').length,
        rejected: tapes.filter(t => t.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Audition Submissions</h2>
                    <p className="text-muted-foreground">
                        {tapes.length} total submissions for {auditionEvent.title}
                    </p>
                </div>

                {/* Status Summary */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(tapesByStatus).map(([status, count]) => (
                        <Badge key={status} variant="outline" className="capitalize">
                            {getStatusIcon(status as AuditionTape['status'])}
                            <span className="ml-1">{status}: {count}</span>
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Label>Filter by Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="submitted">New Submissions</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1">
                    <Label>Filter by Role</Label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                    {role.roleName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tapes List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTapes.map(tape => (
                    <Card key={tape.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{tape.submitterName}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Auditioning for: <span className="font-medium">{getRoleName(tape.roleId)}</span>
                                    </p>
                                </div>
                                <Badge className={getStatusColor(tape.status)}>
                                    {getStatusIcon(tape.status)}
                                    <span className="ml-1 capitalize">{tape.status}</span>
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Submitted: {formatDate(tape.submittedAt)}
                                </div>
                                {tape.reviewedAt && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Eye className="w-3 h-3" />
                                        Reviewed: {formatDate(tape.reviewedAt)}
                                    </div>
                                )}
                            </div>

                            {tape.notes && (
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                        <MessageCircle className="w-3 h-3" />
                                        Actor&apos;s Notes:
                                    </div>
                                    <p className="text-xs bg-muted/20 p-2 rounded">{tape.notes}</p>
                                </div>
                            )}

                            {tape.reviewNotes && (
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                        <User className="w-3 h-3" />
                                        Review Notes:
                                    </div>
                                    <p className="text-xs bg-blue-50 p-2 rounded border border-blue-200">{tape.reviewNotes}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => window.open(tape.tapeUrl, '_blank')}
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View Tape
                                </Button>

                                {canReview && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedTape(tape)}
                                    >
                                        Review
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTapes.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Submissions Found</h3>
                    <p className="text-muted-foreground">
                        {tapes.length === 0
                            ? 'No audition tapes have been submitted yet.'
                            : 'No submissions match your current filters.'
                        }
                    </p>
                </div>
            )}

            {/* Review Modal */}
            {selectedTape && canReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Review Audition Tape</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {selectedTape.submitterName} - {getRoleName(selectedTape.roleId)}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.open(selectedTape.tapeUrl, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Audition Tape
                                </Button>
                            </div>

                            <div>
                                <Label htmlFor="reviewNotes">Review Notes (optional)</Label>
                                <Textarea
                                    id="reviewNotes"
                                    placeholder="Add your feedback about this audition..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                    onClick={() => handleStatusUpdate(selectedTape, 'shortlisted')}
                                    disabled={isUpdating}
                                >
                                    <Star className="w-4 h-4 mr-1" />
                                    Shortlist
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleStatusUpdate(selectedTape, 'accepted')}
                                    disabled={isUpdating}
                                >
                                    <Play className="w-4 h-4 mr-1" />
                                    Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(selectedTape, 'reviewed')}
                                    disabled={isUpdating}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Mark Reviewed
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleStatusUpdate(selectedTape, 'rejected')}
                                    disabled={isUpdating}
                                >
                                    Reject
                                </Button>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button variant="ghost" onClick={() => {
                                    setSelectedTape(null);
                                    setReviewNotes('');
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
