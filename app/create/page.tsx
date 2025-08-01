'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { Calendar, Film, Play, Star, Users } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const { user, needsNameToProceed, handleNameSubmit } = useAppContext();

  if (!user) {
    return <AuthScreen />;
  }

  if (needsNameToProceed) {
    return <GetUserNameModal onSubmit={handleNameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CinemaPlot</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/discover" className="text-sm font-medium hover:text-primary">
                Discover
              </Link>
              <Link href="/events" className="text-sm font-medium hover:text-primary">
                Events
              </Link>
              <Link href="/movies" className="text-sm font-medium hover:text-primary">
                Movies
              </Link>
              <Link href="/create" className="text-sm font-medium text-primary">
                Create
              </Link>
            </nav>
            <Button variant="ghost" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Create Amazing Content</h1>
          <p className="text-lg text-muted-foreground">
            Share your events and films with the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Event Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create an Event</CardTitle>
              <CardDescription>
                Organize screenings, workshops, conferences, and networking events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Build your audience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Schedule events</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Get discovered</span>
                </div>
              </div>
              <Button
                className="w-full"
                asChild
              >
                <Link href="/events/create">Create Event</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Create Film Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Share a Film</CardTitle>
              <CardDescription>
                Share your movies, short films, documentaries, and web episodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Film className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Showcase your work</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Connect with viewers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Get feedback</span>
                </div>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/movies/create">Share Film</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Tips for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Engaging Titles</h3>
              <p className="text-sm text-muted-foreground">
                Use clear, descriptive titles that capture attention and explain what your event or film is about.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Quality Images</h3>
              <p className="text-sm text-muted-foreground">
                Add high-quality images or posters to make your content more discoverable and appealing.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Detailed Descriptions</h3>
              <p className="text-sm text-muted-foreground">
                Provide comprehensive descriptions that help people understand what to expect.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">Share Widely</h3>
              <p className="text-sm text-muted-foreground">
                Promote your events and films on social media and other platforms to reach a wider audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
