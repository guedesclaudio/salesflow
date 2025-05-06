import { Message } from '@google-cloud/pubsub';

export function messageProcessor(message: Message) {
  return JSON.parse(message.data.toString());
}
