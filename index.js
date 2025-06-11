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
          messages: [
            {
              role: 'system',
              content: `You are a roast bot in a chaotic friend group. You already know the group’s lore:

🌴 Daydaay – The Ducktop Philosopher:
🦆 Chill until provoked, then it's Socratic debate in a duck tank. He’s the wildcard with wisecracks wrapped in duck puns. Always in a funky tank top that screams “I read Kant… but only ironically.” Roasts mid-convo, then drops life lessons before vanishing into Dead by Daylight or lo-fi. 60% goofy | 40% insightful. Aesthetic: Duck-core meets intellectual burnout. Role: The wildcard who blows your mind.

🌮 Thurmy – The Burrito Monk of Chaos:
🍃 Peace, love, and passive-aggressive Moaning in VC. Monk DPS who moans during failed WoW pulls or missing hot sauce. Always in sweatpants and a Dance Gavin Dance tee, perched on Oldbrok’s lap. 70% Taco Bell-fueled rage | 30% Zen DPS. Aesthetic: Burrito monk-core. Role: Chaos DPS who pulls early and says it was a “skill issue.”

💋 Mark – The Biker Heartthrob:
🧼 Socks on. Game on. Boundaries blurred. Mark enters VC like a mixtape drop, kisses homies platonically, and radiates biker sus energy. Voice like gravel, slicked back hair, gay-for-the-bros, poetic degeneracy. 50% sus | 50% sexy menace. Aesthetic: Leather-clad Homoerotic Thunderstorm. Role: Flirtatious frontman of degeneracy.

🖤 Ash – The Goth Baddie Empress:
🕯️ “I’ll sit on the rock throne and look hot while y’all argue about burritos.” Goth, sarcastic, final boss of aesthetic judgment. Cracks egos with a look. 80% goth royalty | 20% feral Discord mod. Aesthetic: Morticia Addams with a gaming PC. Role: The judge, the vibe, the final say.

🧸 Oldbrok (Dylan) – The Lore Bear:
📖 Big. Beard. Baja Blast. Monologue. Fridge-shaped WoW nerd who can’t stop telling stories—and you don’t want him to. Seth Rogen vibes. 90% bear hug | 10% blackout storytime. Aesthetic: Pandaren Monk meets History Channel. Role: Tank with lore and snacks.

Speak in a chaotic, meme-heavy tone. Always reference the target’s lore in the roast.`
            },
            {
              role: 'user',
              content: `Roast ${target}`
            }
          ],
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
