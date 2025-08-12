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

## Quick Start Guide

If you're new to running scripts, follow these steps in order:

1. **Install Node.js** (see Step 1 above)
2. **Download this script** to your computer
3. **Open terminal/command prompt** and navigate to the script folder
4. **Install dependencies:** `npm install @slack/web-api openai commander moment`
5. **Get your Slack and OpenAI API keys** (see Step 4 above)  
6. **Add your bot to a Slack channel:** `/invite @your-bot-name`
7. **Run the script** with your details

### Example First Run

```bash
node slack-analyzer.js --token "xoxb-1234-5678-abcdef" --channel "general" --datetime "1 day ago" --prompt "What were people talking about?"
```

## Troubleshooting

**"node: command not found"**
- Node.js isn't installed. Follow Step 1 above.

**"Cannot find module"**
- Dependencies aren't installed. Run: `npm install @slack/web-api openai commander moment`

**"Invalid Slack token format"**
- Your token should start with `xoxb-` or `xoxp-`. Check Step 4 above.

**"Channel not found" or "Bot not in channel"**
- Add the bot to the channel first: `/invite @your-bot-name`

**"OpenAI API key required"**
- Get an OpenAI API key from https://platform.openai.com/ or use `--openai-key` option

### Required Dependencies

The script uses the following npm packages:
- `@slack/web-api` - Slack Web API client
- `openai` - OpenAI API client
- `commander` - Command-line interface
- `moment` - DateTime processing

## Installation

### Step 1: Install Node.js

If you don't have Node.js installed on your computer:

**Windows:**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the "LTS" (recommended) version
3. Run the installer and follow the prompts
4. Verify installation by opening Command Prompt and typing: `node --version`

**macOS:**
1. Visit [nodejs.org](https://nodejs.org/) and download the LTS version, OR
2. Use Homebrew (if installed): `brew install node`
3. Verify installation by opening Terminal and typing: `node --version`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Download the Script

1. Download or clone this repository to your computer
2. Open Terminal (macOS/Linux) or Command Prompt (Windows)
3. Navigate to the folder containing the script:
   ```bash
   cd path/to/slack-analyzer
   ```

### Step 3: Install Dependencies

Run this command in the script folder:
```bash
npm install @slack/web-api openai commander moment
```

This will download and install all the required packages the script needs to work.

## Usage

### Step 4: Get Your API Keys

Before running the script, you need two API keys:

**Slack Bot Token:**
1. Go to https://api.slack.com/apps
2. Create a new app or select an existing one
3. Navigate to "OAuth & Permissions" in the sidebar
4. Under "Bot Token Scopes", add these permissions:
   - `channels:read` - To list and find channels
   - `channels:history` - To read message history from public channels
   - `groups:read` - To access private channels (if needed)
   - `groups:history` - To read private channel messages
   - `users:read` - To convert user IDs to usernames
5. Install the app to your workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

**OpenAI API Key:**
1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 5: Add the Bot to a Channel

The bot needs to be invited to channels before it can read messages:
1. Go to any Slack channel (like #general)
2. Type: `/invite @your-bot-name`
3. The bot will now have access to read messages from that channel

## Usage

### Basic Usage

```bash
node slack-analyzer.js --token "xoxb-your-bot-token" --channel "#general" --datetime "2 days ago" --prompt "Summarize the main topics discussed"
```

### How to Run the Script

1. **Open your terminal/command prompt**
2. **Navigate to the script folder:**
   ```bash
   cd path/to/slack-analyzer
   ```
3. **Run the script with your parameters:**
   ```bash
   node slack-analyzer.js --token "xoxb-your-token" --channel "channel-name" --datetime "time-period" --prompt "your-analysis-request"
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
```

## Sample Output

When the script runs successfully, you'll see output like this:

![Sample Output](attached_assets/Screenshot%202025-08-12%20at%2010.20.11%20AM_1755021237374.png)

The script provides detailed analysis including:
- General team atmosphere and collaboration patterns
- Technical engagement and knowledge sharing
- Team humor and camaraderie indicators  
- Problem-solving culture and support systems
- Learning mindset and technology adoption
- Overall morale and motivation levels

## Command Line Options

- `-t, --token <token>` - Your Slack authentication token (required)
- `-c, --channel <channel>` - Channel name or ID to analyze (required)
- `-d, --datetime <datetime>` - Start date/time for analysis (required)
- `-p, --prompt <prompt>` - Your analysis instruction for AI (required)
- `--openai-key <key>` - OpenAI API key (optional if set as environment variable)
- `-h, --help` - Show help information
- `-V, --version` - Show version number

## About

This Slack Conversation Analyzer was created to help teams gain insights into their communication patterns and team dynamics using AI analysis.

**Created by:** Jimmy Jacobson  
**Website:** [www.codingscape.com](https://www.codingscape.com)  
**LinkedIn:** [linkedin.com/in/jimmyjacobson](https://www.linkedin.com/in/jimmyjacobson/)

For questions, feedback, or collaboration opportunities, feel free to reach out through any of the above channels.
