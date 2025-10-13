"use client"
import type { BacklogItem } from "@/lib/types"
import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

interface BacklogDetailModalProps {
  item: BacklogItem | null
  isOpen: boolean
  onClose: () => void
  onVote: (item: BacklogItem) => void
}

const AI_FEATURE_DETAILS: Record<string, React.ReactNode> = {
  "Export to Calendar (iCal/Google)": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Seamlessly sync your trips with your personal calendar apps (Google Calendar, Apple Calendar, Outlook) so you
          never miss a trip and can see your friend activities alongside your work and personal commitments.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Why This Feature?</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Friends already use calendar apps for their daily schedules</li>
          <li>Reduces need to check multiple apps for upcoming plans</li>
          <li>Automatic reminders from calendar apps</li>
          <li>Easy to share trip dates with people outside the friend group</li>
          <li>Professional integration with existing workflows</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold">One-Click Export</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click "Add to Calendar" button on any trip</li>
              <li>Choose export format (iCal file or Google Calendar link)</li>
              <li>Trip automatically appears in your calendar with all details</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold">Auto-Sync (Advanced)</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscribe to your personal trip calendar feed</li>
              <li>Trips automatically update when details change</li>
              <li>New trips appear automatically</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Never miss a trip with calendar reminders</li>
          <li>See trips in context of work schedule</li>
          <li>Identify scheduling conflicts early</li>
          <li>Share trip dates with family/colleagues</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~18 hours (2-3 days)</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>iCal file generation: 4 hours</li>
          <li>Google Calendar integration: 3 hours</li>
          <li>Calendar feed endpoint: 5 hours</li>
          <li>UI and testing: 6 hours</li>
        </ul>
      </section>
    </div>
  ),

  "Email/Push Notifications": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Keep friends informed about trip updates, reminders, and activity changes through email and push
          notifications, reducing the need to constantly check the app.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Notification Types</h3>
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold">Trip Updates</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>New trip created → notify all friends</li>
              <li>Trip details changed → notify participants</li>
              <li>Someone joined/left → notify participants</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Reminders</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>1 week before: "Trip coming up soon!"</li>
              <li>3 days before: "Pack your bags!"</li>
              <li>1 day before: "Trip starts tomorrow!"</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Channels</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Email</strong>: Detailed HTML emails with calendar attachments
          </li>
          <li>
            <strong>Push (PWA)</strong>: Instant alerts on phone/desktop
          </li>
          <li>
            <strong>Preferences</strong>: Choose which notifications to receive
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Never miss trip updates</li>
          <li>Timely reminders to prepare</li>
          <li>Stay informed without opening app</li>
          <li>Professional communication</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~35 hours (4-5 days)</p>
      </section>
    </div>
  ),

  "Shared Expense Tracker": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Track and split costs for group trips with automatic calculations, making it easy to manage shared expenses
          and settle up after trips.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Add expenses during trip (accommodation, food, transport)</li>
          <li>Assign who paid and who should split the cost</li>
          <li>System calculates who owes whom</li>
          <li>Settle up with simplified transactions</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Split equally or by custom amounts</li>
          <li>Multiple currencies with auto-conversion</li>
          <li>Receipt photo uploads</li>
          <li>Expense categories and tags</li>
          <li>Settlement suggestions (minimize transactions)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>No more awkward money conversations</li>
          <li>Transparent expense tracking</li>
          <li>Fair cost splitting</li>
          <li>Easy settlement after trips</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~40 hours (5 days)</p>
      </section>
    </div>
  ),

  "Weather Integration": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Show weather forecasts for trip destinations and dates, helping friends pack appropriately and plan activities
          around weather conditions.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>7-day weather forecast for trip destination</li>
          <li>Temperature, precipitation, wind speed</li>
          <li>Weather alerts (storms, extreme heat)</li>
          <li>Packing suggestions based on weather</li>
          <li>Best time to visit recommendations</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Implementation</h3>
        <p>
          Use OpenWeatherMap or WeatherAPI to fetch forecasts. Display weather cards on trip detail pages with icons and
          daily breakdown.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pack appropriate clothing</li>
          <li>Plan indoor/outdoor activities</li>
          <li>Avoid bad weather surprises</li>
          <li>Reschedule if needed</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~12 hours (1-2 days)</p>
      </section>
    </div>
  ),

  "Photo Gallery": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Upload and share photos from past trips with friends, creating a shared memory bank and making it easy to
          relive adventures together.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload photos from phone or computer</li>
          <li>Organize photos by trip and date</li>
          <li>Tag friends in photos</li>
          <li>Create albums and collections</li>
          <li>Download all trip photos as ZIP</li>
          <li>Lightbox viewer with slideshow</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use Vercel Blob for storage</li>
          <li>Automatic image compression and thumbnails</li>
          <li>Lazy loading for performance</li>
          <li>EXIF data extraction for dates/locations</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Preserve trip memories</li>
          <li>Share photos easily with group</li>
          <li>Relive adventures together</li>
          <li>Create trip highlight reels</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~36 hours (4-5 days)</p>
      </section>
    </div>
  ),

  "Recurring Activities": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Support for weekly/monthly recurring events and meetups, eliminating the need to manually create the same
          activity repeatedly.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Create activity and check "Make this recurring"</li>
          <li>Choose pattern (daily, weekly, monthly)</li>
          <li>Set end date or number of occurrences</li>
          <li>System generates all instances automatically</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Pattern Examples</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Every Friday (Friday Night Dinner)</li>
          <li>First Saturday of month (Monthly gathering)</li>
          <li>Every other week (Bi-weekly hikes)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Management</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Edit single instance or entire series</li>
          <li>Cancel specific occurrences</li>
          <li>Track attendance across series</li>
          <li>Visual indicators on calendar</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-700">In Progress - Partially Implemented</span>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~40 hours (5 days)</p>
      </section>
    </div>
  ),

  "Voting System for Dates": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Let friends vote on potential trip dates or destinations, making group decision-making democratic and
          transparent.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Propose multiple date options for a trip</li>
          <li>Friends vote on their preferences (Available/Maybe/Not Available)</li>
          <li>System shows availability heatmap</li>
          <li>Automatically select date with most votes</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visual heatmap of availability</li>
          <li>Conflict detection with existing activities</li>
          <li>Voting deadline</li>
          <li>Anonymous voting option</li>
          <li>Comments on date preferences</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Democratic date selection</li>
          <li>Find dates that work for most people</li>
          <li>Reduce endless group chat discussions</li>
          <li>Transparent decision-making</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~36 hours (4-5 days)</p>
      </section>
    </div>
  ),

  "Group Chat Integration": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Link WhatsApp or Telegram groups to trips, enabling quick access to group chats and automatic trip updates to
          chat.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Add WhatsApp/Telegram group link to trips</li>
          <li>One-click access to group chat from app</li>
          <li>Automatic trip updates sent to chat</li>
          <li>Message templates for updates</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Update Examples</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Trip created → Send announcement to group</li>
          <li>Details changed → Update notification</li>
          <li>Someone joined → Welcome message</li>
          <li>Reminder before trip → Automated message</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Centralized trip coordination</li>
          <li>Reduce app switching</li>
          <li>Reach everyone where they already chat</li>
          <li>Preserve chat context</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~32 hours (4 days)</p>
      </section>
    </div>
  ),

  "Privacy Controls": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Let friends control who can see their availability and activities, enabling separation of different friend
          groups and maintaining privacy.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Privacy Levels</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Public</strong>: Everyone can see
          </li>
          <li>
            <strong>Friends Only</strong>: Only friends in app
          </li>
          <li>
            <strong>Specific Groups</strong>: Selected friend groups only
          </li>
          <li>
            <strong>Private</strong>: Only you and admin
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">What You Can Control</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Activity visibility (show/hide details)</li>
          <li>Availability visibility (show as busy without details)</li>
          <li>Profile information (quote, Instagram, photos)</li>
          <li>Past trips visibility</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Control over personal information</li>
          <li>Separate work and personal life</li>
          <li>Privacy for sensitive activities</li>
          <li>Professional boundaries</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~39 hours (5 days)</p>
      </section>
    </div>
  ),

  "Mobile App (PWA)": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Transform the web app into a Progressive Web App (PWA) that can be installed on phones and works offline,
          providing a native app-like experience.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">What is a PWA?</h3>
        <p>
          A website that behaves like a native mobile app: installable on home screen, works offline, fast loading, push
          notifications, and full-screen experience.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Install on home screen (no app store needed)</li>
          <li>Offline access to trips and activities</li>
          <li>Push notifications</li>
          <li>Fast loading with caching</li>
          <li>Full-screen mode (no browser UI)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Offline Functionality</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>View trips and activities offline</li>
          <li>Browse calendar without internet</li>
          <li>Queue actions to sync when online</li>
          <li>Cached photos and data</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Native app experience without app store</li>
          <li>Works on flights and remote areas</li>
          <li>Faster loading and less data usage</li>
          <li>Instant updates (no app store approval)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~55 hours (7 days)</p>
      </section>
    </div>
  ),

  "Trip Templates": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Save and reuse trip templates for common destinations, making it faster to plan similar trips by cloning
          budget, activities, and settings.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Complete a successful trip</li>
          <li>Click "Save as Template"</li>
          <li>Choose what to include (budget, activities, duration)</li>
          <li>Name and describe the template</li>
          <li>Reuse for future trips to same destination</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Template Components</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Budget breakdown by category</li>
          <li>Common activities and timing</li>
          <li>Packing list suggestions</li>
          <li>Best time to visit</li>
          <li>Pro tips and notes</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Faster trip creation (5 min vs 30 min)</li>
          <li>Consistent budgeting</li>
          <li>Learn from past experiences</li>
          <li>Share templates with friends</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~36 hours (4-5 days)</p>
      </section>
    </div>
  ),

  "Activity Suggestions": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Get AI-powered recommendations for activities, restaurants, and attractions based on trip destination, dates,
          and group preferences.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Suggestion Categories</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Restaurants</strong>: Local specialties, highly-rated spots, budget options
          </li>
          <li>
            <strong>Attractions</strong>: Must-see landmarks, hidden gems, photo spots
          </li>
          <li>
            <strong>Activities</strong>: Adventure, relaxation, group-friendly experiences
          </li>
          <li>
            <strong>Practical Info</strong>: Opening hours, costs, booking requirements
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Enter trip destination and dates</li>
          <li>AI analyzes location, weather, and group preferences</li>
          <li>Get personalized activity recommendations</li>
          <li>Add suggested activities to itinerary with one click</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Data Sources</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Google Places API for restaurants and attractions</li>
          <li>TripAdvisor for reviews and rankings</li>
          <li>Past trip data for personalization</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Discover new activities and hidden gems</li>
          <li>Save research time</li>
          <li>Avoid tourist traps</li>
          <li>Personalized to group preferences</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~42 hours (5-6 days)</p>
      </section>
    </div>
  ),

  "Friend Availability Heatmap": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Visualize friend availability across calendar months with color-coded heatmap, making it easy to identify
          optimal dates when most friends are free.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <p>Calendar grid where each date is colored by availability:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-green-600">Dark green</strong>: All friends available
          </li>
          <li>
            <strong className="text-green-400">Light green</strong>: Most friends available
          </li>
          <li>
            <strong className="text-yellow-500">Yellow</strong>: Some friends available
          </li>
          <li>
            <strong className="text-orange-500">Orange</strong>: Few friends available
          </li>
          <li>
            <strong className="text-red-500">Red</strong>: Most friends busy
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Interactive Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click date to see who's available/busy</li>
          <li>Filter by specific friends or groups</li>
          <li>Find optimal date ranges automatically</li>
          <li>Compare multiple months</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visual date selection at a glance</li>
          <li>Maximize trip participation</li>
          <li>Data-driven scheduling decisions</li>
          <li>Identify availability patterns</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~38 hours (5 days)</p>
      </section>
    </div>
  ),

  "Trip Memories Timeline": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Create a chronological timeline of all past trips with photos, highlights, and memories, making it easy to
          reminisce and plan similar trips.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Timeline Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Vertical timeline of all past trips</li>
          <li>Trip cards with photos and highlights</li>
          <li>Year markers for easy navigation</li>
          <li>Search and filter by destination, date, participants</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Trip Memory Card</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Trip name, dates, and destination</li>
          <li>Photo carousel (top 5 photos)</li>
          <li>Trip highlights and memorable moments</li>
          <li>Budget summary and statistics</li>
          <li>Participant photos</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Special Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Anniversary reminders ("One year ago today")</li>
          <li>Share trip memory on social media</li>
          <li>Generate trip highlight video</li>
          <li>Export trip summary PDF</li>
          <li>Compare similar trips over time</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Relive past adventures</li>
          <li>Strengthen friendships through shared memories</li>
          <li>Learn from past trips for future planning</li>
          <li>Celebrate group milestones</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~42 hours (5-6 days)</p>
      </section>
    </div>
  ),

  "Collaborative Itinerary Planning": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Enable real-time collaborative editing of trip itineraries where multiple friends can simultaneously add,
          edit, and organize activities with live updates.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Real-Time Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Multiple friends edit simultaneously</li>
          <li>See others' cursors and selections</li>
          <li>Changes appear instantly for everyone</li>
          <li>Presence indicators (who's online)</li>
          <li>"X is typing..." indicators</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Collaboration Tools</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Drag-and-drop to reorder activities</li>
          <li>Vote on activity inclusion</li>
          <li>Comment on specific activities</li>
          <li>In-app chat for discussions</li>
          <li>Version history and undo</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Conflict Resolution</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Automatic merge of non-conflicting changes</li>
          <li>Highlight conflicts for manual resolution</li>
          <li>Activity locking during edits</li>
          <li>Last-write-wins with notifications</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Faster itinerary creation</li>
          <li>Everyone contributes and feels involved</li>
          <li>No version conflicts</li>
          <li>Transparent planning process</li>
          <li>Democratic decision-making</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Technical Implementation</h3>
        <p>
          Uses WebSocket for real-time sync, operational transformation for conflict resolution, and presence system to
          track online users.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~65 hours (8-9 days)</p>
      </section>
    </div>
  ),

  "User Authentication & Login System": (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold mb-2">Overview</h3>
        <p>
          Transform the app from a shared-view system to a personalized experience where each friend has their own
          account with PIN-based authentication.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Why PIN-Based?</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Simple & Fast</strong>: No complex passwords to remember
          </li>
          <li>
            <strong>Mobile-Friendly</strong>: Easy to type on phones
          </li>
          <li>
            <strong>Familiar</strong>: Like banking apps and phone unlocks
          </li>
          <li>
            <strong>Secure Enough</strong>: Adequate for friend group app
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold">Registration (Admin Only)</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Admin creates friend account</li>
              <li>Admin adds phone number</li>
              <li>Friend receives setup link via SMS/WhatsApp</li>
              <li>Friend sets 4-6 digit PIN</li>
              <li>PIN is hashed and stored securely</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold">Login Flow</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Enter phone number</li>
              <li>Enter PIN</li>
              <li>System validates PIN</li>
              <li>Creates session token</li>
              <li>Redirects to personalized dashboard</li>
            </ol>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Security Features</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Rate limiting: Max 5 attempts per 15 minutes</li>
          <li>PIN lockout after 10 failed attempts</li>
          <li>Session expiry: 30 days</li>
          <li>Secure PIN hashing with bcrypt</li>
          <li>Optional SMS verification for PIN reset</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Personalized Experience</h3>
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold">Before Login (Public View)</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>View calendar of all trips (read-only)</li>
              <li>See who's busy/available</li>
              <li>Submit feature requests</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">After Login (Personalized)</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>See "My Trips" vs "All Trips"</li>
              <li>Edit/cancel own activities</li>
              <li>Quick join trips (auto-fills your name)</li>
              <li>Update profile (quote, Instagram, photo)</li>
              <li>View personalized notifications</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Personalized experience for each friend</li>
          <li>Own and manage your data</li>
          <li>Faster workflows (no name selection)</li>
          <li>Better security and accountability</li>
          <li>Professional-looking app</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Estimated Effort</h3>
        <p className="font-semibold">~32 hours (4 days)</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Database schema: 2 hours</li>
          <li>Authentication backend: 8 hours</li>
          <li>Login UI: 4 hours</li>
          <li>Session management: 4 hours</li>
          <li>Admin panel updates: 4 hours</li>
          <li>Testing & security: 6 hours</li>
          <li>Migration & rollout: 4 hours</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Success Metrics</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>All friends set up PINs within 1 week</li>
          <li>Login time under 5 seconds</li>
          <li>Zero security incidents</li>
          <li>Increased engagement (2x logins per week)</li>
          <li>50% reduction in admin workload</li>
        </ul>
      </section>
    </div>
  ),
}

export function BacklogDetailModal({ item, isOpen, onClose, onVote }: BacklogDetailModalProps) {
  if (!item) return null

  const detailedContent = AI_FEATURE_DETAILS[item.title]
  const isImplemented = item.title === "Recurring Activities"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{item.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap pt-2">
            <Badge
              variant="outline"
              className={
                item.source === "ai"
                  ? "bg-purple-500/10 text-purple-700 border-purple-200"
                  : "bg-blue-500/10 text-blue-700 border-blue-200"
              }
            >
              {item.source === "ai" ? "AI Suggested" : "Admin Created"}
            </Badge>
            <Badge
              variant="outline"
              className={
                item.complexity === "Low"
                  ? "bg-green-500/10 text-green-700 border-green-200"
                  : item.complexity === "Medium"
                    ? "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                    : "bg-red-500/10 text-red-700 border-red-200"
              }
            >
              Complexity: {item.complexity}
            </Badge>
            <Badge variant="outline">Impact: {item.impact}</Badge>
            <Badge variant="secondary">{item.category}</Badge>
            {isImplemented && (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {detailedContent ? (
            <div className="text-sm leading-relaxed">{detailedContent}</div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">{item.description}</p>
              <p className="text-xs text-muted-foreground italic">Detailed implementation plan coming soon...</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {item.votes} vote{item.votes !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onVote(item)}>Vote for this feature</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
