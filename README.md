# People Manager - Obsidian CRM Plugin

A powerful Customer Relationship Management (CRM) plugin for Obsidian that helps you manage contacts, track follow-ups, and build meaningful relationships.

## ✨ Features

### 📊 Core Functionality

- **In-Memory People Cache**: Lightning-fast access to all your contacts
- **Automatic File Scanning**: Monitors your People directory for changes in real-time
- **Follow-up Notifications**: Never miss an important follow-up again
- **Reactive Architecture**: Built with RxJS for efficient state management
- **TypeScript**: Fully typed for reliability and maintainability

### 🔔 Notification System

- Configurable notification intervals (5 minutes to 24 hours)
- Adjustable lead time for upcoming follow-ups (0-168 hours)
- Automatic startup notifications for overdue/upcoming follow-ups
- Smart notification system that respects your settings

### 📝 Frontmatter Structure

Track comprehensive information about each person:

```yaml
---
# Core Identity
segment: "Cold Approach"  # Cold Approach / Warm / Family / Business / Gym
city: "Brno"
original-city: "Prague"
born-on: "1990-05-15"

# Contact Information
first-contact: "2024-01-01"
second-contact: "2024-01-05"
last-contact: "2024-01-20"
contact-channel: "Instagram"  # phone/email/IG/Facebook

# Business/Professional
position: "Software Engineer"
status: "Active"
status-business: "Prospect"  # Prospect / Info Session / Follow-up / Close / Customer / Partner
told-about-business: true
urgency: "Medium"

# Relationship Metrics
likability: 8
social-energy: "Positive"  # Impact on you
reliability: 9
relationship-goal: "Business Partner"
relationship: "Friend"

# Personal Attributes
ambitions: "Build a successful startup"
dreams: "Travel the world"
interests: "Tech, Fitness, Photography"
values: "Honesty, Growth, Family"
personality-type: "INTJ"

# Follow-up System
next-step: "Schedule coffee meeting"
follow-up-date-notification: "2024-02-01T10:00:00"
dates: "2024-01-01, 2024-01-15"

# Notes
history-note: "Met at tech conference. Very interested in collaboration."
---

# Person Name

Additional notes and content here...
```

## 🚀 Getting Started

### Installation

1. Download the latest release from GitHub
2. Extract to your Obsidian plugins folder: `.obsidian/plugins/people-manager/`
3. Enable the plugin in Obsidian Settings → Community Plugins
4. Configure your settings in People Manager settings tab

### Basic Setup

1. **Create a People Directory**: By default, the plugin scans a `People` folder in your vault
2. **Create Person Files**: Each person should have their own markdown file
3. **Add Frontmatter**: Use the frontmatter structure above to track information
4. **Set Follow-ups**: Add `follow-up-date-notification` in ISO format

### Commands

- **Show People Statistics**: View total people, upcoming follow-ups, and overdue count
- **Check Follow-ups Now**: Manually trigger a follow-up check
- **Resync All People**: Force rescan of all people files

## ⚙️ Configuration

### General Settings

- **Enable Plugin**: Toggle the entire plugin on/off
- **People Directory**: Specify which folder to scan (default: `People`)
- **Show Ribbon Icon**: Display quick access icon in sidebar
- **Debug Mode**: Enable console logging for troubleshooting

### Notification Settings

- **Enable Notifications**: Toggle follow-up notifications
- **Check Interval**: How often to check for due follow-ups (5-1440 minutes)
- **Lead Time**: How many hours before to notify (0-168 hours)
- **Startup Notifications**: Show pending follow-ups when Obsidian starts

## 📁 Project Structure

```
src/
├── constants.ts              # Plugin constants and defaults
├── main.ts                   # Main plugin entry point
├── types/                    # TypeScript type definitions
│   ├── index.ts
│   ├── person.ts            # Person frontmatter types
│   └── settings.ts          # Settings schemas using Zod
├── core/                     # Core business logic
│   ├── indexer.ts           # File indexing wrapper
│   ├── people-manager.ts    # People cache management
│   ├── notification-manager.ts  # Follow-up notifications
│   └── settings-store.ts    # Reactive settings store
└── ui/                       # User interface components
    └── settings-tab.ts      # Settings UI
```

## 🏗️ Architecture

### Reactive Data Flow

```
File System Changes
        ↓
Generic Indexer (@real1ty-obsidian-plugins/utils)
        ↓
People Indexer (wrapper)
        ↓
People Manager (in-memory cache)
        ↓
Notification Manager
        ↓
User Notifications
```

### Key Components

1. **PeopleIndexer**: Wraps the generic indexer from utils library, adds people-specific logic
2. **PeopleManager**: Maintains in-memory Map of all people, provides query methods
3. **NotificationManager**: Periodically checks for due follow-ups, shows notifications
4. **SettingsStore**: Reactive settings using RxJS BehaviorSubject

## 🛠️ Development

### Prerequisites

- Node.js 16+
- pnpm 9+
- TypeScript 5+

### Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run full CI pipeline
mise run ci
```

### Building

```bash
# Type check
pnpm typecheck

# Lint and format
pnpm check:fix

# Build production
pnpm build
```

## 📊 Use Cases

### Personal Network Management

Track friends, family, and casual contacts with follow-up reminders to maintain relationships.

### Business Development

Manage prospects through your sales pipeline with customizable status tracking:
- Prospect → Info Session → Follow-up → Close → Customer → Partner

### MLM/Network Marketing

Perfect for MLM businesses with comprehensive tracking:
- Contact segments (Cold Approach, Warm, etc.)
- Business status tracking
- Follow-up automation
- Relationship metrics

### Professional Networking

Track colleagues, mentors, and industry connections with:
- Position and status tracking
- Likability and reliability scores
- Personal interests and values
- Follow-up scheduling

## 🔮 Roadmap

### Phase 1: Foundation (✅ Complete)
- Basic indexing and people cache
- Follow-up notifications
- Settings management
- Core data types

### Phase 2: Enhanced Features (Planned)
- Dashboard view with stats
- Filter and search capabilities
- People list view
- Quick add person modal
- Template integration

### Phase 3: Advanced CRM (Planned)
- Pipeline visualization (Kanban board)
- Activity timeline per person
- Batch operations
- Export/import functionality
- Analytics and insights

### Phase 4: Intelligence (Planned)
- Lead scoring
- AI-powered suggestions
- Pattern detection
- Relationship health tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 💖 Support

If you find this plugin helpful, consider supporting the developer:

- [GitHub Sponsors](https://github.com/sponsors/Real1tyy)
- [Buy Me a Coffee](https://buymeacoffee.com/real1tyy)

## 🙏 Credits

Built with:
- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- [@real1ty-obsidian-plugins/utils](https://www.npmjs.com/package/@real1ty-obsidian-plugins/utils)
- [RxJS](https://rxjs.dev/)
- [Zod](https://zod.dev/)

---

Made with ❤️ by [Real1tyy](https://github.com/Real1tyy)
