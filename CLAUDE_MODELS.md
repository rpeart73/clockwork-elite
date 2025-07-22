# Claude API Models Reference

## Available Claude Models (as of January 2025)

### Claude 3 Opus (Most Powerful)
- **Model ID**: `claude-3-opus-20240229`
- **Best for**: Complex analysis, nuanced understanding, professional writing
- **Max tokens**: 4096
- **Cost**: Highest tier
- **Use case**: When you need the absolute best quality and understanding

### Claude 3.5 Sonnet (Latest, Fast & Smart)
- **Model ID**: `claude-3-5-sonnet-20241022`
- **Best for**: Balance of speed and intelligence
- **Max tokens**: 8192
- **Cost**: Mid-tier
- **Use case**: Most versatile option for general use

### Claude 3 Haiku (Fastest, Most Affordable)
- **Model ID**: `claude-3-haiku-20240307`
- **Best for**: Quick responses, simple tasks
- **Max tokens**: 4096
- **Cost**: Lowest tier
- **Use case**: When speed and cost are priorities

## Current Implementation

Clockwork Elite uses **Claude 3 Opus** for maximum quality in:
- Case note generation assistance
- Email analysis and comprehension
- Professional language suggestions
- Complex context understanding

## To Change Models

In the code, find this line:
```javascript
model: 'claude-3-opus-20240229',
```

Replace with your preferred model ID from above.

## Why Opus?

Since you're already paying for Claude access, using Opus ensures:
- Best understanding of nuanced student situations
- Most professional language generation
- Superior context retention across conversations
- Highest quality suggestions and analysis

This matches your subscription level and gives you the best AI assistance for case notes.