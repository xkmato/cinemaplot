# Feature 1: Cinemaplot Bookmark Widget

## Overview
The Cinemaplot Bookmark Widget is a versatile tool that allows users to embed a bookmark button on external websites and mobile applications. This widget enables Cinemaplot users to quickly bookmark films they want to see later directly from third-party platforms, enhancing user engagement and cross-platform integration.

## Implementation Recommendations
To ensure a smooth development process and maximize early adoption, it is recommended to start with the JavaScript implementation for web platforms before expanding to Android and iOS. This approach allows for:
- Faster iteration and testing on the most accessible platform
- Immediate feedback from web developers
- Reuse of core logic across platforms
- Easier debugging and feature validation

## Key Features
- **Cross-Platform Support**: Available for web, Android, and iOS platforms
- **Seamless Integration**: Easy-to-implement SDKs for developers
- **User Authentication**: Integrates with existing Cinemaplot user accounts
- **Customizable UI**: Flexible styling options to match host application design
- **Real-time Sync**: Bookmarks sync instantly across all user devices
- **Analytics**: Optional tracking for widget usage and engagement
- **Smart Reminders**: Automated reminders via email or WhatsApp to revisit bookmarks

## Implementation Details

### Web Integration (JavaScript SDK)

#### Installation
```javascript
// Include the SDK script in your HTML
<script src="https://cdn.cinemaplot.com/bookmark-widget/v1.0.0/cinemaplot-bookmark.js"></script>
```

#### Basic Usage
```javascript
// Initialize the widget
const bookmarkWidget = new CinemaplotBookmark({
  apiKey: 'your-api-key',
  movieId: 'movie-imdb-id-or-cinemaplot-id',
  container: '#bookmark-container'
});

// Render the bookmark button
bookmarkWidget.render();
```

#### Configuration Options
- `apiKey`: Your Cinemaplot API key
- `movieId`: Unique identifier for the movie
- `container`: CSS selector for the container element
- `theme`: 'light' or 'dark' (default: 'light')
- `size`: 'small', 'medium', or 'large' (default: 'medium')
- `callback`: Function called after bookmark action

#### API Endpoints
- `POST /api/v1/bookmarks`: Create a new bookmark
- `DELETE /api/v1/bookmarks/{id}`: Remove a bookmark
- `GET /api/v1/bookmarks/{userId}`: Retrieve user's bookmarks
- `POST /api/v1/bookmarks/{id}/reminders`: Schedule or update reminder settings
- `DELETE /api/v1/bookmarks/{id}/reminders`: Disable reminders for a specific bookmark
- `GET /api/v1/users/{userId}/reminder-preferences`: Retrieve user's reminder preferences
- `PUT /api/v1/users/{userId}/reminder-preferences`: Update reminder delivery method and frequency

### Android SDK

#### Gradle Dependency
```gradle
dependencies {
    implementation 'com.cinemaplot:bookmark-widget:1.0.0'
}
```

#### Basic Implementation
```kotlin
// In your Activity or Fragment
val bookmarkButton = CinemaplotBookmarkButton(this)
bookmarkButton.apiKey = "your-api-key"
bookmarkButton.movieId = "movie-id"
bookmarkButton.theme = CinemaplotTheme.LIGHT

// Add to your layout
yourLayout.addView(bookmarkButton)
```

#### Key Classes
- `CinemaplotBookmarkButton`: Main widget class
- `CinemaplotBookmarkManager`: Handles bookmark operations
- `CinemaplotAuthManager`: Manages user authentication

#### Permissions Required
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS SDK

#### CocoaPods Installation
```ruby
pod 'CinemaplotBookmarkWidget', '~> 1.0.0'
```

#### Swift Implementation
```swift
import CinemaplotBookmarkWidget

// In your ViewController
let bookmarkButton = CinemaplotBookmarkButton()
bookmarkButton.apiKey = "your-api-key"
bookmarkButton.movieId = "movie-id"
bookmarkButton.theme = .light

// Add to your view
view.addSubview(bookmarkButton)
```

#### Key Classes
- `CinemaplotBookmarkButton`: Main widget view
- `CinemaplotBookmarkService`: Handles API interactions
- `CinemaplotAuthService`: Manages authentication flow

#### Info.plist Requirements
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Bookmark Reminders

### Overview
When a user bookmarks a movie using the Cinemaplot Bookmark Widget, the system automatically schedules smart reminders to help users revisit their saved films. Reminders start 24 hours after the initial bookmark and continue at increasing intervals to prevent forgetting while avoiding spam.

### Reminder Schedule
- **First Reminder**: 24 hours after bookmarking
- **Subsequent Reminders**: Every 3 days, then weekly, then bi-weekly
- **Maximum Duration**: Reminders continue for up to 3 months or until the bookmark is cleared

### Delivery Methods
- **Email**: HTML-formatted emails with movie poster, title, and direct links
- **WhatsApp**: Rich messages with quick action buttons (requires user opt-in)

### User Actions
Upon receiving a reminder, users are directed to the Cinemaplot Bookmarks page where they can:
- **Clear Bookmark**: Remove the movie from their bookmarks permanently
- **Postpone**: Choose a custom time to receive the next reminder (e.g., 1 week, 1 month, custom date)
- **Watch Now**: Navigate directly to streaming options or movie details
- **Rate/Review**: Provide feedback on the reminder system

### API Endpoints for Reminders
- `POST /api/v1/bookmarks/{id}/reminders`: Schedule or update reminder settings
- `DELETE /api/v1/bookmarks/{id}/reminders`: Disable reminders for a specific bookmark
- `GET /api/v1/users/{userId}/reminder-preferences`: Retrieve user's reminder preferences
- `PUT /api/v1/users/{userId}/reminder-preferences`: Update reminder delivery method and frequency

### Configuration Options
Users can customize reminder preferences in their Cinemaplot account settings:
- Preferred delivery method (email, WhatsApp, or both)
- Reminder frequency adjustments
- Time of day for email delivery
- Opt-out options for specific bookmarks or all reminders

### Integration with SDKs
```javascript
// Enable reminders during widget initialization
const bookmarkWidget = new CinemaplotBookmark({
  apiKey: 'your-api-key',
  movieId: 'movie-id',
  enableReminders: true,
  reminderMethod: 'email' // or 'whatsapp' or 'both'
});
```

## Security Considerations
- All API communications use HTTPS
- API keys are required for authentication
- User data is encrypted in transit and at rest
- Rate limiting implemented to prevent abuse

## Analytics and Tracking
- Optional Google Analytics integration
- Custom event tracking for bookmark actions
- Usage statistics available in Cinemaplot dashboard

## Development Roadmap
1. **Phase 1**: Core widget functionality (Completed)
2. **Phase 2**: Advanced customization options
3. **Phase 3**: Social sharing integration
4. **Phase 4**: Offline bookmark support
5. **Phase 5**: Smart reminder system with email and WhatsApp integration

## Support and Documentation
- Full API documentation: https://docs.cinemaplot.com/bookmark-widget
- Developer forum: https://community.cinemaplot.com
- Support email: developers@cinemaplot.com

## Changelog
- **v1.0.0**: Initial release with web, Android, and iOS support, including smart reminder system
