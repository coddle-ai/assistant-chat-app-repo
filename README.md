# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## UI Refresh & Screens Overview

The app features a modern, intuitive interface designed for parents to track their baby's daily activities. Here's an overview of the main screens:

### Main Navigation (Coddle.js)

The main screen features a grid-based dashboard with activity cards for:

- Feeding (Bottle, Breastfeeding, Solids)
- Sleep tracking
- Diaper changes
- Growth measurements
- Activities and milestones
- Quick actions and suggestions

Key features:

- Real-time activity tracking
- Animated transitions and feedback
- Draggable AI assistant button
- Customizable activity visibility
- Daily summary cards

### Nursing Screen (screens/NursingScreen.js)

A dedicated interface for tracking breastfeeding sessions:

- Left/Right side tracking
- Session duration timer
- Historical feeding data
- Notes and observations
- Date and time selection with validation

### Nursing Analytics (screens/NursingAnalyticsScreen.js)

Comprehensive feeding analytics including:

- Feeding patterns visualization
- Duration trends
- Side preference analysis
- Daily/weekly/monthly summaries
- Export capabilities

### Child Profile (screens/ChildProfileScreen.js)

Manage your child's information:

- Profile picture
- Birth details and due date
- Gender selection
- Day/Night time preferences
- Growth tracking

### Daily Logs (Daily-logs.js)

A chronological view of all activities:

- Timeline-based activity display
- Filterable by activity type
- Detailed entry information
- Edit and annotation capabilities
- Date-based navigation

### Diaper Tracking (screens/DiaperScreen.js)

Dedicated diaper change tracking:

- Quick type selection (Wet/Dirty/Mixed)
- Time and date recording
- Consistency tracking
- Concerning indicators
- Pattern recognition

Each screen follows a consistent design language with:

- Soft shadows for depth
- Animated interactions
- Intuitive gestures
- Accessible color schemes
- Responsive layouts for all devices

The UI refresh focuses on making baby tracking effortless while providing valuable insights into your child's patterns and development.
