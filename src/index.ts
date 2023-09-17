import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import ChatGPTHelper from './utils/ChatGPTHelper';
import fs from 'fs/promises';

dotenv.config();

const adminID = Number(process.env.ADMIN_ID || 0);
const isAdmin = (id: number) => id === adminID;

const bot = new TelegramBot(process.env.API_KEY_BOT || '', {
	polling: true,
});

bot.setMyCommands([{ command: '/reset', description: 'Начать чат заново' }]);

bot.on('polling_error', err => console.log(err.message));

bot.on('text', async msg => {
	try {
		await bot.sendChatAction(msg.chat.id, 'typing');

		let chatMessage = msg.text;

		switch (msg.text) {
			case '/start':
			case '/reset':
				ChatGPTHelper.resetMessages();
				chatMessage = 'Start conversation';
		}

		const chatAnswer = await ChatGPTHelper.getChatAnswer(chatMessage);
		await bot.sendMessage(msg.chat.id, chatAnswer);

		if (!isAdmin(msg.chat.id)) {
			await fs.appendFile(
				'./logs/messages.log',
				`Date: ${new Date()}\nUser: ${msg.from?.first_name} (@${
					msg.from?.username
				})\nMessage: "${chatMessage}";\nAnswer: "${chatAnswer}"\n–––––––––––––––\n`,
			);
		}
	} catch (error) {
		await fs.appendFile(
			'./logs/errors.log',
			`Date: ${new Date()}\nUser: ${msg.from?.first_name} (@${msg.from?.username})\nMessage: "${
				msg.text
			}";\nError: "${error}"\n–––––––––––––––\n`,
		);

		await bot.sendMessage(msg.chat.id, `Sorry, something went wrong! Please, try later.`);
		console.error(error);
	}
});

console.log('Bot has been started...');
