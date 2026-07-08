# AI Chatbot for Shopify (React + Node.js + OpenAI)

This repository contains a sample AI chatbot built using **React**, **Tailwind CSS**, and **OpenAI’s API**. The chatbot is designed for integration into a Shopify store, but it can be adapted for other e-commerce or web platforms.

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
5. [Project Structure](#project-structure)  
6. [Usage](#usage)  
7. [Customization](#customization)  
8. [Contributing](#contributing)  
9. [License](#license)

---

## Overview

This project demonstrates how to:

- Set up a **React** frontend with a chat UI component (`ChatInput`).
- Use **Node.js** or serverless functions as a backend to connect with the **OpenAI** API.
- Integrate a chatbot into a Shopify storefront (or any other platform).

By default, the chatbot can be used to handle common customer queries, guide product recommendations, or provide other niche-specific information.

---

## Features

- **Chat UI**: A minimal, modern chat interface built with React and Tailwind CSS.
- **OpenAI Integration**: Uses the OpenAI API to generate responses in real time.
- **Responsive Design**: The UI is mobile-friendly and easily customizable.
- **Customizable Prompts**: You can tweak prompts or fine-tune your own model for domain-specific language.

---

## Tech Stack

- **Frontend**:  
  - [React](https://reactjs.org/)  
  - [TypeScript](https://www.typescriptlang.org/)  
  - [Tailwind CSS](https://tailwindcss.com/)  
  - [Heroicons](https://heroicons.com/) (for icons)

- **Backend**:  
  - [Node.js](https://nodejs.org/) (Express or serverless)  
  - [OpenAI API](https://platform.openai.com/docs/introduction)

- **Deployment**:  
  - Any hosting platform that supports Node.js (e.g., Vercel, Heroku, AWS, Netlify, etc.)

---

## Getting Started

### Prerequisites

1. **Node.js** (v20+ recommended)  
2. **npm** or **yarn**  
3. **Anthropic API key** (create one at [console.anthropic.com](https://console.anthropic.com/) if you don't have one)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/BuildTheWeb1/chatter-ai.git
   cd chatter-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env.local` file in the root directory (it's gitignored and overrides `.env`)
   - Add your Anthropic API key:
   ```
   # Anthropic API key for the server-side Claude Agent SDK (never sent to the browser)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. **Start Development Server**:
   ```bash
   # Start the frontend
   npm run dev
   
   # In a separate terminal, start the backend
   npm run dev:server
   ```

5. **Open Browser**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

---

## Configuring for your own site

This app is meant to be run as your own, self-hosted copy: each site/project that
wants the chatbot widget deploys its own copy of both the client and the server
(one process, one deployment, one API key) and embeds/frames the built client
from that site — there's no shared multi-tenant backend and no separate
script-tag/iframe distribution bundle in this pass.

Configuration is entirely via server-side environment variables — no
application code needs to change:

- **`ANTHROPIC_API_KEY`** (required) — your Anthropic API key. Server-side
  only; the Claude Agent SDK reads it directly from `process.env` and it is
  never exposed to the browser.
- **`SYSTEM_PROMPT`** (optional) — set this to override the assistant's
  entire system prompt with a raw string. This is the fastest way to point
  the chatbot at your own persona without touching any files. Takes
  precedence over `SYSTEM_PROMPT_CONFIG_FILE`.
- **`SYSTEM_PROMPT_CONFIG_FILE`** (optional) — path to a JSON file describing
  your assistant, if you'd rather manage the persona and some FAQ context as
  data instead of one long env var string. Defaults to the shipped
  `config/data/assistant.config.json` (a Monopoly board-game support example).
  The file must match this shape:

  ```jsonc
  {
    "systemPrompt": "You are a customer support assistant for ... Describe the assistant's persona, scope, and any key facts it needs here.",
    "faqs": {
      "some_question_key": "The answer to show the assistant for this kind of question.",
      "another_question_key": "Another answer."
    }
  }
  ```

  `faqs` is optional; when present, its entries are appended to `systemPrompt`
  as a "Common FAQs" block.

No retrieval/RAG pipeline is built in this pass — `SYSTEM_PROMPT`/
`SYSTEM_PROMPT_CONFIG_FILE` is the whole configuration surface for now.

### Known limitation: `chatId` is an unauthenticated bearer credential

There is no auth layer in front of a chat's history. The client generates a
`chatId` and persists it to `localStorage`; the server will return history
for, and accept new messages into, *any* `chatId` a WebSocket client sends it
via `subscribe`/`chat` — anyone who obtains a given `chatId` string can read
and write that conversation. Treat `chatId` as a bearer secret, the same way
you'd treat a session cookie. This app intentionally ships as a single-tenant,
self-hosted, no-auth-system design; if you need per-user authentication, add
your own auth layer in front of this app rather than expecting one here.

---

## Project Structure

{{ ... }}

---

## Usage

{{ ... }}

---

## Customization

{{ ... }}

---

## Contributing

{{ ... }}

---

## License

{{ ... }}
