import InvitationClient from '@/components/invitation-client';
import { db } from '@/lib/firebase';
import { ScreenplayInvitation } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface InvitationPageProps {
    params: Promise<{ token: string }>;
}

async function getInvitation(token: string): Promise<ScreenplayInvitation | null> {
    try {
        const invitationRef = doc(db, 'screenplayInvitations', token);
        const invitationDoc = await getDoc(invitationRef);

        if (!invitationDoc.exists()) {
            return null;
        }

        return {
            id: invitationDoc.id,
            ...invitationDoc.data()
        } as ScreenplayInvitation;
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return null;
    }
}

export async function generateMetadata({ params }: InvitationPageProps): Promise<Metadata> {
    const { token } = await params;
    const invitation = await getInvitation(token);

    if (!invitation) {
        return {
            title: 'Invitation Not Found - CinemaPlot',
            description: 'The invitation you are looking for could not be found.',
        };
    }

    return {
        title: `Screenplay Collaboration Invitation - CinemaPlot`,
        description: `You've been invited to collaborate on a screenplay. Join CinemaPlot to accept this invitation.`,
    };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
    const { token } = await params;
    const invitation = await getInvitation(token);

    if (!invitation) {
        notFound();
    }

    return <InvitationClient invitation={invitation} token={token} />;
}
