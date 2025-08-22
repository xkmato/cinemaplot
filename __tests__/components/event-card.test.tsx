import EventCard from '@/components/event-card'
import { render, screen } from '@testing-library/react'
import { mockEvent } from '../test-utils'

// Mock next/link
jest.mock('next/link', () => {
    const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href} data-testid="next-link">
            {children}
        </a>
    )
    MockLink.displayName = 'MockLink'
    return MockLink
})

// Mock next/image
jest.mock('next/image', () => {
    const MockImage = ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...props} data-testid="next-image" />
    )
    MockImage.displayName = 'MockImage'
    return MockImage
})

describe('EventCard', () => {
    const defaultProps = {
        event: mockEvent,
    }

    it('renders event information correctly', () => {
        render(<EventCard {...defaultProps} />)

        expect(screen.getByText(mockEvent.title)).toBeInTheDocument()
        expect(screen.getByText(mockEvent.description!)).toBeInTheDocument()
        expect(screen.getByText(mockEvent.location)).toBeInTheDocument()
        expect(screen.getByText(/created by/i)).toBeInTheDocument()
        // Check that the creator name appears alongside the "Created by" text
        expect(screen.getByText(new RegExp(mockEvent.creatorName))).toBeInTheDocument()
    })

    it('renders event date correctly', () => {
        render(<EventCard {...defaultProps} />)

        // The date is rendered as MM/DD/YYYY format
        expect(screen.getByText('12/31/2024')).toBeInTheDocument()
    })

    it('handles missing optional fields gracefully', () => {
        const minimalEvent = {
            id: 'minimal-id',
            title: 'Minimal Event',
            date: '2024-12-31',
            location: 'Test Location',
            creatorId: 'test-user-id',
            creatorName: 'Test Creator',
            createdAt: '2024-01-01T00:00:00.000Z',
        }

        expect(() => {
            render(<EventCard event={minimalEvent} />)
        }).not.toThrow()

        expect(screen.getByText('Minimal Event')).toBeInTheDocument()
    })

    it('renders audition type event correctly', () => {
        const auditionEvent = { ...mockEvent, type: 'audition' as const }
        render(<EventCard event={auditionEvent} />)

        // The component doesn't show specific audition badge, but renders normally
        expect(screen.getByText(auditionEvent.title)).toBeInTheDocument()
        expect(screen.getByText(auditionEvent.location)).toBeInTheDocument()
    })

    it('renders movie premiere event correctly', () => {
        const premiereEvent = {
            ...mockEvent,
            isMoviePremiere: true,
            trailerUrl: 'https://www.youtube.com/watch?v=test'
        }
        render(<EventCard event={premiereEvent} />)

        // Should show premiere indicator
        expect(screen.getByText(/premiere/i)).toBeInTheDocument()
    })

    it('shows view button by default', () => {
        render(<EventCard {...defaultProps} />)

        const viewButton = screen.getByText(/view event/i)
        expect(viewButton).toBeInTheDocument()
    })

    it('hides view button when showViewButton is false', () => {
        render(<EventCard {...defaultProps} showViewButton={false} />)

        const viewButton = screen.queryByText(/view event/i)
        expect(viewButton).not.toBeInTheDocument()
    })

    it('creates correct link to event detail page', () => {
        render(<EventCard {...defaultProps} />)

        const link = screen.getByTestId('next-link')
        expect(link).toHaveAttribute('href', `/events/${mockEvent.id}`)
    })
})
