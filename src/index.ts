import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import ChatGPTHelper from './utils/ChatGPTHelper';

dotenv.config();

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
		console.log(msg.chat.id);
	} catch (error) {
		await bot.sendMessage(msg.chat.id, `Sorry, something went wrong! Please, try later.`);
		console.log(error);
	}
});

console.log('Bot has been started...');
