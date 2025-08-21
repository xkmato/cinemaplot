import MovieCard from '@/components/movie-card'
import { render, screen } from '@testing-library/react'
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
        const unratedMovie = {
            ...testMovie,
            averageRating: undefined,
            totalRatings: undefined,
        }

        render(<MovieCard movie={unratedMovie} />)

        expect(screen.queryByText('4.5')).not.toBeInTheDocument()
    })

    it('handles missing optional fields gracefully', () => {
        const minimalMovie = {
            ...testMovie,
            logLine: undefined,
            averageRating: undefined,
            totalRatings: undefined,
            tags: undefined,
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
        const noTagsMovie = {
            ...testMovie,
            tags: undefined,
        }

        render(<MovieCard movie={noTagsMovie} />)

        // Should not have any badge elements when no tags
        expect(screen.queryByText('Drama')).not.toBeInTheDocument()
    })
})
