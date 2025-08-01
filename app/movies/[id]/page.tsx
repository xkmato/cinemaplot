"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Play, Share2, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use, useState } from "react"

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isFollowing, setIsFollowing] = useState(false)
  const [userRating, setUserRating] = useState<number>(0)
  const [showReviews, setShowReviews] = useState(false)

  // Mock movie data
  const movie = {
    id: id,
    title: "The Last Journey",
    description:
      "A heartwarming story about finding purpose in life's final chapter. When an elderly man embarks on a cross-country road trip to reconnect with his estranged daughter, he discovers that the journey itself holds more meaning than the destination. This touching short film explores themes of family, forgiveness, and the beauty of human connection.",
    category: "Short Film",
    rating: 4.8,
    totalRatings: 156,
    followers: 890,
    duration: "18 minutes",
    releaseYear: 2024,
    image: "/placeholder.svg?height=400&width=600",
    videoUrl: "https://youtube.com/watch?v=example",
    creator: {
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      bio: "Independent filmmaker passionate about human stories",
    },
    tags: ["Drama", "Family", "Independent", "Award Winner"],
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold hover:text-primary">
              ← Back to Home
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
                  <Image
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="lg" className="rounded-full w-16 h-16">
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                </div>
                <Badge className="absolute top-4 left-4 text-sm">{movie.category}</Badge>
              </div>

              {/* Title and Creator */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={movie.creator.avatar || "/placeholder.svg"} alt={movie.creator.name} />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{movie.creator.name}</span>
                      {movie.creator.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{movie.creator.bio}</span>
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(Math.floor(movie.rating))}</div>
                    <span className="font-medium">{movie.rating}</span>
                    <span className="text-sm text-muted-foreground">({movie.totalRatings} ratings)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{movie.followers} followers</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">About This Film</h2>
                <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
              </div>

              {/* Awards */}
              {movie.awards.length > 0 && (
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{movie.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Release Year</span>
                    <span className="font-medium">{movie.releaseYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{movie.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{movie.rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </Button>

                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? (
                      <>
                        <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                        Following
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Follow Movie
                      </>
                    )}
                  </Button>

                  <Button className="w-full bg-transparent" variant="outline">
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
                      <AvatarImage src={movie.creator.avatar || "/placeholder.svg"} alt={movie.creator.name} />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{movie.creator.name}</div>
                      <div className="text-sm text-muted-foreground">Filmmaker</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{movie.creator.bio}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Related Movies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">More Like This</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/placeholder.svg?height=60&width=60"
                      alt="Related movie"
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Digital Dreams</div>
                      <div className="text-xs text-muted-foreground">Web Episode • 4.6★</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/placeholder.svg?height=60&width=60"
                      alt="Related movie"
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">City Lights</div>
                      <div className="text-xs text-muted-foreground">Short Film • 4.4★</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
