# Blip Social Networking App Backend

A real-time social networking app backend built with Firebase, featuring phone number authentication, location-based matching, and activity management.

## Features

- Phone number authentication using Firebase Auth
- Real-time user status and location tracking
- Interest and location-based matching
- Activity creation and management
- Secure Firestore rules with role-based access control
- Cloud Functions for backend logic

## Prerequisites

- Node.js 18 or later
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (for Cloud Functions)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase project:
```bash
firebase init
```
Select the following features:
- Functions
- Firestore
- Hosting (optional)

4. Deploy to Firebase:
```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── config/
│   │   └── firebase.ts      # Firebase initialization and config
│   ├── functions/
│   │   └── index.ts         # Cloud Functions
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── firestore.rules          # Firestore security rules
├── package.json
├── tsconfig.json
└── README.md
```

## Cloud Functions

### Authentication
- `onUserCreated`: Triggered when a new user signs up, creates their profile

### Matching
- `findMatches`: HTTP endpoint for finding matches based on location and interests

### Activities
- `createActivity`: Creates a new activity
- `joinActivity`: Allows users to join an activity

## Security Rules

The Firestore security rules implement role-based access control:
- Users can only read/write their own profiles
- Activities can be read by any authenticated user
- Only activity creators can delete activities
- Matches and notifications are protected by user ownership

## Development

1. Start local emulator:
```bash
npm run serve
```

2. Build TypeScript:
```bash
npm run build
```

## License

MIT 