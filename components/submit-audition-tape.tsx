'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuditionRole, Event, PageRange } from "@/lib/types";
import { Calendar, Clock, ExternalLink, FileText, MapPin, Send, User, Users } from "lucide-react";
import { useState } from "react";

interface SubmitAuditionTapeProps {
    auditionEvent: Event;
    roles: AuditionRole[];
    onSubmit: (submission: TapeSubmission) => Promise<void>;
    onClose: () => void;
}

export interface TapeSubmission {
    roleId: string;
    tapeUrl: string;
    notes?: string;
    submitterName: string;
    submitterEmail?: string;
}

export default function SubmitAuditionTape({
    auditionEvent,
    roles,
    onSubmit,
    onClose
}: SubmitAuditionTapeProps) {
    const [formData, setFormData] = useState<TapeSubmission>({
        roleId: '',
        tapeUrl: '',
        notes: '',
        submitterName: '',
        submitterEmail: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.roleId || !formData.tapeUrl || !formData.submitterName) {
            setError('Please fill in all required fields.');
            return;
        }

        // Basic URL validation
        try {
            new URL(formData.tapeUrl);
        } catch {
            setError('Please enter a valid URL for your audition tape.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit audition tape');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedRole = roles.find(role => role.id === formData.roleId);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPageRanges = (pageRanges: PageRange[]) => {
        return pageRanges.map(range => {
            if (range.startPage === range.endPage) {
                return `Page ${range.startPage}${range.description ? ` (${range.description})` : ''}`;
            }
            return `Pages ${range.startPage}-${range.endPage}${range.description ? ` (${range.description})` : ''}`;
        }).join(', ');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-0">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Submit Audition Tape</CardTitle>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <h3 className="font-medium text-foreground">{auditionEvent.title}</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(auditionEvent.date)}
                                </div>
                                {auditionEvent.time && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {auditionEvent.time}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {auditionEvent.location}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {auditionEvent.description && (
                            <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                                <h4 className="font-medium mb-2">Audition Information</h4>
                                <p className="text-sm text-muted-foreground">{auditionEvent.description}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Your Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                className="pl-10"
                                                placeholder="Enter your full name"
                                                value={formData.submitterName}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    submitterName: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email (optional)</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={formData.submitterEmail}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                submitterEmail: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Role Selection</h3>
                                <div>
                                    <Label>Which role are you auditioning for? *</Label>
                                    <Select
                                        value={formData.roleId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.filter(role => role.status === 'open').map(role => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{role.roleName}</span>
                                                        {role.numberOfSlots && role.numberOfSlots > 1 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ({role.numberOfSlots} slots)
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Show selected role details */}
                                {selectedRole && (
                                    <Card className="border-2 border-primary/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Users className="w-5 h-5" />
                                                {selectedRole.roleName}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {selectedRole.description && (
                                                <div>
                                                    <h4 className="font-medium text-sm">Character Description</h4>
                                                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                                                </div>
                                            )}

                                            {selectedRole.requirements && (
                                                <div>
                                                    <h4 className="font-medium text-sm">Requirements</h4>
                                                    <p className="text-sm text-muted-foreground">{selectedRole.requirements}</p>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="font-medium text-sm flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    Script Pages to Prepare
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatPageRanges(selectedRole.pageRanges)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Tape Submission */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Audition Tape</h3>
                                <div>
                                    <Label htmlFor="tapeUrl">Video URL *</Label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="tapeUrl"
                                            className="pl-10"
                                            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                            value={formData.tapeUrl}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                tapeUrl: e.target.value
                                            }))}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload your video to YouTube, Vimeo, or any other platform and paste the link here.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any additional information you'd like to share about your audition..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            notes: e.target.value
                                        }))}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Guidelines */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Submission Guidelines</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Make sure your video is publicly accessible</li>
                                    <li>• Include good lighting and clear audio</li>
                                    <li>• Start by introducing yourself and the role</li>
                                    <li>• Perform the scenes from the specified pages</li>
                                    <li>• Keep your submission under 5 minutes if possible</li>
                                </ul>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.roleId || !formData.tapeUrl || !formData.submitterName}
                                >
                                    {isSubmitting ? (
                                        'Submitting...'
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Audition
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
