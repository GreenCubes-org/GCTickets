<% title = __('view.admin.dashboard.pagetitle') + " — " + __('global.pagetitle'),
	backUrl = '/';  %>
<%- partial('../../partials/header')%>

<%- partial('../partials/subheader', { header: __('view.ingameinfo.world.title'), subheader: __('view.ingameinfo.world.statistics.title') }) %>
<div class="container" style="margin-top: 20px">
	<h1><%= __('view.ingameinfo.world.statistics.players.title') %></h1>
	<div id="players-chart" style="height:500px"></div>
	<div class="ui list">
		<div class="item">
			<i class="circle icon" style="color:#7cb5ec"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.players.dots.registrations') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#434348"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.players.dots.activated') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#90ed7d"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.players.dots.online') %></div>
			</div>
		</div>
	</div>
	<h1><%= __('view.ingameinfo.world.statistics.quests.title') %></h1>
	<div id="quests-chart" style="height:500px"></div>
	<div class="ui list">
		<div class="item">
			<i class="circle icon" style="color:#7cb5ec"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.quests.dots.players') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#7cb5ec"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.quests.dots.quest2') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#434348"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.quests.dots.quest6') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#f7a35c"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.quests.dots.quest11') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#8085e9"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.quests.dots.quest16') %></div>
			</div>
		</div>
		<div class="item">
			<i class="circle icon" style="color:#f15c80"></i>
			<div class="content">
				<div class="header"><%= __('view.ingameinfo.world.statistics.quests.dots.quest24') %></div>
			</div>
		</div>
	</div>
</div>
