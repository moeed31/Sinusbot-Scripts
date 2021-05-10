/*
    Author: RLNT
    License: MIT
    Repository: https://github.com/RLNT/sinus-automated-servergroups
    Resource-Page: https://forum.sinusbot.com/resources/automated-servergroups.419/
    Discord: https://discord.com/invite/Q3qxws6
*/
registerPlugin(
    {
        name: 'Automated Servergroups',
        version: '2.2.1',
        description: 'With this script, the bot will automatically assign or remove servergroups on specific events.',
        author: 'RLNT',
        backends: ['ts3'],
        vars: [
            {
                name: 'required',
                title: 'All fields that are marked with (*) are required, all others are optional and have a default value.'
            },
            {
                name: 'spacer0',
                title: ''
            },
            {
                name: 'header0',
                title: '->>> Group Adding Events <<<-'
            },
            {
                name: 'groupsAdd',
                title: 'V - click to add a new event group',
                type: 'array',
                vars: [
                    {
                        name: 'trigger',
                        title: 'Trigger > Do you want to add servergroups if other groups are being added or removed? (*)',
                        type: 'select',
                        indent: 1,
                        options: ['on adding', 'on removal']
                    },
                    {
                        name: 'triggerGroups',
                        title: 'Trigger-Groups > Define a list of group IDs that trigger the event! (*)',
                        type: 'strings',
                        indent: 1
                    },
                    {
                        name: 'triggerCondition',
                        title: 'Trigger-Condition > Which condition do you want for the event? This option is ignored if you only defined a single trigger group.',
                        type: 'select',
                        indent: 1,
                        options: ['all trigger groups have to be added/removed', 'at least one trigger group has to be added/removed']
                    },
                    {
                        name: 'triggerBot',
                        title: 'Trigger-Bot > Do you want the event to be triggered even if the bot assigned the trigger group(s)?',
                        type: 'select',
                        indent: 1,
                        options: ['Yes', 'No']
                    },
                    {
                        name: 'advancedConditions',
                        title: 'Advanced-Conditions > Do you want advanced conditions for this event group?',
                        type: 'select',
                        indent: 1,
                        options: ['Yes', 'No']
                    },
                    {
                        name: 'blacklistClients',
                        title: 'Blacklisted-Clients > Define a list of client UIDs that should be blacklisted from this event group!',
                        type: 'strings',
                        indent: 2,
                        conditions: [
                            {
                                field: 'advancedConditions',
                                value: 0
                            }
                        ]
                    },
                    {
                        name: 'blacklistGroups',
                        title: 'Blacklisted-Groups > Define a list of group IDs that should be blacklisted from this event group!',
                        type: 'strings',
                        indent: 2,
                        conditions: [
                            {
                                field: 'advancedConditions',
                                value: 0
                            }
                        ]
                    },
                    {
                        name: 'groups',
                        title: 'Groups > Define a list of group IDs that should be added on the event! (*)',
                        type: 'strings',
                        indent: 1
                    }
                ]
            },
            {
                name: 'spacer1',
                title: ''
            },
            {
                name: 'header1',
                title: '->>> Group Removing Events <<<-'
            },
            {
                name: 'groupsRemove',
                title: 'V - click to add a new event group',
                type: 'array',
                vars: [
                    {
                        name: 'trigger',
                        title: 'Trigger > Do you want to remove servergroups if other groups are being added or removed? (*)',
                        type: 'select',
                        indent: 1,
                        options: ['on adding', 'on removal']
                    },
                    {
                        name: 'triggerGroups',
                        title: 'Trigger-Groups > Define a list of group IDs that trigger the event! (*)',
                        type: 'strings',
                        indent: 1
                    },
                    {
                        name: 'triggerCondition',
                        title: 'Trigger-Condition > Which condition do you want for the event? This option is ignored if you only defined a single trigger group.',
                        type: 'select',
                        indent: 1,
                        options: ['all trigger groups have to be added/removed', 'at least one trigger group has to be added/removed']
                    },
                    {
                        name: 'triggerBot',
                        title: 'Trigger-Bot > Do you want the event to be triggered even if the bot removed the trigger group(s)?',
                        type: 'select',
                        indent: 1,
                        options: ['Yes', 'No']
                    },
                    {
                        name: 'advancedConditions',
                        title: 'Advanced-Conditions > Do you want advanced conditions for this event group?',
                        type: 'select',
                        indent: 1,
                        options: ['Yes', 'No']
                    },
                    {
                        name: 'blacklistClients',
                        title: 'Blacklisted-Clients > Define a list of client UIDs that should be blacklisted from this event group!',
                        type: 'strings',
                        indent: 2,
                        conditions: [
                            {
                                field: 'advancedConditions',
                                value: 0
                            }
                        ]
                    },
                    {
                        name: 'blacklistGroups',
                        title: 'Blacklisted-Groups > Define a list of group IDs that should be blacklisted from this event group!',
                        type: 'strings',
                        indent: 2,
                        conditions: [
                            {
                                field: 'advancedConditions',
                                value: 0
                            }
                        ]
                    },
                    {
                        name: 'groups',
                        title: 'Groups > Define a list of group IDs that should be removed on the event! (*)',
                        type: 'strings',
                        indent: 1
                    }
                ]
            },
            {
                name: 'spacer2',
                title: ''
            },
            {
                name: 'header2',
                title: '->>> Dev Options <<<-'
            },
            {
                name: 'developer',
                title: "Don't change any of the following values if you have not been told to! This section is to identify problems faster and will drain performance."
            },
            {
                name: 'devEnabled',
                title: 'Do you want to enable the developer mode?',
                type: 'select',
                options: ['Yes', 'No']
            }
        ]
    },
    (_, scriptConfig) => {
        // DEPENDENCIES
        const engine = require('engine');
        const backend = require('backend');
        const event = require('event');

        // CONFIG OPTIONS
        let config = {
            groupsAdd: scriptConfig.groupsAdd || [],
            groupsRemove: scriptConfig.groupsRemove || [],
            dev: scriptConfig.devEnabled == 0 || false
        };

        // FUNCTIONS
        /**
         * Send a message to the SinusBot instance log
         * @param {String} message > the message to send
         * @returns {void} > nothing
         */
        function log(message) {
            engine.log('Automated-Servergroups > ' + message);
        }

        /**
         * Wait for the backend to be online/connected each given amount of time for a given amount of tries
         * @param {Number} attempts > the amount of tries the function should check for the backend to be online/connected
         * @param {Number} wait > the amount of time (in seconds) that should be waited between each try
         * @returns {Promise} > resolve when the backend is online/connected, reject when the backend was not online/connected in time
         */
        function waitForBackend(attempts, wait) {
            return new Promise((success, fail) => {
                let attempt = 1;
                const timer = setInterval(() => {
                    if (backend.isConnected()) {
                        clearInterval(timer);
                        if (config.dev) log('waitForBackend() took ' + attempt + ' attempts with a timer of ' + wait + ' seconds to resolve');
                        success();
                        return;
                    } else if (attempt > attempts) {
                        clearInterval(timer);
                        if (config.dev) log('waitForBackend() failed at ' + attempt + '. attempt with a timer of ' + wait + ' seconds');
                        fail('backend');
                        return;
                    }

                    attempt++;
                }, wait * 1000);
            });
        }

        /**
         * Check all groups from the config if their entries are valid; otherwise drop the whole config
         * @param {Array} groups > the group array to validate
         * @returns {Array} > a list of all valid group objects
         */
        function validateGroups(groups) {
            let validatedGroups = [];
            let problemGroups = [];

            groups.forEach((group, index) => {
                // check if necessary config options are set
                if (!group.trigger) return problemGroups.push(index);
                if (!group.triggerGroups || !group.triggerGroups.length) return problemGroups.push(index);
                if (!group.groups) return problemGroups.push(index);

                // apply defaults
                group.triggerCondition = group.triggerCondition || 0;
                group.triggerBot = group.triggerBot == 0 || false;
                group.advancedConditions = group.advancedConditions == 0 || false;
                group.blacklistClients = group.advancedConditions ? group.blacklistClients || [] : false;
                group.blacklistGroups = group.advancedConditions ? group.blacklistGroups || [] : false;

                // check if group ids point to valid groups on teamspeak
                group.triggerGroups = group.triggerGroups.filter(gid => backend.getServerGroupByID(gid) !== undefined);
                if (!group.triggerGroups.length) return problemGroups.push(index);
                group.groups = group.groups.filter(gid => backend.getServerGroupByID(gid) !== undefined);
                if (!group.groups.length) return problemGroups.push(index);
                if (group.blacklistGroups.length) group.blacklistGroups = group.blacklistGroups.filter(gid => backend.getServerGroupByID(gid) !== undefined);

                // deactivate advanced conditions if non are set
                if (group.advancedConditions && !group.blacklistClients.length && !group.blacklistGroups.length) group.advancedConditions = false;

                // if all error checks passed, mark it as valid
                validatedGroups.push(group);
            });

            // notify the script user that there are invalid groups in the configuration
            if (problemGroups.length)
                log(
                    "There was at least one entry in your configuration which is invalid! This can happen if a required field is empty or if your group IDs don't point to a valid group on your TeamSpeak server! Any invalid entries will be skipped. The entries with the following indexes are invalid: " +
                        problemGroups
                );

            return validatedGroups;
        }

        /**
         * Assign multiple groups at once to a client
         * @param {Object} client > the object of the client the groups should be assigned to
         * @param {Array} groups > the list of servergroups
         * @returns {void} > nothing
         */
        function addToGroups(client, groups) {
            const clientGroups = client.getServerGroups().map(group => group.id());
            groups.forEach(group => {
                if (!clientGroups.includes(group)) client.addToServerGroup(group);
            });
        }

        /**
         * Remove multiple groups at once from a client
         * @param {Object} client > the object of the client the groups should be removed from
         * @param {Array} groups > the list of servergroups
         * @returns {void} > nothing
         */
        function removeFromGroups(client, groups) {
            const clientGroups = client.getServerGroups().map(group => group.id());
            groups.forEach(group => {
                if (clientGroups.includes(group)) client.removeFromServerGroup(group);
            });
        }

        /**
         * Handle the required events for the script
         * Since all events do basically the same, this is done in a function
         * The function checks all set up groups from the config and if the specific condition matches
         * @param {Object} event > the event object to receive information from
         * @param {Number} trigger > the trigger type, 0 = adding, 1 = removing
         * @param {Array} groupsAdd > the list of all servergroups that are added to a client
         * @param {Array} groupsRemove > the list of all servergroups that are removed from a client
         * @returns {void} > nothing
         */
        function handleEvent(event, trigger, groupsAdd, groupsRemove) {
            const client = event.client;
            const invoker = event.invoker;

            // get all server group IDs the client has
            const clientGroups = client.getServerGroups().map(group => group.id());
            // save the id of the servergroup from the event
            const serverGroupID = event.serverGroup.id();

            // iterate through all groups to check if they match the event conditions
            groupsAdd.forEach(group => {
                // skip if the trigger is set to the opposite of the event
                if (group.trigger == trigger) return;
                // check if the the trigger group was assigned by the bot itself
                if (!group.triggerBot && invoker.isSelf()) return;
                // check if the client has at least one relevant servergroup
                if (!group.triggerGroups.includes(serverGroupID)) return;
                // check if the client is blacklisted in any way
                if (group.advancedConditions && group.blacklistClients.includes(client.uid())) return;
                if (group.advancedConditions && group.blacklistGroups.some(blacklistGroup => clientGroups.includes(blacklistGroup))) return;
                // if the condition requires all groups, check if the client matches it
                if (group.triggerCondition == 0 && group.triggerGroups.some(triggerGroup => triggerGroup !== serverGroupID && !clientGroups.includes(triggerGroup))) return;

                // add the groups
                addToGroups(client, group.groups);
            });

            groupsRemove.forEach(group => {
                if (group.trigger == trigger) return;
                if (!group.triggerBot && invoker.isSelf()) return;
                if (!group.triggerGroups.includes(serverGroupID)) return;
                if (group.advancedConditions && group.blacklistClients.includes(client.uid())) return;
                if (group.advancedConditions && group.blacklistGroups.some(blacklistGroup => clientGroups.includes(blacklistGroup))) return;
                if (group.triggerCondition == 0 && group.triggerGroups.some(triggerGroup => triggerGroup !== serverGroupID && clientGroups.includes(triggerGroup))) return;

                removeFromGroups(client, group.groups);
            });
        }

        // LOADING EVENT
        event.on('load', () => {
            // dev mode config dump
            if (config.dev) {
                console.log('Script-Config:', Object.entries(scriptConfig));
                console.log('Validated-Config:', Object.entries(config));
            }

            // error prevention that needs script deactivation
            if ((!config.groupsAdd || !config.groupsAdd.length) && (!config.groupsRemove || !config.groupsRemove.length)) {
                log('There are no event groups set in the config! Deactivating script...');
                return;
            } else {
                // start the script
                waitForBackend(10, 3)
                    .then(() => {
                        log('The script has loaded successfully!');
                        main();
                    })
                    .catch(error => {
                        if (error === 'backend') {
                            log(
                                'The bot was not able to connect to the backend in time! To use this script, the bot needs to be connected to your TeamSpeak server. Make sure it can connect. Deactivating script...'
                            );
                        } else {
                            log('Unknown error occured! Please report this to the script author: https://discord.com/invite/Q3qxws6');
                            console.log(error);
                        }
                    });
            }
        });

        // MAIN FUNCTION
        function main() {
            // VARIABLES
            const groupsAdd = validateGroups(config.groupsAdd);
            const groupsRemove = validateGroups(config.groupsRemove);

            // exit the script if no valid holiday groups were found
            if (!groupsAdd.length && !groupsRemove.length) return log('There are no valid groups set in your script configuration! There might be further output in the log. Deactivating script...');

            // validated groups config dump
            if (config.dev) {
                console.log('groupsAdd:', Object.entries(groupsAdd));
                console.log('groupsRemove:', Object.entries(groupsRemove));
            }

            /**
             * SERVER GROUP ADDED EVENT
             * fired when a servergroup is assigned to a client
             * since two events are required for the whole logic and both do basically the same
             * we handle the whole process in a function
             */
            event.on('serverGroupAdded', event => {
                handleEvent(event, 1, groupsAdd, groupsRemove);
            });

            /**
             * SERVER GROUP REMOVED EVENT
             * fired when a servergroup is removed from a client
             * since two events are required for the whole logic and both do basically the same
             * we handle the whole process in a function
             */
            event.on('serverGroupRemoved', event => {
                handleEvent(event, 0, groupsAdd, groupsRemove);
            });
        }
    }
);
