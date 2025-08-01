"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/lib/auth-context"
import { MessageCircle, Play, Share2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use, useState } from "react"

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { movies } = useAppContext()
  const [userRating, setUserRating] = useState<number>(0)
  const [showReviews, setShowReviews] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Find the movie from the context
  const movie = movies.find(m => m.id === id)

  // Helper function to extract video ID and platform
  const getVideoEmbed = (url: string) => {
    if (!url) return null;

    try {
      // YouTube patterns
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const youtubeMatch = url.match(youtubeRegex);
      if (youtubeMatch) {
        return {
          platform: 'youtube',
          id: youtubeMatch[1],
          embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0&modestbranding=1`
        };
      }

      // Vimeo patterns
      const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
      const vimeoMatch = url.match(vimeoRegex);
      if (vimeoMatch) {
        return {
          platform: 'vimeo',
          id: vimeoMatch[1],
          embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&title=0&byline=0&portrait=0`
        };
      }
    } catch (error) {
      console.error('Error parsing video URL:', error);
    }

    return null;
  };

  const videoEmbed = movie ? getVideoEmbed(movie.videoUrl) : null;

  // Mock data for fields not yet available in the database
  const mockData = {
    rating: 4.8,
    totalRatings: 156,
    followers: 890,
    creator: {
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      bio: "Independent filmmaker passionate about human stories",
    },
    awards: ["Best Short Film - Indie Film Festival 2024", "Audience Choice Award"],
  }

  const reviews = [
    {
      id: 1,
      user: { name: "Alex Thompson", avatar: "/placeholder.svg?height=32&width=32" },
      rating: 5,
      content:
        "Absolutely beautiful storytelling. The cinematography is stunning and the emotional depth is incredible for such a short film.",
      timestamp: "3 days ago",
    },
    {
      id: 2,
      user: { name: "Maria Santos", avatar: "/placeholder.svg?height=32&width=32" },
      rating: 4,
      content:
        "Really touching story that stayed with me long after watching. Great performances from the entire cast.",
      timestamp: "1 week ago",
    },
  ]

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={interactive ? () => setUserRating(i + 1) : undefined}
      />
    ))
  }

  // Loading state
  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/movies" className="text-lg font-semibold hover:text-primary">
                ← Back to Movies
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading movie...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/movies" className="text-lg font-semibold hover:text-primary">
              ← Back to Movies
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player / Poster */}
              <div className="relative">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {videoEmbed && !videoError ? (
                    <iframe
                      src={videoEmbed.embedUrl}
                      title={movie.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onError={() => setVideoError(true)}
                    />
                  ) : movie.imageUrl ? (
                    <>
                      <Image
                        src={movie.imageUrl}
                        alt={movie.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="rounded-full w-16 h-16"
                          onClick={() => window.open(movie.videoUrl, '_blank')}
                        >
                          <Play className="w-6 h-6 ml-1" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16"
                        onClick={() => window.open(movie.videoUrl, '_blank')}
                      >
                        <Play className="w-6 h-6 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
                <Badge className="absolute top-4 left-4 text-sm">
                  {movie.category || "Film"}
                </Badge>
              </div>

              {/* Title and Creator */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={mockData.creator.avatar} alt={movie.creatorName} />
                    <AvatarFallback>{movie.creatorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{movie.creatorName}</span>
                      {mockData.creator.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{mockData.creator.bio}</span>
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(Math.floor(mockData.rating))}</div>
                    <span className="font-medium">{mockData.rating}</span>
                    <span className="text-sm text-muted-foreground">({mockData.totalRatings} ratings)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">About This Film</h2>
                {movie.logLine && (
                  <p className="text-lg font-medium text-foreground mb-3 italic">
                    &ldquo;{movie.logLine}&rdquo;
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed">{movie.synopsis}</p>
              </div>

              {/* Awards */}
              {movie.awards && movie.awards.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Awards & Recognition</h3>
                  <div className="space-y-2">
                    {movie.awards.map((award, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        🏆 {award}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {movie.tags && movie.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Reviews & Ratings</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowReviews(!showReviews)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {reviews.length} Reviews
                  </Button>
                </div>

                {/* Rate this movie */}
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Rate this movie:</label>
                        <div className="flex items-center space-x-1 mt-1">{renderStars(userRating, true)}</div>
                      </div>
                      <Textarea placeholder="Write your review..." />
                      <Button size="sm">Submit Review</Button>
                    </div>
                  </CardContent>
                </Card>

                {showReviews && (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                              <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{review.user.name}</span>
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-xs text-muted-foreground">{review.timestamp}</span>
                              </div>
                              <p className="text-sm">{review.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Movie Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Movie Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {movie.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{movie.duration}</span>
                    </div>
                  )}
                  {movie.releaseYear && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Year</span>
                      <span className="font-medium">{movie.releaseYear}</span>
                    </div>
                  )}
                  {movie.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{movie.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mockData.rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {videoEmbed && !videoError ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => window.open(movie.videoUrl, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch on {videoEmbed.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => window.open(movie.videoUrl, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch on {videoEmbed?.platform === 'youtube' ? 'YouTube' : videoEmbed?.platform === 'vimeo' ? 'Vimeo' : 'External Site'}
                    </Button>
                  )}

                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Movie
                  </Button>
                </CardContent>
              </Card>

              {/* Creator Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={mockData.creator.avatar} alt={movie.creatorName} />
                      <AvatarFallback>{movie.creatorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{movie.creatorName}</div>
                      <div className="text-sm text-muted-foreground">Filmmaker</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{mockData.creator.bio}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Related Movies */}
              {(() => {
                const recentMovies = movies
                  .filter(m => m.id !== movie.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 2);

                if (recentMovies.length === 0) return null;

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">More Like This</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentMovies.map((relatedMovie) => (
                        <Link key={relatedMovie.id} href={`/movies/${relatedMovie.id}`}>
                          <div className="flex items-center space-x-3 hover:bg-accent/50 rounded-lg p-2 transition-colors">
                            {relatedMovie.imageUrl ? (
                              <Image
                                src={relatedMovie.imageUrl}
                                alt={relatedMovie.title}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover w-15 h-15"
                              />
                            ) : (
                              <div className="w-15 h-15 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                                <Play className="w-6 h-6 text-primary/50" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm line-clamp-1">{relatedMovie.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {relatedMovie.category || 'Film'} • ⭐ 4.6
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-b from-card to-card/95 animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Share Movie</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(false)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg">
                {movie.imageUrl ? (
                  <Image
                    src={movie.imageUrl}
                    alt={movie.title}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-15 h-15 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary/50" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-1">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">by {movie.creatorName}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground flex-1 truncate mr-2">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                  >
                    Copy Link
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                      const text = encodeURIComponent(`Check out "${movie.title}" by ${movie.creatorName}`);
                      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                    }}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                      const title = encodeURIComponent(`${movie.title} by ${movie.creatorName}`);
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
                    }}
                  >
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: movie.title,
                          text: `Check out "${movie.title}" by ${movie.creatorName}`,
                          url: typeof window !== 'undefined' ? window.location.href : '',
                        });
                      }
                    }}
                  >
                    More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
