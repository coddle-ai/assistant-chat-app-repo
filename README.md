# Assistant Chat App with Streaming

A React Native chat application featuring real-time streaming responses and advanced message handling.

## Key Features

### Streaming Chat Screen

The app's core feature is the streaming chat implementation that provides:

- Real-time message streaming with typing indicators
- Smooth message updates without flashing
- Robust error handling and recovery
- Detailed logging for debugging
- Rate limiting and backoff mechanisms

### Technical Highlights

#### StreamChatScreen

- **Message State Management**: Efficient handling of streaming messages with proper state transitions
- **Error Resilience**: Graceful handling of API failures and network issues
- **Performance Optimizations**:
  - Message chunk processing
  - Smart scrolling behavior
  - Rate limiting with exponential backoff

#### Streaming API Service

- **Polling Implementation**: Efficient polling mechanism for real-time updates
- **Message Processing**: Advanced content extraction and formatting
- **Error Recovery**: Automatic retry mechanisms and fallback strategies

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/coddle-ai/assistant-chat-app-repo.git
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

## Project Structure

```
├── app/
│   └── (tabs)/
│       └── streamchat.js      # Streaming chat tab entry point
├── screens/
│   └── StreamChatScreen.js    # Main streaming chat implementation
├── services/
│   └── streamingApiService.js # Streaming API implementation
└── components/
    └── MessageBubble.js       # Message display component
```

## Implementation Details

### StreamChatScreen

The main streaming chat screen implements:

- Real-time message updates
- Streaming state management
- Error handling and recovery
- Performance optimizations

### Message Handling

- Efficient message state updates
- Smooth UI transitions
- Proper error state management
- Detailed logging for debugging

### API Integration

- Robust streaming implementation
- Rate limiting and backoff
- Error recovery mechanisms
- Content processing and formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
