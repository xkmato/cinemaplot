import { render, screen } from '@testing-library/react'
import MovieCard from '@/components/movie-card'
import { mockMovie } from '../test-utils'

// Mock next/link and next/image
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  )
  MockImage.displayName = 'MockImage'
  return MockImage
})

describe('MovieCard', () => {
  const testMovie = {
    ...mockMovie,
    creatorName: 'Test Creator', // Add creatorName for the component
  }

  const defaultProps = {
    movie: testMovie,
  }

  it('renders movie information correctly', () => {
    render(<MovieCard {...defaultProps} />)
    
    expect(screen.getByText(testMovie.title)).toBeInTheDocument()
    expect(screen.getByText(testMovie.logLine)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(testMovie.creatorName))).toBeInTheDocument()
  })

  it('displays category and duration when available', () => {
    render(<MovieCard {...defaultProps} />)
    
    expect(screen.getByText(testMovie.category!)).toBeInTheDocument()
    expect(screen.getByText(testMovie.duration!)).toBeInTheDocument()
  })

  it('displays rating when available', () => {
    const ratedMovie = {
      ...testMovie,
      averageRating: 4.5,
      totalRatings: 12,
    }
    
    render(<MovieCard movie={ratedMovie} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(12)')).toBeInTheDocument()
  })

  it('does not show rating when not available', () => {
    render(<MovieCard {...defaultProps} />)
    
    // Original movie should not have rating, so shouldn't show rating section
    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalMovie = {
      id: 'minimal-id',
      title: 'Minimal Movie',
      logLine: 'A test movie',
      synopsis: 'This is a test movie synopsis',
      videoUrl: 'https://www.youtube.com/watch?v=test',
      creatorId: 'test-user-id',
      creatorName: 'Test Creator',
      createdAt: '2024-01-01T00:00:00.000Z',
      category: 'Short Film',
      duration: '10 minutes',
    }
    
    expect(() => {
      render(<MovieCard movie={minimalMovie} />)
    }).not.toThrow()
    
    expect(screen.getByText(minimalMovie.title)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(minimalMovie.creatorName))).toBeInTheDocument()
  })

  it('creates correct link to movie detail page', () => {
    render(<MovieCard {...defaultProps} />)
    
    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', `/movies/${testMovie.id}`)
  })

  it('displays tags when available', () => {
    const taggedMovie = {
      ...testMovie,
      tags: ['Drama', 'Independent', 'Award-Winner'],
    }
    
    render(<MovieCard movie={taggedMovie} />)
    
    // Only first 2 tags are shown according to the component
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Independent')).toBeInTheDocument()
    // Third tag should not be shown (only first 2)
    expect(screen.queryByText('Award-Winner')).not.toBeInTheDocument()
  })

  it('does not show tags section when no tags available', () => {
    render(<MovieCard {...defaultProps} />)
    
    // testMovie doesn't have tags, so shouldn't show tag badges
    expect(screen.queryByText('Drama')).not.toBeInTheDocument()
  })
})
