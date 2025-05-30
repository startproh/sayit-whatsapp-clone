
Built by https://www.blackbox.ai

---

# SayIt - WhatsApp Clone

## Project Overview

SayIt is a cross-platform mobile application designed to replicate the core functionalities of WhatsApp. Developed using React Native, this application leverages Firebase for backend services, enabling real-time messaging, user authentication, media sharing, and voice and video calls. With a user-friendly interface, SayIt aims to provide a seamless communication experience.

## Installation

To install and run the SayIt application, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sayit.git
   cd sayit
   ```

2. **Install dependencies**
   Make sure you have [Node.js](https://nodejs.org/) installed. Then run:
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project via the [Firebase Console](https://console.firebase.google.com/).
   - Configure the app with Firebase (refer to the Firebase documentation for detailed instructions).

4. **Run the application**
   Using Expo, you can run the application with:
   ```bash
   npm start
   ```

5. **Launch on an emulator or your mobile device**
   You can use Expo Go to run the project on your mobile device by scanning the QR code or use an emulator.

## Usage

Once the app is running:

1. **Onboarding**: Users will go through an onboarding flow where they will register via their phone number and receive an SMS OTP for authentication.
2. **Interface**: Navigate through the app to access chat functionalities, contacts, voice and video calls, and media sharing.

## Features

- **User Authentication**: Phone number authentication with SMS OTP.
- **Real-Time Messaging**: Instant messaging with status updates (sent, delivered, read).
- **Contact Synchronization**: Sync contacts to find friends using SayIt.
- **Voice and Video Calls**: High-quality voice and video calls using WebRTC.
- **Media Sharing**: Share images, videos, and documents within chats.
- **User Profile Management**: Manage user profiles and statuses (online/offline).
- **Custom UI**: A clean and stylish interface with customizable themes, including dark mode support.

## Dependencies

The project uses the following dependencies as specified in the `package.json`:

- `react-native`
- `expo`
- `firebase`
- `@react-navigation/native`
- `react-native-webrtc`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `@react-native-firebase/storage`
- `react-native-contacts`
- `react-native-vector-icons`

## Project Structure

The project structure follows a modular approach for better maintainability:

```
sayit/
├── src/
│   ├── assets/          # Images, icons, and theme files
│   ├── components/      # Reusable UI components
│   ├── screens/         # Main app screens
│   ├── navigation/      # Navigation configuration
│   ├── services/        # Firebase, WebRTC, and other services
│   ├── store/           # State management
│   └── utils/           # Helper functions
├── app.json             # Expo configuration
└── App.js               # Root component
```

## Security Considerations

- Implement end-to-end encryption for messages.
- Securely store user data and comply with data protection regulations.
- Apply rate limiting for API calls and sanitize all input to prevent injections.

## Performance Optimization

To ensure a smooth user experience, the following optimizations are in place:

- Lazy loading of media content and message pagination feature.
- Offline support and background task optimizations to reduce resource consumption.

## Testing Strategy

A comprehensive testing strategy is implemented, including:

- Unit tests for core functionalities.
- Integration tests for Firebase services.
- End-to-end tests for critical user flows.
- Performance and security testing.

For any contributions or inquiries, please feel free to reach out!