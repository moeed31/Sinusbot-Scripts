registerPlugin({
    name: 'Digital Clock',
    version: '1.9',
    description: '4-line Digital Clock',
    author: 'Patryk Lesiecki <lostigeros@outlook.com>, JS-Port by Michael Friese <michael@sinusbot.com> | Reworked by Lukas Westholt <lukaswestholt@yahoo.de>',
    vars: [{
        name: 'type',
        title: 'choose type',
        type: 'select',
        options: [
            'time & date',
            'only date',
            'only time'
            ],
    },
        {
        name: 'id1',
        title: 'Channel for Line #1',
        type: 'channel'
        },
        {
            name: 'id2',
            title: 'Channel for Line #2',
            type: 'channel'
        },
        {
            name: 'id3',
            title: 'Channel for Line #3',
            type: 'channel'
        },
        {
            name: 'id4',
            title: 'Channel for Line #4',
            type: 'channel'
        },
        {
            name: 'id5',
            title: 'Channel for day, month and year',
            type: 'channel'
        },
        {
            name: 'dateformat',
            title: 'Date format',
            type: 'select',
            options: [
                'DD.MM.YYYY',
                'MM.DD.YYYY',
                'YYYY.MM.DD',
                'YYYY.DD.MM'
            ]
        },
        {
            name: 'interval',
            title: 'Update interval',
            type: 'number',
            placeholder: '1'
        },
        {
            name: 'style',
            title: 'Font style',
            type: 'select',
            options: [
                'Style 1 (LosTigeros)',
                'Style 2 (kapabac)',
                'Style 3 (kapabac)',
                'Style 4 (kapabac)',
                'Style 5 (kapabac)',
                'Style 6 (kapabac)',
                'Style 7 (kapabac)',
                'Style 8 (kapabac)',
                'Style 9 (kapabac)',
                'Style 10 (kapabac)',
                'Style 11 (kapabac)',
                'Style 12 (kapabac)',
                'Style 13 (kapabac)',
                'Style 14 (kapabac)',
                'Style 15 (kapabac)'
            ]
        },
        {
            name: 'spaces',
            title: 'Spacing',
            type: 'select',
            options: [
                'Style 1 (LosTigeros)',
                'Style 2 (Niggolo)',
                'Style 3 (kapabac)',
                'Style 4 (pix0wl)',
                'Style 5 (pix0wl)',
                'Style 6 (pix0wl)',
                'Style 7 (LosTigeros)',
                'Style 8 (LosTigeros)',
                'Style 9 (LosTigeros)',
                'Style 10 (LosTigeros)',
                'Style 11 (LosTigeros)'
            ]
        },
        {
            name: 'format',
            title: 'Format',
            type: 'select',
            options: [
                '24h',
                '12h'
            ]
        },
        {
            name: 'digits',
            title: 'Digits',
            type: 'select',
            options: [
                '1-digit (0:00)',
                '2-digits (00:00)'
            ]
        },
        {
            name: 'timezone',
            title: 'Time zone',
            type: 'select',
            options: [
                'UTC-12:00',
                'UTC-11:00',
                'UTC-10:00',
                'UTC-09:30',
                'UTC-09:00',
                'UTC-08:00',
                'UTC-07:00',
                'UTC-06:00',
                'UTC-05:00',
                'UTC-04:30',
                'UTC-04:00',
                'UTC-03:30',
                'UTC-03:00',
                'UTC-02:00',
                'UTC-01:00',
                'UTC±00:00',
                'UTC+01:00',
                'UTC+02:00',
                'UTC+03:00',
                'UTC+03:30',
                'UTC+04:00',
                'UTC+04:30',
                'UTC+05:00',
                'UTC+05:30',
                'UTC+05:45',
                'UTC+06:00',
                'UTC+06:30',
                'UTC+07:00',
                'UTC+08:00',
                'UTC+08:30',
                'UTC+08:45',
                'UTC+09:00',
                'UTC+09:30',
                'UTC+10:00',
                'UTC+10:30',
                'UTC+11:00',
                'UTC+12:00',
                'UTC+12:45',
                'UTC+13:00',
                'UTC+14:00'
            ]
        }]
}, function (_, config) {
    const engine = require('engine');
    const backend = require('backend');
    const event = require('event');

    if (!config || !config.id1 || !config.id2 || !config.id3 || !config.id4) {
        engine.log("Digital Clock v1.9 is not configured yet. Disabling it...");
        return;
    }

    let initialized = false;
    let data;
    let tz;
    let font;
    let interval;

    event.on("load", () => {
        if (backend.isConnected()) return initialize();
        event.on("connect", initialize);
        event.on("disconnect", finish);
    });

    function finish() {
        if (interval) clearInterval(interval);
        interval = false;
        initialized = false;
    }

    function initialize() {
        if (initialized) return;
        initialized = true;

        let show_clock = config.type === "0" || config.type === "2" || false;
        let show_date = config.type === "0" || config.type === "1" || false;
        if (show_clock && backend.getChannelByID(config.id1) === undefined) {
            engine.log("Channel for Line #1 doesn't exists! Disabling Digital Clock v1.9...");
            return;
        } else if (show_clock && backend.getChannelByID(config.id2) === undefined) {
            engine.log("Channel for Line #2 doesn't exists! Disabling Digital Clock v1.9...");
            return;
        } else if (show_clock && backend.getChannelByID(config.id3) === undefined) {
            engine.log("Channel for Line #3 doesn't exists! Disabling Digital Clock v1.9...");
            return;
        } else if (show_clock && backend.getChannelByID(config.id4) === undefined) {
            engine.log("Channel for Line #4 doesn't exists! Disabling Digital Clock v1.9...");
            return;
        } else if (show_date && backend.getChannelByID(config.id5) === undefined) {
            engine.log("Channel for day, month and year doesn't exists! Disabling Digital Clock v1.9...");
            return;
        }
        if (config.style === "0") {
            font = [
                ['█▀▀▀█─', '─▄█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '───▄█──', '█▀▀▀▀─', '█▀▀▀█─', '█▀▀▀█─', '▄▀▀▀▄─', '█▀▀▀█─', '────'],
                ['█───█─', '▀─█─', '───▄▀─', '──▄▄█─', '─▄▀─█──', '█▄▄▄──', '█─────', '────█─', '▀▄▄▄▀─', '█▄▄▄█─', '─▀──'],
                ['█───█─', '──█─', '─▄▀───', '────█─', '█▄▄▄█▄─', '────█─', '█▀▀▀█─', '────█─', '█───█─', '────█─', '────'],
                ['█▄▄▄█─', '──█─', '█▄▄▄▄─', '▀▄▄▄▀─', '────█──', '▀▄▄▄▀─', '█▄▄▄█─', '────█─', '▀▄▄▄▀─', '█▄▄▄█─', '─▀──']
            ];
        } else if (config.style === "1") {
            font = [
                ['▄▀▀▀▄─', '─▄█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '───▄█──', '█▀▀▀▀─', '▄▀▀▀▄─', '▀▀▀▀█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '────'],
                ['█───█─', '▀─█─', '───▄▀─', '──▄▄▀─', '─▄▀─█──', '█▄▄▄──', '█▄▄▄──', '────█─', '▀▄▄▄▀─', '█───█─', '─▀──'],
                ['█───█─', '──█─', '─▄▀───', '────█─', '█▄▄▄█▄─', '────█─', '█───█─', '──▄▀──', '█───█─', '─▀▀▀█─', '────'],
                ['▀▄▄▄▀─', '──█─', '█▄▄▄▄─', '▀▄▄▄▀─', '────█──', '▀▄▄▄▀─', '▀▄▄▄▀─', '──█───', '▀▄▄▄▀─', '▀▄▄▄▀─', '─▀──']
            ];
        } else if (config.style === "2") {
            font = [
                ['▄▀▀█▄─', '─▄█─', '▄▀▀█▄─', '▄▀▀█▄─', '───▄█──', '██▀▀▀─', '▄█▀▀▄─', '▀▀▀██─', '▄▀▀█▄─', '▄▀▀█▄─', '─▄──'],
                ['█──██─', '▀██─', '───█▀─', '──▄█▀─', '─▄▀██──', '██▄▄──', '██▄▄──', '───██─', '▀▄▄█▀─', '█──██─', '─▀──'],
                ['█──██─', '─██─', '─▄▀───', '───██─', '█▄▄██▄─', '───██─', '██──█─', '──▄█──', '█──██─', '─▀▀██─', '─▄──'],
                ['▀▄▄█▀─', '─██─', '██▄▄▄─', '▀▄▄█▀─', '───██──', '▀▄▄█▀─', '▀█▄▄▀─', '──██──', '▀▄▄█▀─', '▀▄▄█▀─', '─▀──']
            ];
        } else if (config.style === "3") {
            font = [
                ['█▀▀▀█─', '─█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '─▄──'],
                ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█──██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█──██─', '─▀──'],
                ['█──██─', '██─', '██────', '───██─', '▀▀▀██─', '───██─', '██──█─', '───██─', '█──██─', '▀▀▀██─', '─▄──'],
                ['█▄▄██─', '██─', '██▄▄▄─', '▄▄▄██─', '───██─', '▄▄▄██─', '██▄▄█─', '───██─', '█▄▄██─', '▄▄▄██─', '─▀──']
            ];
        } else if (config.style === "4") {
            font = [
                ['█▀▀▀█─', '▀█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '────'],
                ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█───█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█───█─', '─▀──'],
                ['█───█─', '─█─', '█─────', '────█─', '▀▀▀▀█─', '────█─', '█───█─', '────█─', '█───█─', '▀▀▀▀█─', '────'],
                ['█▄▄▄█─', '─█─', '█▄▄▄▄─', '▄▄▄▄█─', '────█─', '▄▄▄▄█─', '█▄▄▄█─', '────█─', '█▄▄▄█─', '▄▄▄▄█─', '─▀──']
            ];
        } else if (config.style === "5") {
            font = [
                ['█▀▀██─', '██─', '▀▀▀██─', '▀▀▀██─', '█──██─', '██▀▀▀─', '██▀▀▀─', '▀▀▀██─', '█▀▀██─', '█▀▀██─', '─▄──'],
                ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█──██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█──██─', '─▀──'],
                ['█──██─', '██─', '██────', '───██─', '▀▀▀██─', '───██─', '██──█─', '───██─', '█──██─', '▀▀▀██─', '─▄──'],
                ['█▄▄██─', '██─', '██▄▄▄─', '▄▄▄██─', '───██─', '▄▄▄██─', '██▄▄█─', '───██─', '█▄▄██─', '▄▄▄██─', '─▀──']
            ];
        } else if (config.style === "6") {
            font = [
                ['▄▀▀▀█─', '▄█─', '─▀▀▀█─', '─▀▀▀█─', '▄───█─', '▄▀▀▀▀─', '▄▀▀▀▀─', '▄▀▀▀█─', '▄▀▀▀█─', '▄▀▀▀█─', '────'],
                ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█───█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█───█─', '─▀──'],
                ['█───█─', '─█─', '█─────', '────█─', '▀▀▀▀█─', '────█─', '█───█─', '────█─', '█───█─', '▀▀▀▀█─', '────'],
                ['█▄▄▄▀─', '─█─', '█▄▄▄──', '▄▄▄▄▀─', '────█─', '▄▄▄▄▀─', '█▄▄▄▀─', '────█─', '█▄▄▄▀─', '▄▄▄▄▀─', '─▀──']
            ];
        } else if (config.style === "7") {
            font = [
                ['▄▀▀██─', '▄█─', '─▀▀██─', '─▀▀██─', '▄──██─', '▄█▀▀▀─', '▄█▀▀▀─', '▄▀▀██─', '▄▀▀██─', '▄▀▀██─', '─▄──'],
                ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█──██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█──██─', '─▀──'],
                ['█──██─', '██─', '██────', '───██─', '▀▀▀██─', '───██─', '██──█─', '───██─', '█──██─', '▀▀▀██─', '─▄──'],
                ['█▄▄█▀─', '██─', '██▄▄──', '▄▄▄█▀─', '───██─', '▄▄▄█▀─', '██▄▄▀─', '───██─', '█▄▄█▀─', '▄▄▄█▀─', '─▀──']
            ];
        } else if (config.style === "8") {
            font = [
                ['▄▀▀▀▄─', '─▄█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '───▄█──', '█▀▀▀▀─', '▄▀▀▀▄─', '▀▀▀▀█─', '▄▀▀▀▄─', '▄▀▀▀▄─', '────'],
                ['█───█─', '▀─█─', '───▄▀─', '──▄▄▀─', '─▄▀─█──', '▀▀▀▀▄─', '█▄▄▄──', '────█─', '▀▄▄▄▀─', '▀▄▄▄█─', '─▀──'],
                ['█───█─', '──█─', '─▄▀───', '▄───█─', '▀▀▀▀█▀─', '▄───█─', '█───█─', '──▄▀──', '█───█─', '▄───█─', '─▄──'],
                ['─▀▀▀──', '──▀─', '▀▀▀▀▀─', '─▀▀▀──', '────▀──', '─▀▀▀──', '─▀▀▀──', '──▀───', '─▀▀▀──', '─▀▀▀──', '────']
            ];
        } else if (config.style === "9") {
            font = [
                ['▄▀▀█▄─', '─▄█─', '▄▀▀█▄─', '▄▀▀█▄─', '───▄█──', '██▀▀▀─', '▄█▀▀▄─', '▀▀▀██─', '▄▀▀█▄─', '▄▀▀█▄─', '─▄──'],
                ['█──██─', '▀██─', '───█▀─', '──▄█▀─', '─▄▀██──', '▀▀▀█▄─', '██▄▄──', '───██─', '▀▄▄█▀─', '▀▄▄██─', '─▀──'],
                ['█──██─', '─██─', '─▄█───', '▄──██─', '▀▀▀██▀─', '▄──██─', '██──█─', '──▄█──', '█──██─', '▄──██─', '─▄──'],
                ['─▀▀▀──', '─▀▀─', '▀▀▀▀▀─', '─▀▀▀──', '───▀▀──', '─▀▀▀──', '─▀▀▀──', '──▀▀──', '─▀▀▀──', '─▀▀▀──', '─▀──']
            ];
        } else if (config.style === "10") {
            font = [
                ['█▀▀▀█─', '─█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '─▄──'],
                ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█▄▄██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█▄▄██─', '─▀──'],
                ['█──██─', '██─', '██────', '───██─', '───██─', '───██─', '██──█─', '───██─', '█──██─', '───██─', '─▄──'],
                ['▀▀▀▀▀─', '▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '─▀──']
            ];
        } else if (config.style === "11") {
            font = [
                ['█▀▀▀█─', '▀█─', '▀▀▀▀█─', '▀▀▀▀█─', '█───█─', '█▀▀▀▀─', '█▀▀▀▀─', '▀▀▀▀█─', '█▀▀▀█─', '█▀▀▀█─', '────'],
                ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█▄▄▄█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█▄▄▄█─', '─▀──'],
                ['█───█─', '─█─', '█─────', '────█─', '────█─', '────█─', '█───█─', '────█─', '█───█─', '────█─', '─▄──'],
                ['▀▀▀▀▀─', '─▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '────▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '────▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '────']
            ];
        } else if (config.style === "12") {
            font = [
                ['█▀▀██─', '██─', '▀▀▀██─', '▀▀▀██─', '█──██─', '██▀▀▀─', '██▀▀▀─', '▀▀▀██─', '█▀▀██─', '█▀▀██─', '─▄──'],
                ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█▄▄██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█▄▄██─', '─▀──'],
                ['█──██─', '██─', '██────', '───██─', '───██─', '───██─', '██──█─', '───██─', '█──██─', '───██─', '─▄──'],
                ['▀▀▀▀▀─', '▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '───▀▀─', '▀▀▀▀▀─', '▀▀▀▀▀─', '─▀──']
            ];
        } else if (config.style === "13") {
            font = [
                ['▄▀▀▀█─', '─█─', '─▀▀▀█─', '─▀▀▀█─', '▄───█─', '▄▀▀▀▀─', '▄▀▀▀▀─', '▄▀▀▀█─', '▄▀▀▀█─', '▄▀▀▀█─', '────'],
                ['█───█─', '─█─', '▄▄▄▄█─', '─▄▄▄█─', '█▄▄▄█─', '█▄▄▄▄─', '█▄▄▄▄─', '────█─', '█▄▄▄█─', '█▄▄▄█─', '─▀──'],
                ['█───█─', '─█─', '█─────', '────█─', '────█─', '────█─', '█───█─', '────█─', '█───█─', '────█─', '─▄──'],
                ['▀▀▀▀──', '─▀─', '▀▀▀▀──', '▀▀▀▀──', '────▀─', '▀▀▀▀──', '▀▀▀▀──', '────▀─', '▀▀▀▀──', '▀▀▀▀──', '────']
            ];
        } else if (config.style === "14") {
            font = [
                ['▄▀▀██─', '▄█─', '─▀▀██─', '─▀▀██─', '▄──██─', '▄█▀▀▀─', '▄█▀▀▀─', '▄▀▀██─', '▄▀▀██─', '▄▀▀██─', '─▄──'],
                ['█──██─', '██─', '▄▄▄██─', '─▄▄██─', '█▄▄██─', '██▄▄▄─', '██▄▄▄─', '───██─', '█▄▄██─', '█▄▄██─', '─▀──'],
                ['█──██─', '██─', '██────', '───██─', '───██─', '───██─', '██──█─', '───██─', '█──██─', '───██─', '─▄──'],
                ['▀▀▀▀──', '▀▀─', '▀▀▀▀──', '▀▀▀▀──', '───▀▀─', '▀▀▀▀──', '▀▀▀▀──', '───▀▀─', '▀▀▀▀──', '▀▀▀▀──', '─▀──']
            ];
        } else {
            engine.log("Style not found! Disabling Digital Clock v1.9...");
            return;
        }

        tz = [-12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4.5, -4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.5, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.75, 13, 14];
        data = 0;
        if (show_date) updateDate();
        if (show_clock) updateClock();

        let inter = config.interval || 1;
        let old = 0;
        interval = setInterval(function () {
            let now = new Date();
            if (now.getMinutes() !== old) {
                old = now.getMinutes();
                if (show_date) updateDate();
                if (show_clock) updateClock();
            }
        }, inter * 1000);
        engine.log("Digital Clock v1.9 has been initialized on connect...");
    }

    Date.prototype.stdTimezoneOffset = function () {
        let jan = new Date(this.getFullYear(), 0, 1);
        let jul = new Date(this.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    };

    Date.prototype.isDstObserved = function () {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    };

    function updateDate() {
        let nonutc = new Date();
        if (data !== nonutc.getDate()) {
            data = nonutc.getDate();
            let utc = nonutc.getTime() + (nonutc.getTimezoneOffset() * 60000);
            let time = new Date(utc + (3600000 * tz[config.timezone]));
            let ddd;
            let mmm;
            let yyyy;

            if (time.isDstObserved()) {
                time.setHours(time.getHours() + 1);
            }

            if (time.getMonth() <= 8 && config.digits === "1") {
                mmm = "0" + (time.getMonth() + 1);
            } else {
                mmm = (time.getMonth() + 1);
            }

            if (time.getDate() <= 9 && config.digits === "1") {
                ddd = "0" + time.getDate();
            } else {
                ddd = time.getDate();
            }

            yyyy = time.getFullYear();

            let czas = "[cspacer]";

            if (config.dateformat === "0") { //DD.MM.YYYY
                czas += ddd + "." + mmm + "." + yyyy;
            } else if (config.dateformat === "1") { //MM.DD.YYYY
                czas += mmm + "." + ddd + "." + yyyy;
            } else if (config.dateformat === "2") { //YYYY.MM.DD
                czas += yyyy + "." + mmm + "." + ddd;
            } else if (config.dateformat === "3") { //YYYY.DD.MM
                czas += yyyy + "." + ddd + "." + mmm;
            } else {
                engine.log("Dateformat doesn't exists! Disabling Digital Clock v1.9...");
                return;
            }

            let channel = backend.getChannelByID(config.id5);
            channel.update({name: czas});
        }
    }

    function updateClock() {
        let nonutc = new Date();
        let utc = nonutc.getTime() + (nonutc.getTimezoneOffset() * 60000);
        let time = new Date(utc + (3600000 * tz[config.timezone]));
        let hours = 0;

        if (time.isDstObserved()) {
            time.setHours(time.getHours() + 1);
        }

        if (config.format === "0") {
            hours = time.getHours();
        } else if (config.format === "1") {
            hours = time.getHours() % 12 || 12;
        }
        let minutes = time.getMinutes();
        let lines = ['', '', '', ''];
        for (let i = 0; i < 4; i++) {
            lines[i] = '[cspacer]' + String.fromCharCode(9472);
            if (hours >= 10) {
                lines[i] += font[i][Math.floor(hours / 10)];
            } else {
                if (config.digits === "1") {
                    lines[i] += font[i][0];
                }
            }
            lines[i] += font[i][hours % 10];
            lines[i] += font[i][10]; // :
            lines[i] += font[i][Math.floor(minutes / 10)];
            lines[i] += font[i][minutes % 10];
            if (config.spaces === "1") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(9617));
            } else if (config.spaces === "2") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(9552));
            } else if (config.spaces === "3") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(126));
            } else if (config.spaces === "4") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(43));
            } else if (config.spaces === "5") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(61));
            } else if (config.spaces === "6") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10303));
            } else if (config.spaces === "7") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10294));
            } else if (config.spaces === "8") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10240));
            } else if (config.spaces === "9") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(10495));
            } else if (config.spaces === "10") {
                lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(11501));
            } else if (config.spaces === "11") {
                //lines[i] = lines[i].replace(new RegExp(String.fromCharCode(9472), "g"), String.fromCharCode(32));
            }
        }

        let channel_id1 = backend.getChannelByID(config.id1);
        let channel_id2 = backend.getChannelByID(config.id2);
        let channel_id3 = backend.getChannelByID(config.id3);
        let channel_id4 = backend.getChannelByID(config.id4);

        //Channel update
        channel_id1.update({name: lines[0]});
        channel_id2.update({name: lines[1]});
        channel_id3.update({name: lines[2]});
        channel_id4.update({name: lines[3]});
    }
});