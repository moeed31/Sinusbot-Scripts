/*
 * Copyright (C) 2016 - 2018 Patrick15a <patrick15a@myfilehost.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	 See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.	 If not, see <http://www.gnu.org/licenses/>.
 */
/*
 *
 * @author Patrick15a <patrick15a@myfilehost.de>
 *
 */
registerPlugin({
	name: 'CountOnlineUsers',
	version: '1.1.1',
	description: 'Display the UserOnlineCount, TeamOnlineCount and UserOnlineRecord in different channels',
	author: 'Patrick15a <patrick15a@myfilehost.de>',
	vars: [
		{
			name: 'channelUserOnline',
			title: 'Channel for current user count',
			type: 'channel'
		},
		{
			name: 'channelTeamOnline',
			title: 'Channel for current team members count',
			type: 'channel'
		},
		{
			name: 'channelRecord',
			title: 'Channel for user record count',
			type: 'channel'
		},
		{
			name: 'channelUserOnline_name',
			title: 'Channel Name for current user count (use %u to display the current users)',
			type: 'string',
			placeholder: 'Default: [cspacer]Currently online users: %u'
		},
		{
			name: 'channelTeamOnline_name',
			title: 'Channel Name for current team members count (use %t to display the current team members)',
			type: 'string',
			placeholder: 'Default: [cspacer]Currently online team: %t'
		},
		{
			name: 'channelRecord_name',
			title: 'Channel name for user record count (use %r to display the users record)',
			type: 'string',
			placeholder: 'Default: [cspacer]Users record: %r'
		},
		{
			name: 'teamGroups',
			title: 'Team Groups (ServerGroupID\'s)',
			type: 'strings'
		},
		{
			name: 'ignoreGroups',
			title: 'Ignore Groups (ServerGroupID\'s)',
			type: 'strings'
		}
	]
}, function (sinusbot, config) {
	
	var engine = require('engine');
	var backend = require('backend');
	var event = require('event');
	var store = require('store');
	
	var record = store.getInstance('countOnlineUsers_record');
	var ponline = 0;
	var tonline = 0;
	var config_change = false;
	
	if (typeof config.channelUserOnline_name == 'undefined' || config.channelUserOnline_name == '') {
		config.channelUserOnline_name = '[cspacer]Currently online users: %u';
		config_change = true;
	}
	if (typeof config.channelTeamOnline_name == 'undefined' || config.channelTeamOnline_name == '') {
		config.channelTeamOnline_name = '[cspacer]Currently online team: %t';
		config_change = true;
	}
	if (typeof config.channelRecord_name == 'undefined' || config.channelRecord_name == '') {
		config.channelRecord_name = '[cspacer]Users record: %r';
		config_change = true;
	}
	if (typeof config.ignoreGroups == 'undefined') {
		var ignoreGroups = [""];
	} else {
		var ignoreGroups = config.ignoreGroups;
	}
	if (typeof config.teamGroups == 'undefined') {
		var teamGroups = [""];
	} else {
		var teamGroups = config.teamGroups;
	}
	if (typeof record == 'undefined') {
		record = 0;
		store.setInstance('countOnlineUsers_record', record);
	}
	if (config_change) {
		engine.saveConfig(config);
	}
	
	if (backend.isConnected()) {
		init();
	}
	
	
	event.on('clientMove', function(ev) {
		onlineCheck();
	});
	
	event.on('clientVisible', function(ev) {
		onlineCheck();
	});
	
	event.on('clientInvisible', function(ev) {
		onlineCheck();
	});
	
	event.on('serverGroupAdded', function(ev) {
		onlineCheck();
	});
	
	event.on('serverGroupRemoved', function(ev) {
		onlineCheck();
	});
	
	event.on('clientKicked', function(ev) {
		onlineCheck();
	});
	
	function init() {
		
		if (typeof config.channelRecord != 'undefined' && typeof config.channelRecord_name != 'undefined') {
			
			var ch_record = backend.getChannelByID(config.channelRecord);
			
			ch_record.setName(config.channelRecord_name.replace(/%r/g, record));
			
		}
		
	}
	
	function onlineCheck() {
		
		if (ponline != playersOnline()) {
			
			ponline = playersOnline();
			
			if (typeof config.channelUserOnline != 'undefined' && typeof config.channelUserOnline_name != 'undefined') {
				
				var ch_ponline = backend.getChannelByID(config.channelUserOnline);
				
				if (typeof ch_ponline !== 'undefined') {
					
					ch_ponline.setName(config.channelUserOnline_name.replace(/%u/g, ponline));
					
				}
				
			}
			
			if (typeof config.channelRecord != 'undefined' && typeof config.channelRecord_name != 'undefined' && record < ponline) {
				
				var ch_record = backend.getChannelByID(config.channelRecord);
				
				if (typeof ch_record !== 'undefined') {
					
					ch_record.setName(config.channelRecord_name.replace(/%r/g, ponline));
					
				}
				
				record = ponline;
				store.setInstance('countOnlineUsers_record', record);
				
			}
		}
		
		if (tonline != teamOnline()) {
			
			tonline = teamOnline();
			
			if (typeof config.channelTeamOnline != 'undefined' && typeof config.channelTeamOnline_name != 'undefined') {
				
				var ch_tonline = backend.getChannelByID(config.channelTeamOnline);
				
				if (typeof ch_tonline !== 'undefined') {
					
					ch_tonline.setName(config.channelTeamOnline_name.replace(/%t/g, tonline));
					
				}
			}
		}
		
		
	}

	function playersOnline() {
		
		clients = backend.getClients();
		var ignoreMembers = 0;
		
		clients.forEach(function(client) {
			
			if (isInGroup(client, ignoreGroups) === true) {
				ignoreMembers++
			}
		});
		
		return clients.length - ignoreMembers;
	}
	
	function teamOnline() {
		var clients = backend.getClients();
		var teamMembers = 0;
		
		clients.forEach(function(client) {
			
			if (isInGroup(client, teamGroups) === true && isInGroup(client, ignoreGroups) === false) {
				teamMembers++
			}
		});
		
		return teamMembers;
	}
	
	function isInGroup(client, groups) {
		var inGroup = false;
		client.getServerGroups().forEach(function(group) {
				
			if (groups.indexOf(group.id()) != -1) {
				inGroup = true;
			}
			
		});
		
		return inGroup;
	}
});
