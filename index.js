const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require("discord.js");

const {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus
} = require("@discordjs/voice");


// ==========================
// TOKEN
// ==========================

const TOKEN = process.env.TOKEN;


// IDs

const CLIENT_ID = "1530599168169611456";

const GUILD_ID = "1473729970437357748";

const VOICE_CHANNEL_ID = "1473782078251470980";

const DONO_ID = "825893742854406164";


// Sistema de dado

let dadoForcado = null;



// Cliente

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildVoiceStates,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});



// Entrar na call

function entrarCall(){

    const guild = client.guilds.cache.get(GUILD_ID);

    if(!guild) return;


    const conectado = getVoiceConnection(GUILD_ID);

    if(conectado) return;


    joinVoiceChannel({

        channelId: VOICE_CHANNEL_ID,

        guildId: GUILD_ID,

        adapterCreator: guild.voiceAdapterCreator,

        selfMute:false,

        selfDeaf:false

    });


    console.log("🎧 Entrei na call");

}



// Bot online

client.once("ready", async ()=>{


    console.log(`✅ ${client.user.tag} online`);



    const comandos = [


        new SlashCommandBuilder()

        .setName("entrar")

        .setDescription("Entra na call"),



        new SlashCommandBuilder()

        .setName("sair")

        .setDescription("Sai da call"),



        new SlashCommandBuilder()

        .setName("dado")

        .setDescription("Rola um dado")

        .addIntegerOption(option =>

            option

            .setName("lados")

            .setDescription("Quantidade de lados do dado")

            .setRequired(false)

        )


    ].map(c=>c.toJSON());



    const rest = new REST({

        version:"10"

    }).setToken(TOKEN);



    await rest.put(

        Routes.applicationGuildCommands(

            CLIENT_ID,

            GUILD_ID

        ),

        {

            body:comandos

        }

    );



    console.log("✅ Comandos prontos");


});





// Comandos slash

client.on("interactionCreate", async interaction=>{


    if(!interaction.isChatInputCommand())

        return;



    if(interaction.commandName === "entrar"){


        entrarCall();


        return interaction.reply("🎧 Entrei na call");


    }



    if(interaction.commandName === "sair"){


        const con = getVoiceConnection(GUILD_ID);



        if(con){

            con.destroy();

        }


        return interaction.reply("👋 Sai da call");


    }





    // DADO NORMAL

    if(interaction.commandName === "dado"){


        const lados = interaction.options.getInteger("lados") || 6;


        let resultado;



        if(dadoForcado !== null){


            resultado = dadoForcado;


            dadoForcado = null;


        }else{


            resultado = Math.floor(

                Math.random() * lados

            ) + 1;


        }



        return interaction.reply(

            `🎲 Você rolou um d${lados} e caiu **${resultado}**!`

        );


    }


});





// COMANDO SECRETO DO DONO

client.on("messageCreate", message => {


    if(message.author.bot) return;


    if(message.author.id !== DONO_ID) return;



    if(message.content.startsWith("!forcar")){


        const numero = Number(

            message.content.split(" ")[1]

        );



        if(!isNaN(numero)){


            dadoForcado = numero;


            console.log(

                `🎲 Dado forçado para ${numero}`

            );


            message.delete().catch(()=>{});


        }


    }


});





// Quando alguém entra na call

client.on("voiceStateUpdate",(oldState,newState)=>{


    if(

        newState.channelId === VOICE_CHANNEL_ID &&

        !oldState.channelId

    ){

        entrarCall();

    }



    if(

        oldState.member &&

        oldState.member.id === client.user.id

    ){


        console.log(

            "⚠️ Fui removido da call"

        );



        setTimeout(()=>{


            entrarCall();



        },1000);



        const canalTexto =

        oldState.guild.channels.cache.find(

            c => c.isTextBased()

        );



        if(canalTexto){


            canalTexto.send(

                "hoje nn troxa 😎"

            ).catch(()=>{});


        }


    }


});





// Reconexão eterna

setInterval(()=>{


    const connection =

    getVoiceConnection(GUILD_ID);



    if(!connection){


        entrarCall();


    }


    else if(

        connection.state.status ===

        VoiceConnectionStatus.Disconnected

    ){


        entrarCall();


    }


},5000);





// Login

client.login(TOKEN);