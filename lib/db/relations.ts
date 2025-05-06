import { relations } from "drizzle-orm";
import {
  chat,
  document,
  message,
  messageDeprecated,
  models,
  providers,
  suggestion,
  user,
  userProviderConfig,
  vote,
  voteDeprecated,
} from "./schema";

// User relations
export const userRelations = relations(user, ({ many }) => ({
  chats: many(chat),
  documents: many(document),
  suggestions: many(suggestion),
  userProviderConfigs: many(userProviderConfig),
}));

// Chat relations
export const chatRelations = relations(chat, ({ one, many }) => ({
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  messages: many(message),
  messagesDeprecated: many(messageDeprecated),
  votes: many(vote),
  votesDeprecated: many(voteDeprecated),
}));

// Message relations
export const messageRelations = relations(message, ({ one, many }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
  votes: many(vote),
}));

// MessageDeprecated relations
export const messageDeprecatedRelations = relations(
  messageDeprecated,
  ({ one, many }) => ({
    chat: one(chat, {
      fields: [messageDeprecated.chatId],
      references: [chat.id],
    }),
    votes: many(voteDeprecated),
  })
);

// Vote relations
export const voteRelations = relations(vote, ({ one }) => ({
  chat: one(chat, {
    fields: [vote.chatId],
    references: [chat.id],
  }),
  message: one(message, {
    fields: [vote.messageId],
    references: [message.id],
  }),
}));

// VoteDeprecated relations
export const voteDeprecatedRelations = relations(voteDeprecated, ({ one }) => ({
  chat: one(chat, {
    fields: [voteDeprecated.chatId],
    references: [chat.id],
  }),
  message: one(messageDeprecated, {
    fields: [voteDeprecated.messageId],
    references: [messageDeprecated.id],
  }),
}));

// Document relations
export const documentRelations = relations(document, ({ one, many }) => ({
  user: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
  suggestions: many(suggestion),
}));

// Suggestion relations
export const suggestionRelations = relations(suggestion, ({ one }) => ({
  user: one(user, {
    fields: [suggestion.userId],
    references: [user.id],
  }),
  document: one(document, {
    fields: [suggestion.documentId, suggestion.documentCreatedAt],
    references: [document.id, document.createdAt],
  }),
}));

// Provider relations
export const providerRelations = relations(providers, ({ many }) => ({
  models: many(models),
  userProviderConfigs: many(userProviderConfig, {
    relationName: "providerConfigs",
  }),
}));

// Model relations
export const modelRelations = relations(models, ({ one }) => ({
  provider: one(providers, {
    fields: [models.providerId],
    references: [providers.id],
  }),
}));

// UserProviderConfig relations
export const userProviderConfigRelations = relations(
  userProviderConfig,
  ({ one }) => ({
    user: one(user, {
      fields: [userProviderConfig.userId],
      references: [user.id],
    }),
    defaultProvider: one(providers, {
      fields: [userProviderConfig.defaultProviderId],
      references: [providers.id],
      relationName: "providerConfigs",
    }),
  })
);
