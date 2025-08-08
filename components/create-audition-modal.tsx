'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuditionRole, PageRange, Screenplay } from "@/lib/types";
import { Calendar, Clock, MapPin, Plus, Trash2, Users, X } from "lucide-react";
import { useState } from "react";

interface CreateAuditionModalProps {
    screenplay: Screenplay;
    onClose: () => void;
    onSubmit: (auditionData: AuditionFormData) => Promise<void>;
}

export interface AuditionFormData {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    roles: AuditionRole[];
}

export default function CreateAuditionModal({ screenplay, onClose, onSubmit }: CreateAuditionModalProps) {
    const [formData, setFormData] = useState<AuditionFormData>({
        title: `${screenplay.title} - Auditions`,
        description: '',
        date: '',
        time: '',
        location: '',
        roles: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.roles.length === 0) {
            setError('Please add at least one role for the audition.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create audition');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addRole = () => {
        const newRole: AuditionRole = {
            id: `role-${Date.now()}`,
            roleName: '',
            description: '',
            pageRanges: [{ startPage: 1, endPage: 1 }],
            requirements: '',
            numberOfSlots: 1,
            status: 'open'
        };
        setFormData(prev => ({
            ...prev,
            roles: [...prev.roles, newRole]
        }));
    };

    const updateRole = (roleId: string, updates: Partial<AuditionRole>) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.map(role =>
                role.id === roleId ? { ...role, ...updates } : role
            )
        }));
    };

    const removeRole = (roleId: string) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.filter(role => role.id !== roleId)
        }));
    };

    const addPageRange = (roleId: string) => {
        const newPageRange: PageRange = { startPage: 1, endPage: 1 };
        updateRole(roleId, {
            pageRanges: [...(formData.roles.find(r => r.id === roleId)?.pageRanges || []), newPageRange]
        });
    };

    const updatePageRange = (roleId: string, rangeIndex: number, updates: Partial<PageRange>) => {
        const role = formData.roles.find(r => r.id === roleId);
        if (role) {
            const updatedRanges = role.pageRanges.map((range, index) =>
                index === rangeIndex ? { ...range, ...updates } : range
            );
            updateRole(roleId, { pageRanges: updatedRanges });
        }
    };

    const removePageRange = (roleId: string, rangeIndex: number) => {
        const role = formData.roles.find(r => r.id === roleId);
        if (role && role.pageRanges.length > 1) {
            const updatedRanges = role.pageRanges.filter((_, index) => index !== rangeIndex);
            updateRole(roleId, { pageRanges: updatedRanges });
        }
    };

    const maxPages = screenplay.pageCount || 1;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                        <CardTitle className="text-2xl font-bold">Create Audition Event</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Event Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="location"
                                            className="pl-10"
                                            placeholder="e.g., Studio A, 123 Main St"
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="date"
                                            type="date"
                                            className="pl-10"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time">Time *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="time"
                                            type="time"
                                            className="pl-10"
                                            value={formData.time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide details about the audition process, what to prepare, etc."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            {/* Roles Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Audition Roles</h3>
                                    <Button type="button" onClick={addRole} variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Role
                                    </Button>
                                </div>

                                {formData.roles.map((role, roleIndex) => (
                                    <Card key={role.id} className="border-2">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                            <h4 className="font-medium">Role {roleIndex + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeRole(role.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Character Name *</Label>
                                                    <Input
                                                        placeholder="e.g., SARAH, JOHN"
                                                        value={role.roleName}
                                                        onChange={(e) => updateRole(role.id, { roleName: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Number of Slots</Label>
                                                    <Select
                                                        value={role.numberOfSlots?.toString()}
                                                        onValueChange={(value) => updateRole(role.id, { numberOfSlots: parseInt(value) })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5].map(num => (
                                                                <SelectItem key={num} value={num.toString()}>
                                                                    {num} {num === 1 ? 'actor' : 'actors'}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Role Description</Label>
                                                <Textarea
                                                    placeholder="Describe this character and what you're looking for"
                                                    value={role.description}
                                                    onChange={(e) => updateRole(role.id, { description: e.target.value })}
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label>Requirements</Label>
                                                <Input
                                                    placeholder="e.g., Age 25-35, Male, Experience with comedy"
                                                    value={role.requirements}
                                                    onChange={(e) => updateRole(role.id, { requirements: e.target.value })}
                                                />
                                            </div>

                                            {/* Page Ranges */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>Script Pages to Read</Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addPageRange(role.id)}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Add Range
                                                    </Button>
                                                </div>

                                                {role.pageRanges.map((range, rangeIndex) => (
                                                    <div key={rangeIndex} className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <div>
                                                                <Label className="text-xs">From Page</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max={maxPages}
                                                                    value={range.startPage}
                                                                    onChange={(e) => updatePageRange(role.id, rangeIndex, {
                                                                        startPage: parseInt(e.target.value) || 1
                                                                    })}
                                                                    className="w-20"
                                                                />
                                                            </div>
                                                            <span className="text-muted-foreground mt-5">to</span>
                                                            <div>
                                                                <Label className="text-xs">To Page</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max={maxPages}
                                                                    value={range.endPage}
                                                                    onChange={(e) => updatePageRange(role.id, rangeIndex, {
                                                                        endPage: parseInt(e.target.value) || 1
                                                                    })}
                                                                    className="w-20"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label className="text-xs">Description (optional)</Label>
                                                                <Input
                                                                    placeholder="e.g., Coffee shop scene"
                                                                    value={range.description || ''}
                                                                    onChange={(e) => updatePageRange(role.id, rangeIndex, {
                                                                        description: e.target.value
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                        {role.pageRanges.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removePageRange(role.id, rangeIndex)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {formData.roles.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No roles added yet. Click &quot;Add Role&quot; to get started.</p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || formData.roles.length === 0}>
                                    {isSubmitting ? 'Creating...' : 'Create Audition'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
