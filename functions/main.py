# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
import requests
from datetime import datetime, timedelta, timezone
from dateutil.parser import isoparse
from firebase_admin import initialize_app, firestore, credentials
from firebase_functions import scheduler_fn, options
from firebase_functions.core import init

# It's recommended to set the region.
# See https://firebase.google.com/docs/functions/locations
options.set_global_options(region="us-central1")

# Declare global variables that will be populated by the init function.
db = None
MAILGUN_API_KEY = None
MAILGUN_DOMAIN = None
MAILGUN_FROM_EMAIL = None
APP_ID = None


@init
def initialize():
    """
    Initializes the Firebase app and loads environment variables.
    This function runs once per function instance, not during deployment.
    """
    global db, MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL, APP_ID

    # Initialize Firebase Admin SDK
    initialize_app()
    db = firestore.client()

    # Load configuration from environment variables
    MAILGUN_API_KEY = os.environ.get("MAILGUN_API_KEY")
    MAILGUN_DOMAIN = os.environ.get("MAILGUN_DOMAIN")
    MAILGUN_FROM_EMAIL = os.environ.get("MAILGUN_FROM_EMAIL")
    APP_ID = os.environ.get("APP_ID")


def send_reminder_email(user_email, event):
    """Sends an email using the Mailgun API."""
    if not all([MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL]):
        print("Error: Mailgun environment variables not set.")
        return None

    event_title = event.get("title", "Untitled Event")
    event_time_str = event.get("dateTime")
    event_time_local_str = "Unknown time"
    if event_time_str:
        event_dt_utc = isoparse(event_time_str)
        # Assuming a default timezone if not present, e.g., Kampala (EAT)
        event_tz = timezone(timedelta(hours=3))
        event_dt_local = event_dt_utc.astimezone(event_tz)
        event_time_local_str = event_dt_local.strftime("%I:%M %p on %A, %B %d")

    subject = f"Reminder: '{event_title}' is starting soon!"
    text_body = f"""
    Hi there,

    This is a reminder that the event '{event_title}' is scheduled to start soon.

    Event Time: {event_time_local_str}
    Location: {event.get('location', 'Not specified')}

    You can view the event details here: https://cinemaplot.com/event/{event['id']}

    Enjoy the event!
    The Cinema Plot Team
    """

    print(f"Sending email to {user_email} for event {event_title}")

    try:
        response = requests.post(
            f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
            auth=("api", MAILGUN_API_KEY),
            data={
                "from": MAILGUN_FROM_EMAIL,
                "to": [user_email],
                "subject": subject,
                "text": text_body,
            },
        )
        response.raise_for_status()
        print(
            f"Email sent successfully to {user_email}. Status: {response.status_code}"
        )
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error sending email to {user_email}: {e}")
        return None


# This function runs every 15 minutes.
@scheduler_fn.on_schedule(schedule="every 15 minutes")
def send_event_reminders(event: scheduler_fn.ScheduledEvent) -> None:
    """
    Checks for event notifications and sends email reminders to users.
    """
    if not APP_ID:
        print("Error: APP_ID environment variable is not set. Exiting function.")
        return

    now_utc = datetime.now(timezone.utc)
    print(f"Function triggered at: {now_utc.isoformat()}")

    # Use a collection group query to get all notification settings across all users.
    notifications_query = db.collection_group("eventNotifications").stream()

    for notif_doc in notifications_query:
        user_id = notif_doc.reference.parent.parent.id
        event_id = notif_doc.id
        notif_data = notif_doc.to_dict()

        # Fetch the user's details (we need their email)
        user_doc_ref = db.collection("users").document(user_id)
        user_doc = user_doc_ref.get()
        if not user_doc.exists or not user_doc.to_dict().get("email"):
            print(f"User {user_id} not found or has no email. Skipping.")
            continue
        user_email = user_doc.to_dict()["email"]

        # Fetch the event details
        event_doc_ref = db.collection(
            f"artifacts/{APP_ID}/public/data/events"
        ).document(event_id)
        event_doc = event_doc_ref.get()
        if (
            not event_doc.exists
            or event_doc.to_dict().get("deleted")
            or event_doc.to_dict().get("paused")
        ):
            print(f"Event {event_id} not found, deleted, or paused. Skipping.")
            continue

        event_data = event_doc.to_dict()
        event_data["id"] = event_id  # Add id to the dict for use in email

        event_time_str = event_data.get("dateTime")
        if not event_time_str:
            print(f"Event {event_id} has no 'dateTime' field. Skipping.")
            continue

        try:
            event_time_utc = isoparse(event_time_str)
        except ValueError:
            print(
                f"Could not parse dateTime '{event_time_str}' for event {event_id}. Skipping."
            )
            continue

        # Check each notification preference for the user/event pair
        for notification_pref in notif_data.get("notifications", []):
            value = notification_pref.get("value")
            unit = notification_pref.get("unit")

            if not isinstance(value, int) or not unit:
                continue

            if unit == "minutes":
                delta = timedelta(minutes=value)
            elif unit == "hours":
                delta = timedelta(hours=value)
            elif unit == "days":
                delta = timedelta(days=value)
            else:
                continue

            notification_time_utc = event_time_utc - delta

            # Check if the notification time is within the last 15 minutes
            time_diff = now_utc - notification_time_utc
            if timedelta(minutes=0) <= time_diff < timedelta(minutes=15):
                print(
                    f"MATCH: Event '{event_data.get('title')}' for user {user_email}."
                )
                send_reminder_email(user_email, event_data)
                # To prevent re-sending, you could add logic here to mark the
                # specific notification as sent in Firestore. For simplicity,
                # this example relies on the 15-minute window.
                break  # Move to the next user/event notification document

    print("Function execution finished.")
