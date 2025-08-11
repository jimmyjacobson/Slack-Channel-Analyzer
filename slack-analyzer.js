#!/usr/bin/env node

const { WebClient } = require('@slack/web-api');
const OpenAI = require('openai');
const { Command } = require('commander');
const moment = require('moment');

// Initialize commander for CLI argument parsing
const program = new Command();

program
  .name('slack-analyzer')
  .description('Analyze Slack channel conversations using AI')
  .version('1.0.0')
  .requiredOption('-t, --token <token>', 'Slack Auth Token')
  .requiredOption('-c, --channel <channel>', 'Slack channel ID or name')
  .requiredOption('-d, --datetime <datetime>', 'Start datetime (ISO format or relative like "2 days ago")')
  .requiredOption('-p, --prompt <prompt>', 'AI analysis prompt')
  .option('--openai-key <key>', 'OpenAI API Key (defaults to OPENAI_API_KEY env var)')
  .parse();

const options = program.opts();

// Validate Slack token format
if (!options.token.startsWith('xoxb-')) {
  console.error('❌ Invalid Slack token format. Bot tokens should start with "xoxb-"');
  console.error('   Please provide a valid Slack Bot User OAuth Token.');
  console.error('   Get one at: https://api.slack.com/apps → Your App → OAuth & Permissions');
  process.exit(1);
}

// Initialize Slack client
const slack = new WebClient(options.token);

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: options.openaiKey || process.env.OPENAI_API_KEY 
});

/**
 * Converts a relative datetime string to Unix timestamp
 * @param {string} datetimeInput - Input datetime string
 * @returns {number} Unix timestamp
 */
function parseDateTime(datetimeInput) {
  let parsedDate;
  
  // First check if it's a relative date like "2 days ago", "1 week ago"
  const relativeMatch = datetimeInput.match(/(\d+)\s+(day|days|week|weeks|hour|hours|minute|minutes)\s+ago/i);
  if (relativeMatch) {
    const [, amount, unit] = relativeMatch;
    parsedDate = moment().subtract(parseInt(amount), unit);
  } else {
    // Try parsing as ISO date
    parsedDate = moment(datetimeInput);
  }
  
  if (!parsedDate.isValid()) {
    throw new Error(`Invalid datetime format: ${datetimeInput}. Use ISO format (2024-01-01T10:00:00Z) or relative format (2 days ago)`);
  }
  
  return parsedDate.unix();
}

/**
 * Resolves channel name to channel ID
 * @param {string} channelInput - Channel name or ID
 * @returns {Promise<string>} Channel ID
 */
async function resolveChannelId(channelInput) {
  // If it looks like a channel ID (starts with C), return as is
  if (channelInput.match(/^C[A-Z0-9]+$/)) {
    return channelInput;
  }
  
  // Remove # prefix if present
  const channelName = channelInput.replace(/^#/, '');
  
  try {
    // List all channels and find the matching name
    const response = await slack.conversations.list({
      types: 'public_channel,private_channel',
      limit: 1000
    });
    
    const channel = response.channels.find(ch => ch.name === channelName);
    if (!channel) {
      throw new Error(`Channel not found: ${channelInput}`);
    }
    
    return channel.id;
  } catch (error) {
    throw new Error(`Failed to resolve channel: ${error.message}`);
  }
}

/**
 * Fetches all users and creates a mapping of user ID to username
 * @returns {Promise<Map<string, string>>} Map of user ID to username
 */
async function getUserMap() {
  const userMap = new Map();
  let cursor = null;
  
  try {
    do {
      const response = await slack.users.list({
        cursor: cursor,
        limit: 1000
      });
      
      response.members.forEach(user => {
        userMap.set(user.id, user.real_name || user.name || user.profile?.display_name || 'Unknown User');
      });
      
      cursor = response.response_metadata?.next_cursor;
    } while (cursor);
    
    return userMap;
  } catch (error) {
    console.error('Warning: Failed to fetch user list, will use user IDs instead of names');
    return userMap;
  }
}

/**
 * Fetches threaded replies for a message
 * @param {string} channelId - Channel ID
 * @param {string} threadTs - Thread timestamp
 * @returns {Promise<Array>} Array of reply messages
 */
async function getThreadReplies(channelId, threadTs) {
  try {
    const response = await slack.conversations.replies({
      channel: channelId,
      ts: threadTs
    });
    
    // Remove the first message (parent) and return only replies
    return response.messages.slice(1) || [];
  } catch (error) {
    console.error(`Failed to fetch thread replies for ${threadTs}:`, error.message);
    return [];
  }
}

/**
 * Fetches all messages from a Slack channel since the specified datetime
 * @param {string} channelId - Channel ID
 * @param {number} sinceTimestamp - Unix timestamp
 * @param {Map<string, string>} userMap - User ID to username mapping
 * @returns {Promise<Array>} Array of formatted messages
 */
async function fetchChannelMessages(channelId, sinceTimestamp, userMap) {
  const allMessages = [];
  let cursor = null;
  let hasMore = true;
  
  console.log('Fetching messages from channel...');
  
  try {
    while (hasMore) {
      const response = await slack.conversations.history({
        channel: channelId,
        oldest: sinceTimestamp,
        cursor: cursor,
        limit: 1000
      });
      
      if (!response.messages || response.messages.length === 0) {
        break;
      }
      
      // Process each message
      for (const message of response.messages) {
        const username = userMap.get(message.user) || message.user || 'Unknown User';
        const timestamp = moment.unix(message.ts).format('YYYY-MM-DD HH:mm:ss');
        
        const formattedMessage = {
          timestamp: timestamp,
          username: username,
          text: message.text || '',
          type: message.type || 'message',
          replies: []
        };
        
        // Fetch threaded replies if they exist
        if (message.thread_ts && message.thread_ts === message.ts) {
          console.log(`Fetching ${message.reply_count || 0} thread replies...`);
          const replies = await getThreadReplies(channelId, message.ts);
          
          formattedMessage.replies = replies.map(reply => ({
            timestamp: moment.unix(reply.ts).format('YYYY-MM-DD HH:mm:ss'),
            username: userMap.get(reply.user) || reply.user || 'Unknown User',
            text: reply.text || '',
            type: reply.type || 'message'
          }));
        }
        
        allMessages.push(formattedMessage);
      }
      
      cursor = response.response_metadata?.next_cursor;
      hasMore = !!cursor;
      
      console.log(`Fetched ${allMessages.length} messages so far...`);
    }
    
    // Sort messages by timestamp (oldest first)
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return allMessages;
  } catch (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Formats conversation data for AI processing
 * @param {Array} messages - Array of message objects
 * @param {string} channelId - Channel ID
 * @returns {string} Formatted conversation text
 */
function formatConversationForAI(messages, channelId) {
  let conversationText = `=== SLACK CHANNEL CONVERSATION (${channelId}) ===\n\n`;
  
  messages.forEach(message => {
    conversationText += `[${message.timestamp}] ${message.username}: ${message.text}\n`;
    
    // Add threaded replies with indentation
    message.replies.forEach(reply => {
      conversationText += `    └─ [${reply.timestamp}] ${reply.username}: ${reply.text}\n`;
    });
    
    conversationText += '\n';
  });
  
  return conversationText;
}

/**
 * Processes conversation data with OpenAI using the provided prompt
 * @param {string} conversationData - Formatted conversation text
 * @param {string} userPrompt - User's analysis prompt
 * @returns {Promise<string>} AI response
 */
async function analyzeWithAI(conversationData, userPrompt) {
  try {
    console.log('Processing conversation with AI...');
    
    const systemPrompt = `You are an AI assistant specialized in analyzing Slack conversations. You will be provided with conversation data from a Slack channel including timestamps, usernames, messages, and threaded replies. Please analyze this data according to the user's specific request.

The conversation data includes:
- Timestamps in YYYY-MM-DD HH:mm:ss format
- Usernames (converted from user IDs)
- Message content
- Threaded replies (indented with └─)

Please provide a thorough and insightful analysis based on the user's prompt.`;

    const fullPrompt = `${userPrompt}\n\n=== CONVERSATION DATA ===\n${conversationData}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: fullPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Slack conversation analysis...\n');
    
    // Validate OpenAI API key
    if (!options.openaiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Provide it via --openai-key option or OPENAI_API_KEY environment variable.');
    }
    
    // Parse datetime
    console.log('📅 Parsing datetime...');
    const sinceTimestamp = parseDateTime(options.datetime);
    const readableDate = moment.unix(sinceTimestamp).format('YYYY-MM-DD HH:mm:ss');
    console.log(`   Fetching messages since: ${readableDate}\n`);
    
    // Resolve channel ID
    console.log('🔍 Resolving channel...');
    const channelId = await resolveChannelId(options.channel);
    console.log(`   Channel ID: ${channelId}\n`);
    
    // Fetch user mapping
    console.log('👥 Fetching user information...');
    const userMap = await getUserMap();
    console.log(`   Loaded ${userMap.size} users\n`);
    
    // Fetch messages
    console.log('💬 Fetching channel messages...');
    const messages = await fetchChannelMessages(channelId, sinceTimestamp, userMap);
    console.log(`   Retrieved ${messages.length} messages\n`);
    
    if (messages.length === 0) {
      console.log('ℹ️  No messages found in the specified time range.');
      return;
    }
    
    // Format conversation for AI
    console.log('📝 Formatting conversation data...');
    const conversationData = formatConversationForAI(messages, channelId);
    console.log(`   Formatted ${conversationData.length} characters of conversation data\n`);
    
    // Analyze with AI
    console.log('🤖 Analyzing conversation with AI...');
    console.log(`   Prompt: "${options.prompt}"\n`);
    
    const analysis = await analyzeWithAI(conversationData, options.prompt);
    
    console.log('✅ Analysis complete!\n');
    console.log('='.repeat(80));
    console.log('AI ANALYSIS RESULT');
    console.log('='.repeat(80));
    console.log(analysis);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Execute main function if script is run directly
if (require.main === module) {
  main();
}

module.exports = {
  parseDateTime,
  resolveChannelId,
  getUserMap,
  fetchChannelMessages,
  formatConversationForAI,
  analyzeWithAI
};
