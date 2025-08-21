import { User } from '@/lib/types'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock data generators
export const mockUser: User = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
}

export const mockEvent = {
    id: 'test-event-id',
    title: 'Test Event',
    description: 'A test event description',
    date: '2024-12-31',
    time: '14:00',
    location: 'Test Location',
    creatorId: 'test-user-id',
    creatorName: 'Test Creator',
    createdAt: '2024-01-01T00:00:00.000Z',
}

export const mockScreenplay = {
    id: 'test-screenplay-id',
    title: 'Test Screenplay',
    description: 'A test screenplay description',
    author: 'Test Author',
    authorId: 'test-user-id',
    logLine: 'A compelling test story',
    synopsis: 'This is a test screenplay about testing',
    genre: 'Drama',
    fileUrl: 'https://example.com/test-screenplay.pdf',
    fileSize: 1024000,
    pageCount: 120,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isProcessed: true,
    processingStatus: 'completed' as const,
    isPublic: false,
    visibility: 'private' as const,
    content: [
        {
            pageNumber: 1,
            content: [
                {
                    id: 'element-1',
                    type: 'scene_heading' as const,
                    text: 'INT. COFFEE SHOP - DAY',
                    lineNumber: 1,
                    startIndex: 0,
                    endIndex: 22,
                },
                {
                    id: 'element-2',
                    type: 'action' as const,
                    text: 'A busy coffee shop filled with the morning rush.',
                    lineNumber: 2,
                    startIndex: 23,
                    endIndex: 71,
                },
                {
                    id: 'element-3',
                    type: 'character' as const,
                    text: 'SARAH',
                    lineNumber: 3,
                    startIndex: 72,
                    endIndex: 77,
                },
                {
                    id: 'element-4',
                    type: 'dialogue' as const,
                    text: 'I need my coffee fix before the meeting.',
                    lineNumber: 4,
                    startIndex: 78,
                    endIndex: 118,
                },
            ],
        },
    ],
}

export const mockMovie = {
    id: 'test-movie-id',
    title: 'Test Movie',
    logLine: 'A thrilling test adventure',
    synopsis: 'This is a test movie synopsis',
    videoUrl: 'https://www.youtube.com/watch?v=test',
    creatorId: 'test-user-id',
    creatorName: 'Test Creator',
    createdAt: '2024-01-01T00:00:00.000Z',
    category: 'Short Film',
    duration: '15 minutes',
    releaseYear: 2024,
}

export const mockAuditionRole = {
    id: 'test-role-id',
    roleName: 'SARAH',
    description: 'Lead female character, early 30s',
    pageRanges: [
        { startPage: 1, endPage: 5, description: 'Opening scene' },
        { startPage: 15, endPage: 18, description: 'Emotional confrontation' },
    ],
    requirements: 'Female, 28-35, strong dramatic range',
    numberOfSlots: 1,
    status: 'open' as const,
}

export const mockAuditionTape = {
    id: 'test-tape-id',
    auditionEventId: 'test-audition-event-id',
    screenplayId: 'test-screenplay-id',
    roleId: 'test-role-id',
    submitterId: 'test-submitter-id',
    submitterName: 'Jane Actor',
    submitterEmail: 'jane@example.com',
    tapeUrl: 'https://www.youtube.com/watch?v=audition-tape',
    notes: 'Excited to audition for this role!',
    submittedAt: '2024-01-15T10:00:00.000Z',
    status: 'submitted' as const,
}

// Mock context provider
export const MockAppProvider = ({ children }: { children: React.ReactNode }) => {
    // Mock the auth context provider
    return (
        <div data-testid="mock-app-provider">
            {children}
        </div>
    )
}

// Custom render function with providers
export const renderWithProviders = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => {
    return render(ui, {
        wrapper: MockAppProvider,
        ...options,
    })
}

// Re-export everything from testing library
export * from '@testing-library/react'
