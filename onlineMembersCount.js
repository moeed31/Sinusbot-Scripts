registerPlugin({
    name: "Online Members Count",
    version: "0.2.2",
    description: "Shows status and count of a specified members in a specified channel",
    author: "DrWarpMan <drwarpman@gmail.com>",
    backends: ["ts3"],
    engine: ">= 1.0",
    autorun: false,
    enableWeb: false,
    hidden: false,
    requiredModules: [],
    vars: [{
            name: "onlineMembersCountList",
            type: "array",
            title: "Configuration:",
            vars: [{
                    name: "channelID",
                    type: "string",
                    title: "Channel ID:",
                    placeholder: "69"
                },
                {
                    name: "groups",
                    type: "strings",
                    title: "Group IDs:"
                },
                {
                    name: "channelNameOn",
                    type: "string",
                    title: "Channel name when online [Placeholder: %count%]:",
                    placeholder: "Administrators online [%online%]"
                },
                {
                    name: "channelNameOff",
                    type: "string",
                    title: "Channel name when offline [Placeholder: %count%]:",
                    placeholder: "No administrators online"
                }, {
                    name: 'awayIsOffline',
                    title: 'Check to count AFK members as offline',
                    type: 'checkbox'
                }, {
                    name: 'description',
                    title: 'Channel description, leave empty to not use this feature [Placeholder: %members% OR %groupID%]:',
                    type: 'multiline'
                }
            ]
        },
        {
            name: "canHideGroups",
            type: "strings",
            title: "List of group IDs allowed to hide:"
        },
        {
            name: "commandToggleHide",
            type: "string",
            title: "Command to make yourself hidden (bot will think, that you are offline):",
            placeholder: "!togglehide",
            default: "!togglehide"
        }, {
            name: "awayChannels",
            title: "Channels (IDs), that if client is in, he is considered as AWAY",
            type: "strings"
        }, {
            name: 'showTranslation',
            title: 'Show translation?',
            type: 'checkbox'
        }, {
            name: "messageHidden",
            type: "string",
            title: "MESSAGE: You are now hidden!",
            default: "You are now hidden!",
            placeholder: "Translate this message here!",
            conditions: [{
                field: 'showTranslation',
                value: 1,
            }]
        }, {
            name: "messageNotHidden",
            type: "string",
            title: "MESSAGE: You are not hidden anymore!",
            default: "You are not hidden anymore!",
            placeholder: "Translate this message here!",
            conditions: [{
                field: 'showTranslation',
                value: 1,
            }]
        }, {
            name: "messageNoRights",
            type: "string",
            title: "(To disable this message, write DISABLED) MESSAGE: You do not have permission to hide yourself!",
            default: "You do not have permission to hide yourself!",
            placeholder: "Translate this message here!",
            conditions: [{
                field: 'showTranslation',
                value: 1,
            }]
        }
    ],
    voiceCommands: []
}, function(_, config, meta) {

    const backend = require("backend");
    const engine = require("engine");
    const store = require("store");
    const event = require("event");

    if (config.onlineMembersCountList === undefined)
        return engine.log("ERROR: No configuration found!");

    let scriptData = {};

    config.onlineMembersCountList.forEach(i => {
        if (!scriptData[i.channelID]) {

            if (i.groups === undefined || i.channelNameOff === undefined || i.channelNameOn === undefined)
                engine.log("WARN: Found undefined entry in configuration!");

            scriptData[i.channelID] = {
                groups: i.groups,
                channelNameOn: i.channelNameOn,
                channelNameOff: i.channelNameOff,
                awayIsOffline: i.awayIsOffline,
                description: i.description
            };
        } else engine.log("WARN: Found duplicate in configuration!");
    });

    setInterval(() => {
        if (backend.isConnected()) {

            Object.keys(scriptData).forEach(i => {
                let data = scriptData[i];
                let channel = backend.getChannelByID(i);

                if (channel) {
                    let clients = getClientsWithGroups(data.groups, data.awayIsOffline);
                    clients = clients.sort(compare);
                    let count = clients.length;

                    if (count >= 1) {
                        channel.setName(data.channelNameOn.replace("%count%", count));
                    } else {
                        channel.setName(data.channelNameOff.replace("%count%", count));
                    }

                    if (data.description) {
                        if (data.description.length > 0) {
                            let newDescription = data.description;

                            // ALL MEMBERS LIST
                            let members = "";
                            clients.forEach(client => {
                                members += "[URL=client://0/" + client.uid() + "]" + client.nick() + "[/URL]\n";
                            });

                            // MEMBERS BY GROUP-ID LIST
                            let membersSeparate = data.description.match(/%\d+%/g); // Get all placeholders for groups

                            if (membersSeparate) {
                                membersSeparate.forEach(j => {
                                    let groupID = j.slice(1, -1);
                                    if (data.groups.includes(groupID)) {
                                        let groupMembers = "";

                                        clients.forEach(client => {
                                            if (hasServerGroupWithID(client, groupID))
                                                groupMembers += "[URL=client://0/" + client.uid() + "]" + client.nick() + "[/URL]\n";
                                        });

                                        newDescription = newDescription.replace(j, groupMembers);
                                    }
                                });
                            }

                            channel.setDescription(newDescription.replace("%members%", members));
                        }
                    }

                }
            });
        }
    }, 30 * 1000);

    event.on("chat", chatInfo => {
        if (chatInfo.client.isSelf())
            return;

        let message = chatInfo.text.toLowerCase();
        let client = chatInfo.client;
        let clientUID = client.uid();

        if (message.startsWith(config.commandToggleHide.toLowerCase())) {
            let data = store.get(clientUID);
            let allow = isMemberAllowedToHide(client);

            if (allow) {
                if (!data) {
                    store.set(clientUID, { hidden: true });
                    client.chat(config.messageHidden);
                } else if (data.hidden === false) {
                    store.set(clientUID, { hidden: true });
                    client.chat(config.messageHidden);
                } else if (data.hidden === true) {
                    store.set(clientUID, { hidden: false });
                    client.chat(config.messageNotHidden);
                }
            } else {
                if (config.messageNoRights.toLowerCase() !== "disabled")
                    client.chat(config.messageNoRights);
            }
        }
    });

    /**
     * Get all online clients with specified groups
     *
     * @param   {Array}  groups         
     * @param   {Boolean}  awayIsOffline  Whether we count away as offline or not
     *
     * @return  {Array}                 Array of online clients
     */
    function getClientsWithGroups(groups, awayIsOffline) {
        let clients = [];

        backend.getClients().forEach(client => {
            let clientGroups = client.getServerGroups().map(g => g.id());
            let clientOffline = false;

            if (awayIsOffline && (client.isAway() || checkArrays(client.getChannels().map(ch => ch.id()), config.awayChannels)))
                clientOffline = true;

            if (isHidden(client))
                clientOffline = true;

            if (checkArrays(clientGroups, groups) && clientOffline === false) {
                clients.push(client);
            }
        });

        return clients;
    }

    /**
     * Whether client is or is not hidden
     * @param   {Client}  client  
     * @return  {Boolean}          
     */
    function isHidden(client) {
        let data = store.get(client.uid());

        if (data !== undefined) {
            if (isMemberAllowedToHide(client))
                return data.hidden;
        }
    }

    /**
     * Checks whether client has specified group or not
     * @return {Boolean}
     */
    function hasServerGroupWithID(client, id) {
        return client.getServerGroups().some(function(group) {
            return group.id() == id;
        });
    }

    /**
     * Checking whether the client has / doesn't have rights to hide
     * @param  {Client} client The client, that is being checked
     * @return {boolean}        Whether he has / doesn't have
     */
    function isMemberAllowedToHide(client) {
        if (config.canHideGroups === undefined)
            return false;

        let clientGroups = client.getServerGroups().map(g => g.id());

        return checkArrays(clientGroups, config.canHideGroups);
    }

    /**
     * Checking if two arrays have at least one same item
     * @param  {array} arr1 First array
     * @param  {array} arr2 Second array
     * @return {boolean}      Whether they have / don't have at least one same item
     */
    function checkArrays(arr1, arr2) {
        if (arr1 === arr2)
            return true;

        if (arr1 === undefined || arr2 === undefined)
            return false;

        return arr2.some(item => arr1.includes(item));
    }

    function compare(a, b) {
        if (a.nick() < b.nick()) {
            return -1;
        }
        if (a.nick() > b.nick()) {
            return 1;
        }
        return 0;
    }

    // SCRIPT LOADED SUCCCESFULLY
    engine.log("\n[Script] \"" + meta.name + "\" [Version] \"" + meta.version + "\" [Author] \"" + meta.author + "\"");
});