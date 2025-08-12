'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function EmailTestPage() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Only show this page in development
    if (process.env.NODE_ENV !== 'development') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card>
                    <CardContent className="pt-6">
                        <p>This page is only available in development mode.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleTestEmail = async () => {
        if (!email) {
            setResult('❌ Email is required');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/test/welcome-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    displayName,
                    username,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult('✅ Welcome email sent successfully!');
            } else {
                setResult(`❌ Failed to send email: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>🧪 Email Testing Tool</CardTitle>
                        <CardDescription>
                            Test welcome emails and other email functionality in development mode.
                            Make sure you have configured your Mailgun credentials in the .env file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="test@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleTestEmail}
                            disabled={loading || !email}
                            className="w-full"
                        >
                            {loading ? 'Sending...' : 'Send Test Welcome Email'}
                        </Button>

                        {result && (
                            <div className={`p-4 rounded-lg border ${result.startsWith('✅')
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                {result}
                            </div>
                        )}

                        <div className="text-sm text-muted-foreground space-y-2">
                            <p><strong>Setup Instructions:</strong></p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Set up a Mailgun account and verify your domain</li>
                                <li>Add your Mailgun credentials to .env file</li>
                                <li>If using sandbox domain, add test email to authorized recipients</li>
                                <li>Enter an email address and click the test button</li>
                            </ol>

                            <p className="mt-4"><strong>Required .env variables:</strong></p>
                            <code className="block bg-gray-100 p-2 rounded text-xs">
                                MAILGUN_API_KEY=your_api_key<br />
                                MAILGUN_DOMAIN=your_domain<br />
                                MAILGUN_FROM_EMAIL=noreply@your_domain
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
