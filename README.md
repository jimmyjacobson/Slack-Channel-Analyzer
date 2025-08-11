# Slack Conversation Analyzer

A Node.js command-line script for **one-time analysis** of Slack channel conversations using AI. This is not a bot - it's a standalone script that runs once, fetches messages from a specified Slack channel since a given datetime, analyzes them with OpenAI's GPT-4o model using your custom prompt, and exits.

## Features

- 🔗 **Slack Integration**: Connect to any Slack channel using Bot Token authentication
- 📅 **Flexible DateTime Input**: Support for ISO timestamps and relative dates (e.g., "2 days ago")
- 🧵 **Thread Support**: Automatically fetches and includes threaded replies
- 👥 **User Name Resolution**: Converts user IDs to readable usernames
- 📄 **Pagination Handling**: Processes large conversation datasets efficiently
- 🤖 **AI Analysis**: Uses OpenAI's GPT-4o model for intelligent conversation analysis
- ⚡ **CLI Interface**: Easy-to-use command-line interface with comprehensive error handling

## Prerequisites

Before using this script, ensure you have:

1. **Node.js** (v14 or higher)
2. **Slack Authentication Token** with appropriate permissions:
   - **Option A: Bot Token** (starts with `xoxb-`) - Recommended for team use
   - **Option B: User Token** (starts with `xoxp-`) - For personal use
3. **OpenAI API Key** for AI processing

### Getting a Slack Token

**Option A: Bot Token (Recommended)**
1. Go to https://api.slack.com/apps
2. Create a new app or select an existing one
3. Navigate to "OAuth & Permissions" in the sidebar
4. Under "Bot Token Scopes", add these permissions:
   - `channels:history` - Read messages from public channels
   - `groups:history` - Read messages from private channels (if needed)
   - `users:read` - Read user information for username resolution
5. Install the app to your workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

**Option B: User Token (Personal Use)**
1. Go to https://api.slack.com/apps
2. Create a new app for your workspace
3. Under "User Token Scopes", add the same permissions as above
4. Install the app and copy the "User OAuth Token" (starts with `xoxp-`)

### Required Dependencies

The script uses the following npm packages:
- `@slack/web-api` - Slack Web API client
- `openai` - OpenAI API client
- `commander` - Command-line interface
- `moment` - DateTime processing

## Installation

1. Install the required dependencies:
```bash
npm install @slack/web-api openai commander moment
```

## Usage

### Basic Usage

```bash
node slack-analyzer.js --token "xoxb-your-bot-token" --channel "#general" --datetime "2 days ago" --prompt "Summarize the main topics discussed"
```

### Advanced Usage Examples

Analyze recent conversations:
```bash
node slack-analyzer.js -t "xoxb-your-token" -c "C1234567890" -d "1 week ago" -p "What are the main concerns raised by team members?"
```

Use ISO datetime format:
```bash
node slack-analyzer.js -t "xoxb-your-token" -c "#project-updates" -d "2024-01-15T09:00:00Z" -p "Identify action items and their owners"
```

Set OpenAI key explicitly:
```bash
node slack-analyzer.js -t "xoxb-your-token" -c "#general" -d "3 days ago" -p "Analyze team sentiment" --openai-key "sk-your-key"
```

### Environment Variables

You can set these environment variables instead of using command-line options:
- `OPENAI_API_KEY` - Your OpenAI API key
- `SLACK_BOT_TOKEN` - Your Slack bot token
- `SLACK_CHANNEL_ID` - Default channel to analyze

Example using environment variables:
```bash
export SLACK_BOT_TOKEN="xoxb-your-token"
export OPENAI_API_KEY="sk-your-key"
node slack-analyzer.js -c "#general" -d "1 day ago" -p "Summarize today's discussions"
