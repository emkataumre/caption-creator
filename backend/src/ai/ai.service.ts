import { Injectable, Logger } from '@nestjs/common';

interface MockResponses {
  default: string;
  greeting: string;
  help: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly mockResponses: MockResponses = {
    default:
      'I understand you want to create captions. I can help you generate engaging and descriptive captions for your content. Just provide me with some details about what you want to caption, and I will suggest appropriate text that captures the essence of your message. I aim to create natural, flowing text that connects with your audience while maintaining your intended tone and style. Feel free to ask for revisions or provide more specific requirements to help me better meet your needs.',
    greeting:
      "Hello! How can I help you today? I'm here to assist with any questions or tasks you might have.",
    help: "I'm here to assist you. What would you like to know? Feel free to ask any questions, and I'll do my best to help.",
  };

  async generateResponse(message: string): Promise<{ response: string }> {
    let response: string = this.mockResponses.default;

    if (this.isGreeting(message)) {
      response = this.mockResponses.greeting;
    } else if (this.isHelpRequest(message)) {
      response = this.mockResponses.help;
    }

    this.logger.log(`Generated response: ${response}`);
    return { response };
  }

  private isGreeting(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('hello') || lowerMessage.includes('hi');
  }

  private isHelpRequest(message: string): boolean {
    return message.toLowerCase().includes('help');
  }
}
