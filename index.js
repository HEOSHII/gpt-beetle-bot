import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.API_KEY_BOT, {
	polling: true,
});

const openai = new OpenAI({
	organization: process.env.OPENAI_API_ORGANIZATION,
	apiKey: process.env.OPENAI_API_KEY,
});

const getChatAnswer = async ({ content, language = 'en' }) => {
	const response = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo-16k',
		messages: [
			{
				role: 'system',
				content: `Speak in ${language} language`,
			},
			{
				role: 'user',
				content,
			},
		],
	});

	return response.choices[0].message.content;
};

console.log('Bot has been started...');

bot.on('polling_error', err => console.log(err?.data?.error?.message));

bot.on('text', async msg => {
	try {
		bot.sendChatAction(msg.chat.id, 'typing');

		const chatAnswer = await getChatAnswer({
			content: msg.text === '/start' ? `Hello, my name is ${msg.from.first_name}!` : msg.text,
			language: msg.from.language_code,
		});

		await bot.sendMessage(msg.chat.id, chatAnswer, {
			reply_to_message_id: msg.message_id,
		});
	} catch (error) {
		await bot.sendMessage(msg.chat.id, `Sorry, something went wrong! Please, try later.`, {
			reply_to_message_id: msg.message_id,
		});
		console.log(error);
	}
});
