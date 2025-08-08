'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuditionRole, Event, PageRange } from "@/lib/types";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface AddAuditionRolesProps {
    event: Event;
    screenplay?: { pageCount?: number };
    onClose: () => void;
    onAddRoles: (eventId: string, newRoles: AuditionRole[]) => Promise<void>;
}

export default function AddAuditionRoles({ event, screenplay, onClose, onAddRoles }: AddAuditionRolesProps) {
    const [newRoles, setNewRoles] = useState<AuditionRole[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const maxPages = screenplay?.pageCount || 120;

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
        setNewRoles(prev => [...prev, newRole]);
    };

    const removeRole = (roleId: string) => {
        setNewRoles(prev => prev.filter(role => role.id !== roleId));
    };

    const updateRole = (roleId: string, updates: Partial<AuditionRole>) => {
        setNewRoles(prev => prev.map(role =>
            role.id === roleId ? { ...role, ...updates } : role
        ));
    };

    const addPageRange = (roleId: string) => {
        setNewRoles(prev => prev.map(role =>
            role.id === roleId
                ? {
                    ...role,
                    pageRanges: [...role.pageRanges, { startPage: 1, endPage: 1 }]
                }
                : role
        ));
    };

    const removePageRange = (roleId: string, rangeIndex: number) => {
        setNewRoles(prev => prev.map(role =>
            role.id === roleId
                ? {
                    ...role,
                    pageRanges: role.pageRanges.filter((_, index) => index !== rangeIndex)
                }
                : role
        ));
    };

    const updatePageRange = (roleId: string, rangeIndex: number, updates: Partial<PageRange>) => {
        setNewRoles(prev => prev.map(role =>
            role.id === roleId
                ? {
                    ...role,
                    pageRanges: role.pageRanges.map((range, index) =>
                        index === rangeIndex ? { ...range, ...updates } : range
                    )
                }
                : role
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newRoles.length === 0) {
            setError('Please add at least one role.');
            return;
        }

        // Validate roles
        for (const role of newRoles) {
            if (!role.roleName.trim()) {
                setError('All roles must have a name.');
                return;
            }
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onAddRoles(event.id, newRoles);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add roles');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-gradient-to-b from-card to-card/95 animate-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">Add New Roles</CardTitle>
                            <p className="text-muted-foreground mt-1">
                                Add additional casting roles to &ldquo;{event.title}&rdquo;
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Existing Roles Display */}
                        {event.auditionRoles && event.auditionRoles.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-3">Existing Roles</h3>
                                <div className="space-y-2 mb-4">
                                    {event.auditionRoles.map((role, index) => (
                                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{role.roleName}</span>
                                                <span className="text-sm text-muted-foreground capitalize">
                                                    {role.status || 'open'}
                                                </span>
                                            </div>
                                            {role.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Roles Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">New Roles</h3>
                                <Button type="button" onClick={addRole} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Role
                                </Button>
                            </div>

                            {newRoles.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="pt-6">
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>No new roles added yet.</p>
                                            <Button type="button" onClick={addRole} className="mt-4">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Your First Role
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    {newRoles.map((role, roleIndex) => (
                                        <Card key={role.id} className="border-l-4 border-l-primary">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-lg">Role {roleIndex + 1}</CardTitle>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRole(role.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`roleName-${role.id}`}>Role Name *</Label>
                                                        <Input
                                                            id={`roleName-${role.id}`}
                                                            placeholder="e.g., SARAH, DETECTIVE JONES"
                                                            value={role.roleName}
                                                            onChange={(e) => updateRole(role.id, { roleName: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`numberOfSlots-${role.id}`}>Number of Slots</Label>
                                                        <Input
                                                            id={`numberOfSlots-${role.id}`}
                                                            type="number"
                                                            min="1"
                                                            value={role.numberOfSlots || 1}
                                                            onChange={(e) => updateRole(role.id, { numberOfSlots: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor={`description-${role.id}`}>Role Description</Label>
                                                    <Textarea
                                                        id={`description-${role.id}`}
                                                        placeholder="Describe the character, personality, key scenes..."
                                                        value={role.description}
                                                        onChange={(e) => updateRole(role.id, { description: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor={`requirements-${role.id}`}>Requirements</Label>
                                                    <Input
                                                        id={`requirements-${role.id}`}
                                                        placeholder="e.g., Age 25-35, Female, Athletic build"
                                                        value={role.requirements}
                                                        onChange={(e) => updateRole(role.id, { requirements: e.target.value })}
                                                    />
                                                </div>

                                                {/* Page Ranges */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Label>Page Ranges to Read</Label>
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

                                                    <div className="space-y-3">
                                                        {role.pageRanges.map((range, rangeIndex) => (
                                                            <div key={rangeIndex} className="flex items-end gap-3 p-3 bg-muted/20 rounded-lg">
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
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || newRoles.length === 0}
                            >
                                {isSubmitting ? 'Adding Roles...' : `Add ${newRoles.length} Role${newRoles.length !== 1 ? 's' : ''}`}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
