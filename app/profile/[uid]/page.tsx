
"use client";
import EventCard from "@/components/event-card";
import ScreenplayCard from "@/components/screenplay-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
    Award,
    Briefcase,
    Calendar,
    Camera,
    Edit3,
    Film,
    Link as LinkIcon,
    Mail,
    MapPin,
    Play,
    Save,
    Share2,
    Star,
    User,
    Users,
    X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";



interface UserProfile {
    uid: string;
    displayName?: string;
    email?: string;
    username?: string;
    bio?: string;
    roles?: string[];
    location?: string;
    website?: string;
    joinedAt?: string;
    portfolioDescription?: string;
    achievements?: string[];
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        website?: string;
    };
}

const FILM_ROLES = [
    "Director",
    "Producer",
    "Writer",
    "Screenwriter",
    "Actor",
    "Editor",
    "Cinematographer",
    "Director of Photography",
    "Composer",
    "Sound Designer",
    "Production Designer",
    "Art Director",
    "Casting Director",
    "Costume Designer",
    "Makeup Artist",
    "VFX Artist",
    "Animator",
    "Storyboard Artist",
    "Script Supervisor",
    "Gaffer",
    "Camera Operator",
    "Boom Operator",
    "Assistant Director",
    "Line Producer",
    "Executive Producer",
    "Distributor",
    "Film Critic",
    "Film Student",
    "Other"
];

export default function UserProfilePage() {
    const { user, events, movies, screenplays, refreshUserProfile } = useAppContext();
    const routeParams = useParams();
    const profileUid = (routeParams as { uid?: string })?.uid || user?.uid;
    const isOwnProfile = user && user.uid === profileUid;

    // Profile state
    const [profile, setProfile] = React.useState<UserProfile>({
        uid: profileUid || '',
        displayName: '',
        email: '',
        username: '',
        bio: '',
        roles: [],
        location: '',
        website: '',
        portfolioDescription: '',
        achievements: [],
        socialLinks: {}
    });

    // UI state
    const [isLoading, setIsLoading] = React.useState(true);
    const [editingField, setEditingField] = React.useState<string | null>(null);
    const [showShareMenu, setShowShareMenu] = React.useState(false);
    const [usernameError, setUsernameError] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("overview");

    // Temporary editing values
    const [tempValues, setTempValues] = React.useState<Partial<UserProfile>>({});

    // Filter user's work
    const userScreenplays = screenplays.filter((s: { authorId?: string }) => s.authorId === profileUid);
    const userMovies = movies.filter((m: { creatorId?: string }) => m.creatorId === profileUid);
    const userEvents = events.filter((e: { creatorId?: string }) => e.creatorId === profileUid);

    // Statistics
    const stats = {
        totalWorks: userScreenplays.length + userMovies.length + userEvents.length,
        totalViews: userScreenplays.reduce((sum, s) => sum + (s.viewCount || 0), 0) +
            userMovies.reduce((sum, m) => sum + (m.totalRatings || 0), 0),
        avgRating: userMovies.length > 0 ?
            userMovies.reduce((sum, m) => sum + (m.averageRating || 0), 0) / userMovies.length : 0
    };

    // Load profile data from Firestore

    React.useEffect(() => {
        const loadProfile = async () => {
            if (!profileUid) return;
            setIsLoading(true);
            try {
                const userDoc = await getDoc(doc(db, `artifacts/cinemaplot/public/data/users`, profileUid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile(prev => ({
                        ...prev,
                        displayName: data.displayName || user?.displayName || '',
                        email: data.email || user?.email || '',
                        username: data.username || '',
                        bio: data.bio || '',
                        roles: data.roles || [],
                        location: data.location || '',
                        website: data.website || '',
                        portfolioDescription: data.portfolioDescription || '',
                        achievements: data.achievements || [],
                        socialLinks: data.socialLinks || {},
                        joinedAt: data.joinedAt || data.createdAt || ''
                    }));
                } else if (isOwnProfile) {
                    // Initialize profile for new users
                    const initialProfile = {
                        displayName: user?.displayName || '',
                        email: user?.email || '',
                        joinedAt: new Date().toISOString()
                    };
                    await setDoc(doc(db, `artifacts/cinemaplot/public/data/users`, profileUid), initialProfile, { merge: true });
                    setProfile(prev => ({ ...prev, ...initialProfile }));
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [profileUid, user, isOwnProfile]);

    // Save profile changes
    const saveProfile = async (updates: Partial<UserProfile>) => {
        if (!profileUid || !isOwnProfile) return;

        try {
            await setDoc(doc(db, `artifacts/cinemaplot/public/data/users`, profileUid), {
                ...updates,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setProfile(prev => ({ ...prev, ...updates }));
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
        }
    };

    // Username validation and save
    const validateUsername = async (username: string) => {
        if (!username) return "";
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return "Username can only contain letters, numbers, hyphens, and underscores.";
        }
        if (username.length < 3 || username.length > 30) {
            return "Username must be between 3 and 30 characters.";
        }

        const q = doc(db, `artifacts/cinemaplot/public/data/usernames`, username.toLowerCase());
        const snap = await getDoc(q);
        if (snap.exists() && snap.data().uid !== profileUid) {
            return "Username is already taken.";
        }
        return "";
    };

    const handleEditField = (field: string) => {
        setEditingField(field);
        setTempValues({ [field]: profile[field as keyof UserProfile] });
    };

    const handleSaveField = async (field: string) => {
        const value = tempValues[field as keyof UserProfile];

        if (field === 'username') {
            const error = await validateUsername(value as string);
            if (error) {
                setUsernameError(error);
                return;
            }

            // Save to username registry
            if (value) {
                await setDoc(doc(db, `artifacts/cinemaplot/public/data/usernames`, (value as string).toLowerCase()), {
                    uid: profileUid,
                });
            }
        }

        const success = await saveProfile({ [field]: value });
        if (success) {
            setEditingField(null);
            setTempValues({});
            setUsernameError("");

            // Refresh user profile in auth context if username was updated
            if (field === 'username') {
                await refreshUserProfile();
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setTempValues({});
        setUsernameError("");
    };

    const handleAddRole = (role: string) => {
        const newRoles = profile.roles?.includes(role)
            ? profile.roles.filter(r => r !== role)
            : [...(profile.roles || []), role];
        setProfile(prev => ({ ...prev, roles: newRoles }));
        saveProfile({ roles: newRoles });
    };

    // Share functionality
    const profileUrl = profile.username
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/${profile.username}`
        : typeof window !== "undefined" ? window.location.href : "";

    // Redirect to username URL if user has username and is on UID route
    React.useEffect(() => {
        if (profile.username && typeof window !== "undefined" && window.location.pathname.includes('/profile/')) {
            // Only redirect if we're on the UID route and user has a username
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/profile/') && !currentPath.includes(profile.username)) {
                window.history.replaceState({}, '', `/${profile.username}`);
            }
        }
    }, [profile.username]);

    const handleCopy = () => {
        if (profileUrl) {
            navigator.clipboard.writeText(profileUrl);
            alert("Profile URL copied to clipboard!");
            setShowShareMenu(false);
        }
    };

    const handleDeviceShare = async () => {
        if (navigator.share && profileUrl) {
            try {
                await navigator.share({
                    title: `${profile.displayName}'s CinemaPlot Portfolio`,
                    url: profileUrl,
                });
                setShowShareMenu(false);
            } catch { }
        } else {
            handleCopy();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">CinemaPlot Portfolio</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                        <div className="relative">
                            <Button
                                variant="ghost"
                                onClick={() => setShowShareMenu(v => !v)}
                                title="Share Profile"
                            >
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                            {showShareMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-50">
                                    <div className="py-2">
                                        <Button variant="ghost" className="w-full justify-start" asChild>
                                            <a href={`https://wa.me/?text=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer">
                                                Share on WhatsApp
                                            </a>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start" asChild>
                                            <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer">
                                                Share on X
                                            </a>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start" asChild>
                                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer">
                                                Share on LinkedIn
                                            </a>
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start" onClick={handleCopy}>
                                            Copy Link
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start" onClick={handleDeviceShare}>
                                            Device Share
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Profile Info */}
                        <div className="lg:w-1/3">
                            <Card className="p-6">
                                {/* Avatar */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4 border-4 border-primary/10">
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground bg-gradient-to-br from-primary/10 to-secondary/10">
                                            👤
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        {/* Display Name */}
                                        <h1 className="text-2xl font-bold mb-2">
                                            {profile.displayName || "User"}
                                        </h1>

                                        {/* Username */}
                                        <div className="mb-4">
                                            {editingField === 'username' ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        type="text"
                                                        value={tempValues.username || ''}
                                                        onChange={e => setTempValues(prev => ({ ...prev, username: e.target.value }))}
                                                        placeholder="Choose a username"
                                                        className="text-center"
                                                    />
                                                    {usernameError && (
                                                        <p className="text-red-500 text-sm">{usernameError}</p>
                                                    )}
                                                    <div className="flex gap-2 justify-center">
                                                        <Button size="sm" onClick={() => handleSaveField('username')}>
                                                            <Save className="w-3 h-3 mr-1" /> Save
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                            <X className="w-3 h-3 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-muted-foreground">
                                                        @{profile.username || "no-username"}
                                                    </span>
                                                    {isOwnProfile && (
                                                        <Button size="sm" variant="ghost" onClick={() => handleEditField('username')}>
                                                            <Edit3 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            {profile.username && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <p>Profile URL: <span className="underline">{profileUrl}</span></p>
                                                    {typeof window !== "undefined" && window.location.pathname.includes('/profile/') && (
                                                        <p className="text-green-600 mt-1">
                                                            ✓ Your profile is also available at: /{profile.username}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {!profile.username && isOwnProfile && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <p>Set a username to get a custom URL like: yoursite.com/yourname</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
                                            <Mail className="w-4 h-4" />
                                            {profile.email}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                                            <div>
                                                <div className="text-2xl font-bold text-primary">{stats.totalWorks}</div>
                                                <div className="text-xs text-muted-foreground">Works</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
                                                <div className="text-xs text-muted-foreground">Views</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-primary">
                                                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "0.0"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Avg Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <User className="w-4 h-4" /> About
                                        </h3>
                                        {isOwnProfile && editingField !== 'bio' && (
                                            <Button size="sm" variant="ghost" onClick={() => handleEditField('bio')}>
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {editingField === 'bio' ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={tempValues.bio || ''}
                                                onChange={e => setTempValues(prev => ({ ...prev, bio: e.target.value }))}
                                                placeholder="Tell us about yourself..."
                                                rows={4}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleSaveField('bio')}>
                                                    <Save className="w-3 h-3 mr-1" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                    <X className="w-3 h-3 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {profile.bio || "No bio yet. Add something about yourself!"}
                                        </p>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Location
                                        </h3>
                                        {isOwnProfile && editingField !== 'location' && (
                                            <Button size="sm" variant="ghost" onClick={() => handleEditField('location')}>
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {editingField === 'location' ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={tempValues.location || ''}
                                                onChange={e => setTempValues(prev => ({ ...prev, location: e.target.value }))}
                                                placeholder="e.g., Los Angeles, CA"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleSaveField('location')}>
                                                    <Save className="w-3 h-3 mr-1" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                    <X className="w-3 h-3 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {profile.location || "Location not specified"}
                                        </p>
                                    )}
                                </div>

                                {/* Website */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" /> Website
                                        </h3>
                                        {isOwnProfile && editingField !== 'website' && (
                                            <Button size="sm" variant="ghost" onClick={() => handleEditField('website')}>
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {editingField === 'website' ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={tempValues.website || ''}
                                                onChange={e => setTempValues(prev => ({ ...prev, website: e.target.value }))}
                                                placeholder="https://yourwebsite.com"
                                                type="url"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleSaveField('website')}>
                                                    <Save className="w-3 h-3 mr-1" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                    <X className="w-3 h-3 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            {profile.website ? (
                                                <a
                                                    href={profile.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    {profile.website}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">No website added</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Film Roles */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" /> Film Roles
                                        </h3>
                                        {isOwnProfile && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingField(editingField === 'roles' ? null : 'roles')}
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {editingField === 'roles' ? (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                                {FILM_ROLES.map(role => (
                                                    <Button
                                                        key={role}
                                                        size="sm"
                                                        variant={profile.roles?.includes(role) ? "default" : "outline"}
                                                        onClick={() => handleAddRole(role)}
                                                        className="text-xs"
                                                    >
                                                        {role}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => setEditingField(null)}
                                                className="w-full"
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {profile.roles && profile.roles.length > 0 ? (
                                                profile.roles.map(role => (
                                                    <Badge key={role} variant="secondary" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No roles selected</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:w-2/3">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="screenplays">
                                        <Film className="w-4 h-4 mr-2" />
                                        Screenplays ({userScreenplays.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="movies">
                                        <Camera className="w-4 h-4 mr-2" />
                                        Movies ({userMovies.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="events">
                                        <Users className="w-4 h-4 mr-2" />
                                        Events ({userEvents.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6">
                                    <div className="space-y-6">
                                        {/* Portfolio Description */}
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">Portfolio Showcase</h3>
                                                {isOwnProfile && editingField !== 'portfolioDescription' && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleEditField('portfolioDescription')}>
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {editingField === 'portfolioDescription' ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={tempValues.portfolioDescription || ''}
                                                        onChange={e => setTempValues(prev => ({ ...prev, portfolioDescription: e.target.value }))}
                                                        placeholder="Describe your portfolio and highlight your best work..."
                                                        rows={4}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleSaveField('portfolioDescription')}>
                                                            <Save className="w-3 h-3 mr-1" /> Save
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                            <X className="w-3 h-3 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground whitespace-pre-line">
                                                    {profile.portfolioDescription || "No portfolio description yet. Add a compelling overview of your work!"}
                                                </p>
                                            )}
                                        </Card>

                                        {/* Recent Work */}
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold mb-4">Recent Work</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Latest Screenplay */}
                                                {userScreenplays.slice(0, 1).map(screenplay => (
                                                    <ScreenplayCard key={screenplay.id} screenplay={screenplay} />
                                                ))}

                                                {/* Latest Movie */}
                                                {userMovies.slice(0, 1).map(movie => (
                                                    <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                        <div className="relative">
                                                            <Image
                                                                src={movie.imageUrl || "/placeholder.svg"}
                                                                alt={movie.title}
                                                                width={300}
                                                                height={200}
                                                                className="w-full h-48 object-cover"
                                                            />
                                                            <Badge className="absolute top-2 left-2">
                                                                {movie.category || "Film"}
                                                            </Badge>
                                                        </div>
                                                        <CardHeader>
                                                            <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                                                            <CardDescription className="line-clamp-2">
                                                                {movie.logLine}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                                <div className="flex items-center">
                                                                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                                                    {movie.averageRating?.toFixed(1) || "N/A"}
                                                                </div>
                                                                <div>{movie.totalRatings || 0} reviews</div>
                                                            </div>
                                                            <Button className="w-full" asChild>
                                                                <Link href={`/movies/${movie.id}`}>Watch Now</Link>
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>

                                            {userScreenplays.length === 0 && userMovies.length === 0 && (
                                                <p className="text-center text-muted-foreground py-8">
                                                    No work to showcase yet.
                                                </p>
                                            )}
                                        </Card>

                                        {/* Achievements */}
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    <Award className="w-5 h-5" /> Achievements
                                                </h3>
                                                {isOwnProfile && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleEditField('achievements')}>
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {editingField === 'achievements' ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={(tempValues.achievements as string[])?.join('\n') || ''}
                                                        onChange={e => setTempValues(prev => ({
                                                            ...prev,
                                                            achievements: e.target.value.split('\n').filter(a => a.trim())
                                                        }))}
                                                        placeholder="Enter each achievement on a new line..."
                                                        rows={4}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleSaveField('achievements')}>
                                                            <Save className="w-3 h-3 mr-1" /> Save
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                            <X className="w-3 h-3 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {profile.achievements && profile.achievements.length > 0 ? (
                                                        profile.achievements.map((achievement, index) => (
                                                            <div key={index} className="flex items-start gap-2">
                                                                <Award className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                                <span className="text-sm">{achievement}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm">
                                                            No achievements listed yet.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="screenplays" className="mt-6">
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Screenplays</h3>
                                        {userScreenplays.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {userScreenplays.map(screenplay => (
                                                    <ScreenplayCard key={screenplay.id} screenplay={screenplay} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No screenplays yet.</p>
                                                {isOwnProfile && (
                                                    <Button className="mt-4" asChild>
                                                        <Link href="/screenplays/create">Start Your First Project</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="movies" className="mt-6">
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Movies</h3>
                                        {userMovies.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {userMovies.map(movie => (
                                                    <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                        <div className="relative">
                                                            <Image
                                                                src={movie.imageUrl || "/placeholder.svg"}
                                                                alt={movie.title}
                                                                width={300}
                                                                height={200}
                                                                className="w-full h-48 object-cover"
                                                            />
                                                            <Badge className="absolute top-2 left-2">
                                                                {movie.category || "Film"}
                                                            </Badge>
                                                        </div>
                                                        <CardHeader>
                                                            <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                                                            <CardDescription className="line-clamp-2">
                                                                {movie.logLine}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                                <div className="flex items-center">
                                                                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                                                    {movie.averageRating?.toFixed(1) || "N/A"}
                                                                </div>
                                                                <div>{movie.totalRatings || 0} reviews</div>
                                                            </div>
                                                            <Button className="w-full" asChild>
                                                                <Link href={`/movies/${movie.id}`}>Watch Now</Link>
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No movies yet.</p>
                                                {isOwnProfile && (
                                                    <Button className="mt-4" asChild>
                                                        <Link href="/movies/create">Add Your First Movie</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="events" className="mt-6">
                                    <Card className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Events</h3>
                                        {userEvents.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {userEvents.map(event => (
                                                    <EventCard key={event.id} event={event} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No events yet.</p>
                                                {isOwnProfile && (
                                                    <Button className="mt-4" asChild>
                                                        <Link href="/events/create">Create Your First Event</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 mt-8 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center text-muted-foreground">
                        <p>&copy; 2025 CinemaPlot. Portfolio for {profile.displayName || "User"}.</p>
                        {profile.joinedAt && (
                            <p className="text-sm mt-2 flex items-center justify-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Member since {new Date(profile.joinedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
