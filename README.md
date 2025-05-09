# Caption Creator Frontend

This is the Angular frontend for the Caption Creator project.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Angular CLI](https://angular.io/cli) (optional, for global commands)

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm start
   ```
   or
   ```sh
   ng serve
   ```

3. **Open your browser and visit:**
   ```
   http://localhost:4200/
   ```

## Notes

- The frontend expects the backend (API/WebSocket) to be running at `http://localhost:3000/`.
- If you notice the two loading indicators in the chat interface, that is becuase one of them represents a global loading state and the other component level loading.

---

# Caption Creator Backend

This is the NestJS backend for the Caption Creator project.

## Prerequisites

Same as Frontend without the Angular CLI

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run start:dev
   ```
   or
   ```sh
   npm start
   ```

3. **The backend will run at:**
   ```
   http://localhost:3000/
   ```

## Testing

The backend includes comprehensive test coverage using Jest. The tests verify:
- WebSocket message handling and chunking
- Client connection/disconnection management
- Error handling
- Response streaming behavior

To run the tests:
```sh
npm test
```

To run tests in watch mode (useful during development):
```sh
npm run test:watch
```

The test suite includes specific tests for the AI gateway functionality, ensuring:
- Messages are properly chunked and streamed
- Client connections are tracked correctly
- Disconnections are handled gracefully
- Error scenarios are properly managed
- Streaming stops appropriately when clients disconnect

## Notes

- The backend logs all incoming messages with timestamps.
- Mock AI responses are streamed in chunks to simulate typing.
- Ensure the frontend is configured to connect to this backend.

## Why There Is No POST /askAi Endpoint

This backend uses a WebSocket (Socket.IO) interface for all AI interactions, rather than a traditional REST POST endpoint.

**Why?**
- WebSockets enable real-time, streaming responses, providing a more natural and engaging chat experience—just like modern AI chat applications.
- The frontend and backend are fully integrated using this approach, with robust error handling and loading states.
- This design choice allows for chunked, "typing" style responses that are not possible with a simple POST request.

**How to test:**  
To interact with the backend, use the provided frontend or any Socket.IO-compatible client.  
Traditional HTTP tools like `curl` or `wscat` will not work with this server, as it is not a plain WebSocket or REST API.
