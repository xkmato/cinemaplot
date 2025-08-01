'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface GetUserNameModalProps {
    onSubmit: (name: string) => Promise<void>;
}

export default function GetUserNameModal({ onSubmit }: GetUserNameModalProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await onSubmit(name.trim());
        } catch (error) {
            console.error("Error submitting name:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Welcome to CinemaPlot!</CardTitle>
                    <CardDescription>
                        Please tell us your name so others can see who created events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your display name"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
                            {isLoading ? "Saving..." : "Continue"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
