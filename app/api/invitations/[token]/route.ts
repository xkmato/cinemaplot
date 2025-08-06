import { db } from '@/lib/firebase';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        
        // Get the invitation document
        const invitationRef = doc(db, 'screenplayInvitations', token);
        const invitationDoc = await getDoc(invitationRef);
        
        if (!invitationDoc.exists()) {
            return NextResponse.json(
                { error: 'Invalid or expired invitation' },
                { status: 404 }
            );
        }
        
        const invitation = invitationDoc.data();
        
        // Check if invitation is still valid
        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { error: 'Invitation has already been responded to' },
                { status: 400 }
            );
        }
        
        // Check if invitation has expired (optional - if you want to add expiration)
        const now = new Date();
        const invitationDate = new Date(invitation.createdAt);
        const daysSinceInvitation = (now.getTime() - invitationDate.getTime()) / (1000 * 3600 * 24);
        
        if (daysSinceInvitation > 30) { // 30 days expiration
            return NextResponse.json(
                { error: 'Invitation has expired' },
                { status: 400 }
            );
        }
        
        // Get user information from session/cookies (you'll need to implement this based on your auth)
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('user'); // Adjust based on your auth implementation
        
        if (!userCookie) {
            return NextResponse.json(
                { error: 'User must be logged in to accept invitation' },
                { status: 401 }
            );
        }
        
        const user = JSON.parse(userCookie.value);
        
        // Check if the invited email matches the logged-in user's email
        if (user.email !== invitation.invitedEmail) {
            return NextResponse.json(
                { error: 'This invitation is for a different email address' },
                { status: 403 }
            );
        }
        
        // Update the screenplay to add the user as a collaborator
        const screenplayRef = doc(db, `artifacts/film-calendar-ad4b6/public/data/screenplays`, invitation.screenplayId);
        
        await updateDoc(screenplayRef, {
            collaborators: arrayUnion(user.uid),
            [`collaboratorPermissions.${user.uid}`]: invitation.permissions,
            updatedAt: new Date().toISOString()
        });
        
        // Update the invitation status
        await updateDoc(invitationRef, {
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            acceptedBy: user.uid
        });
        
        return NextResponse.json({
            success: true,
            message: 'Invitation accepted successfully',
            screenplayId: invitation.screenplayId
        });
        
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return NextResponse.json(
            { error: 'Failed to accept invitation' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        
        // Get the invitation document
        const invitationRef = doc(db, 'screenplayInvitations', token);
        const invitationDoc = await getDoc(invitationRef);
        
        if (!invitationDoc.exists()) {
            return NextResponse.json(
                { error: 'Invalid invitation' },
                { status: 404 }
            );
        }
        
        // Update invitation status to declined
        await updateDoc(invitationRef, {
            status: 'declined',
            declinedAt: new Date().toISOString()
        });
        
        return NextResponse.json({
            success: true,
            message: 'Invitation declined'
        });
        
    } catch (error) {
        console.error('Error declining invitation:', error);
        return NextResponse.json(
            { error: 'Failed to decline invitation' },
            { status: 500 }
        );
    }
}
