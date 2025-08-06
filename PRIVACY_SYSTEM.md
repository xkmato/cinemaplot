# Screenplay Privacy System Documentation

## Overview

The screenplay privacy system allows authors to control who can access their screenplays through a comprehensive privacy and collaboration framework.

## Privacy Levels

### 1. Private

- **Access**: Only the author can view the screenplay
- **Default**: All screenplays start as private
- **Use Case**: Authors working on drafts or keeping content confidential

### 2. Collaborators Only

- **Access**: Only the author and invited collaborators
- **Collaboration**: Authors can invite people via email with specific permissions
- **Use Case**: Private collaboration with selected individuals

### 3. Public

- **Access**: Anyone can discover and read the screenplay
- **Discovery**: Appears in public listings and search results
- **Use Case**: Authors ready to share their work publicly

## Collaboration Features

### Email Invitations

- Authors can invite collaborators by email address
- Invitations include a personal message and permission settings
- Invited users receive a secure invitation link
- Invitations can be accepted or declined

### Permissions System

Collaborators can be granted specific permissions:

- **Read**: View the screenplay content
- **Comment**: Add comments and participate in discussions
- **Highlight**: Create text highlights (when implemented)
- **Download**: Download the screenplay file
- **Invite**: Invite other collaborators

### Invitation Management

- View pending invitations with email addresses
- See active collaborators and their permissions
- Remove collaborators from the screenplay
- Track invitation status (pending/accepted/declined)

## User Interface

### Privacy Manager

- Accessible via "Privacy" button for screenplay owners
- Visual privacy level selector
- Collaborator management interface
- Invitation form with email and message
- Permission configuration

### Privacy Indicators

- Visual badges showing privacy level (Public/Private/Collaborators Only)
- Icons indicating privacy status
- Access-controlled UI elements

### Invitation Acceptance

- Dedicated invitation acceptance page
- Email verification for invitations
- Permission display before acceptance
- Error handling for invalid/expired invitations

## Technical Implementation

### Database Structure

```typescript
interface Screenplay {
  visibility: "private" | "public" | "collaborators";
  collaborators: string[]; // User IDs
  collaboratorPermissions: { [userId: string]: ScreenplayPermissions };
  invitedCollaborators: ScreenplayInvitation[];
}

interface ScreenplayInvitation {
  id: string;
  screenplayId: string;
  invitedEmail: string;
  invitedBy: string;
  permissions: ScreenplayPermissions;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}
```

### Access Control

- Server-side validation in API routes
- Client-side filtering in auth context
- Permission-based UI rendering
- Secure invitation token system

### API Endpoints

- `POST /api/invitations/[token]` - Accept invitation
- `DELETE /api/invitations/[token]` - Decline invitation
- Context functions for privacy management

## Security Features

### Access Validation

- Author-only privacy management
- Email-based invitation verification
- Token-based invitation security
- Permission checks on all operations

### Data Protection

- Private screenplays not included in public listings
- Collaborator-only content restricted appropriately
- Invitation tokens expire after 30 days
- User email verification for invitations

## Usage Examples

### Setting a Screenplay to Public

```typescript
await updateScreenplayPrivacy(screenplayId, "public");
```

### Inviting a Collaborator

```typescript
await inviteCollaborator(
  screenplayId,
  "colleague@example.com",
  { canRead: true, canComment: true, canHighlight: true },
  "Would love your feedback on this script!"
);
```

### Checking Access

```typescript
const hasAccess = await hasScreenplayAccess(screenplayId, userId);
const permissions = await getScreenplayPermissions(screenplayId, userId);
```

## Future Enhancements

### Planned Features

- Email notifications for invitations
- Bulk permission updates
- Collaboration activity logs
- Time-limited access grants
- Team/organization management

### Integration Points

- Email service for invitation delivery
- Analytics for collaboration metrics
- Advanced permission granularity
- Integration with external auth providers

## Configuration

### Environment Variables

- Email service configuration (for notifications)
- Firebase security rules updates
- Invitation token expiration settings

### Firebase Security Rules

Security rules should be updated to enforce privacy settings at the database level for additional security.
