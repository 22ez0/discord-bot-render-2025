import { createCommand } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
// Comando /avatar
createCommand({
    name: "avatar",
    description: "Ver o avatar de um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário para ver o avatar",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    async run(interaction) {
        const targetUser = interaction.options.getUser("usuário") || interaction.user;
        const member = interaction.guild?.members.cache.get(targetUser.id);
        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || "#5865F2")
            .setTitle(`🖼️ **Avatar de ${targetUser.username}**`)
            .setImage(targetUser.displayAvatarURL({ size: 512 }))
            .setDescription(`[🔗 Download PNG](${targetUser.displayAvatarURL({ extension: 'png', size: 1024 })}) | ` +
            `[🔗 Download JPG](${targetUser.displayAvatarURL({ extension: 'jpg', size: 1024 })}) | ` +
            `[🔗 Download WEBP](${targetUser.displayAvatarURL({ extension: 'webp', size: 1024 })})`)
            .setFooter({
            text: `Solicitado por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
});
// Comando /roll
createCommand({
    name: "roll",
    description: "Rolar dados",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "lados",
            description: "Número de lados do dado (padrão: 6)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 2,
            maxValue: 1000
        },
        {
            name: "quantidade",
            description: "Quantidade de dados para rolar (padrão: 1)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            minValue: 1,
            maxValue: 10
        }
    ],
    async run(interaction) {
        const sides = interaction.options.getInteger("lados") || 6;
        const quantity = interaction.options.getInteger("quantidade") || 1;
        const results = [];
        for (let i = 0; i < quantity; i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
        }
        const total = results.reduce((sum, result) => sum + result, 0);
        const average = (total / quantity).toFixed(1);
        const embed = new EmbedBuilder()
            .setColor("#ff6b81")
            .setTitle(`🎲 **Rolagem de Dados**`)
            .setDescription(`**Dados:** ${quantity}d${sides}\n` +
            `**Resultados:** ${results.join(", ")}\n` +
            `**Total:** ${total}\n` +
            (quantity > 1 ? `**Média:** ${average}\n` : "") +
            `\n🎯 **${results.length === 1 ? "Resultado" : "Soma"}:** **${total}**`)
            .setFooter({
            text: `Rolado por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
            .setTimestamp();
        // Adicionar emoji baseado no resultado para dados de 6 lados
        if (sides === 6 && quantity === 1) {
            const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
            embed.setDescription(`${diceEmojis[results[0] - 1]} **Resultado:** ${results[0]}\n\n` +
                `Você rolou um dado de 6 lados!`);
        }
        await interaction.reply({ embeds: [embed] });
    }
});
// Comando /coinflip
createCommand({
    name: "coinflip",
    description: "Jogar uma moeda (cara ou coroa)",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const isHeads = Math.random() < 0.5;
        const result = isHeads ? "Cara" : "Coroa";
        const emoji = isHeads ? "🪙" : "⚡";
        const embed = new EmbedBuilder()
            .setColor(isHeads ? "#ffa502" : "#747d8c")
            .setTitle(`${emoji} **${result}!**`)
            .setDescription(`A moeda foi lançada e... **${result}**!\n\n` +
            `${isHeads ? "🪙 A moeda caiu com a face para cima!" : "⚡ A moeda caiu com a coroa para cima!"}`)
            .setFooter({
            text: `Lançado por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
});
// Comando /8ball
createCommand({
    name: "8ball",
    description: "Faça uma pergunta para a bola 8 mágica",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "pergunta",
            description: "Sua pergunta para a bola mágica",
            type: ApplicationCommandOptionType.String,
            required: true,
            maxLength: 200
        }
    ],
    async run(interaction) {
        const question = interaction.options.getString("pergunta", true);
        const responses = [
            // Respostas positivas
            "✅ Certamente!",
            "✅ Definitivamente sim!",
            "✅ Sim, sem dúvida!",
            "✅ Você pode contar com isso!",
            "✅ Como eu vejo, sim!",
            "✅ Muito provável!",
            "✅ Perspectivas boas!",
            "✅ Sinais apontam que sim!",
            // Respostas neutras/incertas
            "🔄 Resposta nebulosa, tente novamente!",
            "🔄 Pergunte novamente mais tarde!",
            "🔄 Melhor não te dizer agora!",
            "🔄 Não é possível prever agora!",
            "🔄 Concentre-se e pergunte novamente!",
            // Respostas negativas
            "❌ Não conte com isso!",
            "❌ Minha resposta é não!",
            "❌ Minhas fontes dizem que não!",
            "❌ Perspectivas não são boas!",
            "❌ Muito duvidoso!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const color = randomResponse.startsWith("✅") ? "#2ed573" :
            randomResponse.startsWith("❌") ? "#ff4757" : "#ffa502";
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle("🎱 **Bola 8 Mágica**")
            .addFields({
            name: "❓ **Sua pergunta:**",
            value: question,
            inline: false
        }, {
            name: "🔮 **Resposta da bola mágica:**",
            value: randomResponse,
            inline: false
        })
            .setFooter({
            text: `Perguntado por ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
});
