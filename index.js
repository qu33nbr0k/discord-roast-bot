import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Slash command setup
const commands = [
  new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Roast someone or something')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('Who or what to roast')
        .setRequired(true)),
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('📡 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Slash command registration failed:', err);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Roast command logic
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'roast') {
    const target = interaction.options.getString('target');
    await interaction.deferReply();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: `Roast this person meme-style: ${target}` }],
          temperature: 0.9
        })
      });

      const data = await response.json();
      const roast = data.choices?.[0]?.message?.content || '🔥 Roast failed.';
      await interaction.editReply(roast);

    } catch (err) {
      console.error('🔥 Error with Groq API:', err);
      await interaction.editReply('❌ Could not fetch roast from Groq.');
    }
  }
});

client.login(process.env.BOT_TOKEN);
