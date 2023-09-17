import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

type Role = 'system' | 'user' | 'assistant';

type ChatGPTMessage = {
	role: Role;
	content: string;
};

const initialMessages: ChatGPTMessage[] = [
	{
		role: 'system',
		content: 'You a telegram bot named "Beetle"',
	},
];

const openai = new OpenAI({
	organization: process.env.OPENAI_API_ORGANIZATION,
	apiKey: process.env.OPENAI_API_KEY,
});

class ChatGPTHelper {
	private messages: ChatGPTMessage[] = initialMessages;

	private addUserMessage(content: string): void {
		this.messages = [
			...this.messages,
			{
				role: 'user',
				content,
			},
		];
	}

	private addAssistantMessage(content: string): void {
		this.messages = [
			...this.messages,
			{
				role: 'assistant',
				content,
			},
		];
	}

	public resetMessages(): void {
		this.messages = initialMessages;
	}

	public getChatAnswer = async (content = ''): Promise<string> => {
		this.addUserMessage(content);
		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-16k',
			messages: this.messages,
		});
		this.addAssistantMessage(response.choices[0].message.content || '');

		return this.messages.at(-1)?.content || '';
	};
}

export default new ChatGPTHelper();
