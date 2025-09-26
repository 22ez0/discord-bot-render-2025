# Overview

This is a comprehensive Discord bot template built with TypeScript, designed to provide a complete foundation for Discord bot development. The project is based on the "Awesome Bot Base" framework developed by @rinckodev and uses the Constatic CLI for generation. It features a modular architecture with sophisticated command handling, event management, and responder systems.

The bot includes various features such as role management, auto-moderation, verification systems, voice channel handling, and server structure management. It's designed to be highly extensible with proper TypeScript support and modern Discord.js patterns.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Discord Interface**: The bot interacts exclusively through Discord's interface using slash commands, buttons, select menus, and modals
- **Component System**: Uses Discord.js components like embeds, buttons, and action rows for rich user interactions
- **Responder Pattern**: Implements a sophisticated responder system for handling button clicks, select menus, and modal submissions

## Backend Architecture
- **TypeScript Framework**: Built entirely in TypeScript with strict type checking and modern ES modules
- **Modular Design**: Organized into distinct modules for commands, events, responders, and functions
- **Base System**: Core functionality is abstracted into a base system that handles:
  - Command registration and execution
  - Event management and middleware
  - Responder routing and parameter parsing
  - Error handling and logging

## Command System
- **Application Commands**: Supports all Discord application command types (ChatInput, User, Message)
- **Subcommand Support**: Hierarchical command structure with groups and subcommands
- **Autocomplete**: Built-in autocomplete functionality for command options
- **Middleware**: Command-level middleware for authorization and preprocessing
- **Dynamic Registration**: Automatic command registration with guild-specific deployment

## Event Management
- **Event Handlers**: Comprehensive event handling for all Discord.js events
- **Middleware Support**: Event-level middleware with tag-based filtering
- **Once Events**: Support for one-time event handlers
- **Error Handling**: Centralized error handling with webhook logging

## Responder System
- **Route-based**: Uses rou3 router for efficient custom ID parsing
- **Parameter Extraction**: Automatic parameter extraction from custom IDs
- **Type Safety**: Strongly typed responder interactions
- **Schema Validation**: Zod-based parameter validation and parsing

## Data Storage Solutions
- **File-based Storage**: Currently uses JSON files for warnings and configuration
- **Environment Configuration**: Zod-validated environment variables
- **Constants Management**: Centralized constants file for colors and configuration

## Authentication and Authorization
- **Permission Checks**: Role and permission-based command access control
- **Middleware Authorization**: Configurable authorization middleware
- **Admin Commands**: Special handling for administrator-only commands

# External Dependencies

## Core Dependencies
- **discord.js**: Primary Discord API library (v14.22.1) for bot functionality
- **@magicyan/discord**: Enhanced Discord.js utilities and builders
- **@discordjs/voice**: Voice channel connection and audio handling
- **typescript**: TypeScript compiler and runtime support
- **tsx**: TypeScript execution engine for development

## Utility Libraries
- **zod**: Schema validation for environment variables and data parsing
- **chalk**: Terminal string styling for enhanced logging
- **rou3**: Lightweight router for responder custom ID handling
- **@reliverse/reglob**: File globbing for module discovery

## Development Tools
- **@types/node**: Node.js type definitions
- **dotenv**: Environment variable loading
- **express**: HTTP server framework (for potential webhook endpoints)
- **axios**: HTTP client for external API requests
- **node-fetch**: Fetch API implementation for Node.js

## Optional Integrations
- **Webhook Logging**: Discord webhook integration for error logging and monitoring
- **Voice Channels**: Automatic voice channel joining and presence management
- **Auto-moderation**: Built-in spam detection and content filtering
- **Server Management**: Channel and role management utilities

The architecture is designed to be highly modular and extensible, with clear separation of concerns and comprehensive TypeScript support throughout.

# Recent Changes

✅ **BOT MODERNIZATION COMPLETE** (September 25, 2025):
- **DEPRECATED API FIX**: Replaced all deprecated `ephemeral: true` usage with proper Discord.js v14 patterns
- **TECHNICAL**: `flags: 64` for direct replies, `ephemeral: true` for deferred replies
- **MONITORING**: Added `--trace-warnings` to detect future deprecated features automatically
- **COMMANDS CONSOLIDATED**: Merged `/emoji-manager` and `/mod-manager` into unified `/config-manager`
- **FUNCTIONALITY**: Single command now handles all emoji and text customization needs
- **PERFORMANCE**: Reduced from 25 to 23 total registered commands

✅ **MODERNIZED PANEL SYSTEM WITH DROPDOWN INTERFACE** (September 23):
- **NEW**: Comando /painel principal simplificado com dropdown substituindo múltiplos botões
- **NEW**: Interface limpa e organizada similar aos bots modernos de 2025
- **NEW**: Sistema de responders otimizado para navegação fluida entre seções

✅ **ADVANCED FEATURES PRESERVED**:
- **MODERATION**: Complete ban/kick/timeout system with role hierarchy checks
- **AUTO-SYSTEMS**: Welcome messages, auto-roles, anti-spam protection
- **VOICE**: Auto-join functionality and voice channel management
- **UTILITIES**: Announcement creation, server management, custom embeds

✅ **Previous Bot Features Maintained**:
- Complete moderation system with ban, kick, timeout capabilities
- Welcome message and auto-role systems fully preserved
- Moderation logging and automod system maintained
- HTTP health check server running on port 5000
- Real-time command registration and error handling
- Comprehensive logging and monitoring

# Production Status
🚀 **READY FOR RENDER DEPLOYMENT** - Bot fully modernized to 2025 standards and production-ready

# Build Information
- **TypeScript Build:** Successfully compiles to ES modules
- **Runtime:** Node.js 22.17.0 with Discord.js 14.22.1
- **Scripts:** `render-build` and `render-start` configured for Render
- **Health Check:** HTTP server responds on port 5000
- **Environment:** All secrets configured and validated

# Notes

- GitHub integration was dismissed by user preference - continue without external repository integration
- Bot now fully automated - users can configure everything through Discord buttons without manual intervention