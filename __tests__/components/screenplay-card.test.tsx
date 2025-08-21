import ScreenplayCard from '@/components/screenplay-card'
import { render, screen } from '@testing-library/react'
import { mockScreenplay } from '../test-utils'

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
    const MockImage = ({ src, alt, ...props }: { src: string; alt: string;[key: string]: unknown }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...props} data-testid="next-image" />
    )
    MockImage.displayName = 'MockImage'
    return MockImage
})

describe('ScreenplayCard', () => {
    const testScreenplay = {
        ...mockScreenplay,
        creatorName: 'Test Creator', // Add creatorName for the component
    }

    const defaultProps = {
        screenplay: testScreenplay,
    }

    it('renders screenplay information correctly', () => {
        render(<ScreenplayCard {...defaultProps} />)

        expect(screen.getByText(testScreenplay.title)).toBeInTheDocument()
        expect(screen.getByText(testScreenplay.logLine!)).toBeInTheDocument()
        expect(screen.getByText(testScreenplay.creatorName)).toBeInTheDocument()
        expect(screen.getByText(testScreenplay.synopsis!)).toBeInTheDocument()
    })

    it('displays genre and page count when available', () => {
        render(<ScreenplayCard {...defaultProps} />)

        expect(screen.getByText(testScreenplay.genre!)).toBeInTheDocument()
        expect(screen.getByText('120 pages')).toBeInTheDocument()
    })

    it('shows processing status when page count is not available', () => {
        const processingScreenplay = {
            ...testScreenplay,
            pageCount: undefined,
        }

        render(<ScreenplayCard screenplay={processingScreenplay} />)

        expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('shows rating when available', () => {
        const ratedScreenplay = {
            ...testScreenplay,
            averageRating: 4.5,
        }

        render(<ScreenplayCard screenplay={ratedScreenplay} />)

        expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('shows N/A rating when no rating available', () => {
        const unratedScreenplay = {
            ...testScreenplay,
            averageRating: undefined,
        }

        render(<ScreenplayCard screenplay={unratedScreenplay} />)

        expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('shows comment count', () => {
        const commentedScreenplay = {
            ...testScreenplay,
            totalComments: 5,
        }

        render(<ScreenplayCard screenplay={commentedScreenplay} />)

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows zero comments when no comments', () => {
        const noCommentsScreenplay = {
            ...testScreenplay,
            totalComments: 0,
        }

        render(<ScreenplayCard screenplay={noCommentsScreenplay} />)

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows file size', () => {
        render(<ScreenplayCard {...defaultProps} />)

        expect(screen.getByText('1000 KB')).toBeInTheDocument()
    })

    it('handles missing optional fields gracefully', () => {
        const minimalScreenplay = {
            ...testScreenplay,
            logLine: undefined,
            genre: undefined,
            synopsis: undefined,
            averageRating: undefined,
            totalComments: undefined,
            pageCount: undefined,
        }

        expect(() => {
            render(<ScreenplayCard screenplay={minimalScreenplay} />)
        }).not.toThrow()

        expect(screen.getByText(minimalScreenplay.title)).toBeInTheDocument()
        expect(screen.getByText(minimalScreenplay.creatorName)).toBeInTheDocument()
        expect(screen.getByText('N/A')).toBeInTheDocument() // Rating
        expect(screen.getByText('0')).toBeInTheDocument() // Comments
        expect(screen.getByText('Processing...')).toBeInTheDocument() // Pages
    })

    it('creates correct link to screenplay detail page', () => {
        render(<ScreenplayCard {...defaultProps} />)

        const link = screen.getByTestId('next-link')
        expect(link).toHaveAttribute('href', `/screenplays/${testScreenplay.id}`)
    })
})
