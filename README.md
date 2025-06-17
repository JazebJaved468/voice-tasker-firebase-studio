# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

# Local Run

To run this application on your local setup, you'll typically need to do the following in your terminal:

Install Dependencies: If you haven't already, open your terminal in the project's root directory and run:

```
npm install
```

This command installs all the necessary packages defined in your package.json file.

Set Up Environment Variables (for Genkit/Google AI): The application uses Genkit with Google AI, which requires an API key.

Create a file named .env in the root of your project (the same directory as package.json).
Inside the .env file, add your Google AI API key like this:
GOOGLE_API_KEY=YOUR_API_KEY_HERE

Replace YOUR_API_KEY_HERE with your actual API key. You can obtain one from Google AI Studio.
Run the Genkit Development Server: Genkit flows need their own development server. Open a new terminal window or tab, navigate to your project directory, and run:

```
npm run genkit:dev
```

Alternatively, if you want Genkit to automatically restart when you make changes to your AI flows, you can use:

```
npm run genkit:watch
```

Run the Next.js Application: In another terminal window or tab (while the Genkit server is still running), navigate to your project directory and start the Next.js development server:

```
npm run dev
```

This will typically start the app on http://localhost:9002.

So, in summary:

Terminal 1: `npm run genkit:dev`(or `npm run genkit:watch`)
Terminal 2:`npm run dev`And make sure you have`npm install`run once and your`.env` file set up!
