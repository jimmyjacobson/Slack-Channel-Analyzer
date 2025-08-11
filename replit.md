# Slack Conversation Analyzer

## Overview

A Node.js command-line tool that analyzes Slack channel conversations using AI. The application integrates with Slack's Web API to fetch messages from specified channels since a given datetime, then processes those conversations using OpenAI's GPT-4o model for intelligent analysis. It supports threaded conversations, user name resolution, and flexible datetime input formats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Application Structure
- **Single-file CLI Application**: Built as a standalone Node.js script (`slack-analyzer.js`) using a command-line interface pattern
- **Event-driven Processing**: Fetches data from Slack API, processes it, and sends to OpenAI for analysis in a linear workflow

### CLI Framework
- **Commander.js Integration**: Provides structured command-line argument parsing with required and optional parameters
- **Flexible Input Handling**: Supports both ISO datetime formats and relative date expressions (e.g., "2 days ago")

### Data Processing Pipeline
- **Message Retrieval**: Fetches messages from Slack channels with pagination support for large datasets
- **Thread Resolution**: Automatically includes threaded replies in the conversation context
- **User Identity Resolution**: Converts Slack user IDs to human-readable usernames for better analysis context

### Authentication Strategy
- **Token-based Authentication**: Uses Slack Bot Tokens for API access with specific permission requirements
- **Environment Variable Support**: Supports both command-line and environment variable configuration for API keys

### AI Integration Architecture
- **OpenAI GPT-4o Model**: Fixed model selection optimized for conversation analysis tasks
- **Custom Prompt Processing**: Accepts user-defined analysis prompts for flexible conversation interpretation

## External Dependencies

### Slack Integration
- **@slack/web-api**: Official Slack Web API client for message retrieval and user information
- **Required Permissions**: 
  - `channels:history` for public channel access
  - `groups:history` for private channel access
  - `users:read` for username resolution
  - `conversations.history` for conversation access

### AI Processing
- **OpenAI API**: GPT-4o model for conversation analysis and interpretation
- **API Key Management**: Supports environment variable (`OPENAI_API_KEY`) or command-line parameter

### Utility Libraries
- **commander**: Command-line interface framework for argument parsing and validation
- **moment**: DateTime manipulation and parsing library for flexible date input handling

### Runtime Environment
- **Node.js**: Requires version 14 or higher for modern JavaScript features and API compatibility