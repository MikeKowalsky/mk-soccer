
let clubs = deuBundClubs.clubs;
console.log(clubs);

let rounds = deuBund.rounds;
let matchesArray = [];
rounds.forEach((round) => round.matches.forEach((match) => matchesArray.push(match)));
console.log(matchesArray);

let locationMain = '';
let monthMain = '';
let dayMain = '';
let teamMain = '';
let chatMain = '';

$(document).ready(() => {

	// event listener -> when form landscape to portrait (hide map etc)
	window.addEventListener("orientationchange", function() {
        console.log(screen.orientation.angle);
        console.log(screen.orientation);
        if(window.matchMedia("(orientation: landscape)").matches){
            console.log("portrait");
            console.log($(window).height());
            if ($(window).width() > 1000) {
                console.log($(window).height());
                $("#rightSide").show();
            } else {
                $("#rightSide").hide();
            }
            $("#gd").removeClass("gamesContainerL");
            $("#gd").addClass("gamesContainer");
        } else {
            console.log("landscape");
            if ($(".gamesContainer").css('display') != 'none' || $("#findLocation").css('display') != 'none' || $("#teamDiv").css('display') != 'none' || $(".map").css('display') != 'none' || $("#loginDiv").css('display') != 'none' || $("#chatDiv").css('display') != 'none'){
                $("#rightSide").hide();
            } else {
                $("#rightSide").show();
            }
        }
    });
    
    // in the begining during rendereing 
	if ($(window).height() > 1000){
		$("#rightSide").show();
        console.log(" h > 1000, so show right");
	} else if (window.matchMedia("(orientation: portrait)").matches){
		$("#rightSide").hide();
        console.log(" portrait, so hide right");
	} else {
		$("#rightSide").show();
        console.log(" else, so show right");
	}
    
    // hide divs
    $("#dBut").hide();
	$("#dmBut").hide();
	$("#gd").hide();
	$("#teamDiv").hide();
	$("#findLocation").hide();
	$("#mapDiv").hide();
    $("#loginDiv").hide();
    $("#loginEmailDiv").hide();
    $("#signInDiv").hide();
    $("#chatDiv").hide();

	// show months
	$("#ftd").click(() => {
		$("#indexDiv").hide();
		$("#dBut").show();
	});

	//show teams
	$("#fyt").click(() => {
		$("#indexDiv").hide();
		$("#rightSide").hide();
		$("#teamDiv").show();
	});

	// show locations
	$("#ftl").click(() => {
		$("#indexDiv").hide();
		$("#rightSide").hide();
		$("#findLocation").show();
	});

    // show chat
	$("#chatBut").click(() => {
        chatMain = 'posts';
        chatNameButton(chatMain);
        if (firebase.auth().currentUser != null){
            $("#indexDiv").hide();
            $("#rightSide").hide();
            $('#mainDiv').removeClass('container');
            $('#mainDiv').removeClass('containerChat');
            getPosts(chatMain);
            $("#chatDiv").show();
//            console.log($("#chatDiv").height());
        } else {
            $("#indexDiv").hide();
            $("#rightSide").hide();
            $("#loginDiv").show();
        }
        let user = firebase.auth().currentUser;
        console.log(user);
	});

	listOfLocations();
	listOfTeams();
	listOfMonths();
    
    
    $("#login").click(() => {
        login();
    });

    $("#loginWEMail").click(() => {
        $("#loginDiv").hide();
        $("#loginEmailDiv").show();
    });

    $("#logOut").click(() => {
       logOut(); 
    });

    $("#loginEMailBut").click(() => {
        loginEmail();
    });

    $("#signInBut").click(() => {
        $("#loginEmailDiv").hide();
        $("#signInDiv").show();
    });

    $("#signInEmailBut").click(() => {
        registeration();
    });

    $("#createPost").click(function () {
        writeNewPost(chatMain);
        $("#postInput").val("");
    });

    $(document).keypress(function(e){
        if(e.which == 13) {
            writeNewPost(chatMain);
            $("#postInput").val("");
        }
    });
});

function closestGameday(){

	let now = new Date();
	now.getDate();

	// filter only gamedays in the future
	let onlyFuture = matchesArray.filter((match) => (((new Date(match.date) - now) > 0) && (teamMain == '' || teamMain == match.team1.name.replace(/ /g, "") || teamMain == match.team2.name.replace(/ /g, ""))));
	console.log(onlyFuture);
	let closestDay = onlyFuture[0].date;
	console.log(closestDay);

	let tempDate = new Date(closestDay);
	monthMain = getMonthName(tempDate.getMonth());
	dayMain = tempDate.getDate();
	console.log("day: " + dayMain + ", month: " + monthMain);

	setOneDay();
}

function printOneDay(dayArray){

	// dropdown handling
	// all games from that month
	let validMonth = new Date (dayArray[0].date);
	let onlyThatMonth = matchesArray.filter((match) => {
		let gameMonth = new Date(match.date);
		return validMonth.getMonth() == gameMonth.getMonth();
	});

	let onlyThatMonthThatTeam = [];
	onlyThatMonth.forEach((match) => {
		if (teamMain == '' || match.team1.name.replace(/ /g, "") == teamMain || match.team2.name.replace(/ /g, "") == teamMain){
			onlyThatMonthThatTeam.push(match);
		}
	});

	let onlyDates = onlyThatMonthThatTeam.map((match) => match.date);
	let onlyNoDuplDates = [];
	onlyDates.forEach((date) => {
		if (!onlyNoDuplDates.includes(date)){
			onlyNoDuplDates.push(date);
		}
	});
	console.log(onlyNoDuplDates);

	$("button.dropbtn").replaceWith("<button class=\"dropbtn\">" + dayArray[0].date + "</button>");

    // dropdown menu links
	$('.dropDownBut').remove();
	onlyNoDuplDates.forEach((date) => {
		$("div.dropdown-content").append("<a data-field=" + date + " class=\"dropDownBut\" href=\"#\">" + date + "</a>");
	});

	//links to games and chats
	$('.gameLink').remove();
    $('.runChat').remove();
	dayArray.forEach((match) => {
		match.locationLink = match.team1.name.replace(/ /g, ""); 	// add extra format of location
        match.chatLink = match.team1.code + "_" + match.team2.code;
        
		let toInput = "<a data-field=" + match.locationLink + " class=\"gameLink\" href=\"#\">" + match.team1.name + "<br><img src=\"teamLogos/" + match.team1.code.toLowerCase() + ".png\" alt=\"logo1\"> vs <img src=\"teamLogos/" + match.team2.code.toLowerCase() + ".png\" alt=\"logo2\"><br>" + match.team2.name + "<a data-field=" + match.chatLink + " class=\"runChat\" href=\"#\"><img src=\"chat.png\"  alt=\"chatIcon\"><p>Join chat: " + match.team1.code + " - " + match.team2.code + "</p></a></a>";
        
		if (teamMain == '' || match.team1.name.replace(/ /g, "") == teamMain || match.team2.name.replace(/ /g, "") == teamMain){
			$('#gd').append(toInput);
		}
	});

	$(".gameLink").click(function() {
		locationMain = $(this).attr("data-field");
		let linkMap = getMapLink(locationMain);
		if ($(window).width() < 560){
			$(".map").append(linkMap);
			$("#gd").hide();
			$("#mapDiv").show();
		} else {
			$("#gd").removeClass("gamesContainer");
			$("#gd").addClass("gamesContainerL");
			$("#rightSide").empty();
			$("#rightSide").append(linkMap);
			$("#rightSide").show();
		}
	});

	$(".dropDownBut").click(function() {
		let dropPick = $(this).attr("data-field");
		// console.log(dropPick);
		let dropDate = new Date(dropPick);
		monthMain = getMonthName(dropDate.getMonth());
		dayMain = dropDate.getDate();
		// console.log(monthMain + " " + dayMain);
		setOneDay();
	});
    
    $(".runChat").click(function() {
        chatMain = $(this).attr("data-field");
        console.log(chatMain);
        chatNameButton(chatMain);
        $("#gd").hide();
        if (firebase.auth().currentUser != null){
            $('#mainDiv').removeClass('container');
            $('#mainDiv').removeClass('containerChat');
            getPosts(chatMain);
            $("#chatDiv").show();
        } else {
            $("#loginDiv").show();    
        }   
    });
}

function getMonthName(num){
	switch (num) {
		case 0: return 'January';
		case 1: return 'February';
		case 2: return 'March';
		case 3: return 'April';
		case 4: return 'May';
		case 5: return 'June';
		case 6: return 'July';
		case 7: return 'August';
		case 8: return 'September';
		case 9: return 'October';
		case 10: return 'November';
		case 11: return 'December';
	}
}

function getMapLink(location){
	let linkMap = '';
	
	switch (location){
		case 'FCBayernMünchen': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2658.3673969274696!2d11.622518515651832!3d48.21879967922998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479e7385128a251f%3A0xed4d60428e32c423!2sAllianz+Arena!5e0!3m2!1spl!2sde!4v1523369803258" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'Hannover96': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.5736816404765!2d9.729030850843731!3d52.36001697968499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b074c66cbf6c53%3A0xd7015c9fba893089!2sHDI-Arena!5e0!3m2!1spl!2sde!4v1523370288206" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case '1899Hoffenheim': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2604.991973738426!2d8.88414715069276!3d49.238641379225086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479791b6e72c1d93%3A0x8807cb6393d1e827!2sWIRSOL+Rhein-Neckar-Arena!5e0!3m2!1spl!2sde!4v1523370356122" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'Schalke04': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2480.7419388124317!2d7.065332150804145!3d51.554630879542984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8e60a1cf65009%3A0xdfce5aff64fdbf72!2sVeltins-Arena!5e0!3m2!1spl!2sde!4v1523370405644" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case '1.FSVMainz05': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2565.462159992583!2d8.222187550728215!3d49.983944179312736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd96ee5c8e8509%3A0x5dd0481e90dbc1fd!2sOPEL+ARENA!5e0!3m2!1spl!2sde!4v1523370466463" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'WerderBremen': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2397.436441808368!2d8.835411050878799!3d53.06643277982286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b127f7637d9395%3A0xabe8db3758157302!2sWeserstadion!5e0!3m2!1spl!2sde!4v1523370508184" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'Bayer04Leverkusen': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2508.80570966123!2d7.000062550778985!3d51.03820907946046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bf2ebbe66139e5%3A0xbce75509e2f3a288!2sBayArena!5e0!3m2!1spl!2sde!4v1523370620537" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;													
		case 'VfBStuttgart': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2628.456908467715!2d9.229885950671731!3d48.79225767917936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4799c4fd92bd5f09%3A0x18bc59c7bf539843!2sMercedes-Benz+Arena!5e0!3m2!1spl!2sde!4v1523370664265" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'HerthaBSC': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.035474324185!2d13.2373046508514!3d52.51469707971409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a8571e82ebb629%3A0xce5194e63b0cd35d!2sStadion+Olimpijski+w+Berlinie!5e0!3m2!1spl!2sde!4v1523370718822" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'FCAugsburg': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2652.9434625869835!2d10.883836250649788!3d48.323168279136745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479ea27fd82b845b%3A0x67bb3264c3fa9af5!2sWWK+Arena!5e0!3m2!1spl!2sde!4v1523370829881" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'EintrachtFrankfurt': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.945586631406!2d8.643277950732266!3d50.068580679323595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd0b82374086e1%3A0x72efad9b38279c0a!2sCommerzbank-Arena!5e0!3m2!1spl!2sde!4v1523371048271" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'BorussiaM\'gladbach': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2501.415206829474!2d6.383311450785572!3d51.17456977948153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8ab329f7f7afb%3A0xbc2d05dc3af26862!2sBorussia-Park!5e0!3m2!1spl!2sde!4v1523371096250" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'HamburgerSV': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2368.3549571038357!2d9.896406350904876!3d53.58712787993221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b185d5e3884a41%3A0x2b93b45f7b4d3ce2!2sVolksparkstadion!5e0!3m2!1spl!2sde!4v1523371245210" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'RBLeipzig': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2492.125475807317!2d12.345246750793933!3d51.34560327950877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a6f794c5fbaa91%3A0x356640372e740fe!2sRed+Bull+Arena+Lipsk!5e0!3m2!1spl!2sde!4v1523371284698" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case '1.FCKöln': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2514.473223939381!2d6.872960450773903!3d50.93346087944457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bf3ad93b528799%3A0x839f348afc087fb5!2sRheinEnergieStadion!5e0!3m2!1spl!2sde!4v1523371345455" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'SCFreiburg': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2670.283039871008!2d7.89068295063424!3d47.9889169791098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47911d1f92e151b1%3A0x2533ba8e8309317e!2sSchwarzwald-Stadion!5e0!3m2!1spl!2sde!4v1523371383323" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'BorussiaDortmund': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.124172545034!2d7.449663350801104!3d51.492588779532774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b919d39230d60f%3A0x8fd9c195ad02eddf!2sSignal+Iduna+Park!5e0!3m2!1spl!2sde!4v1523371452264" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;
		case 'VfLWolfsburg': linkMap = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2432.575414536524!2d10.801738950847316!3d52.43249047969855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47af93c8d01e69e5%3A0xe2465df60ba210ae!2sVolkswagen-Arena!5e0!3m2!1spl!2sde!4v1523371483446" width="300" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>';
														return linkMap;																																																																																																																
	}
}

function listOfLocations(){

	let locationArray = [];
	let locationArrayLinks = [];
	let sadiumsNames = [];
	let logoLinkArray = [];
	let logoLink = '';
	
	matchesArray.forEach((match) => {
		if (!locationArray.includes(match.team1.name)){
			locationArray.push(match.team1.name);
			locationArrayLinks.push(match.team1.name.replace(/ /g, ""));
			clubs.forEach((club) => {
				if(club.name == match.team1.name){
					sadiumsNames.push(club.stadium);
					logoLink = '<img src="' + club.logo + '" alt="logo">';
					logoLinkArray.push(logoLink);
				}
			});
		}
	});

	for (let i = 0; i < locationArray.length; i ++){
		$('#locationButtons').append("<a data-field=" + locationArrayLinks[i] + " href=\"#\" class=\"mapBut buttonSM\">" + sadiumsNames[i] + "<br>" + logoLinkArray[i] + "<br>" + locationArray[i] + "</a>")
	}

	// console.log($(window).width());
	// console.log($(window).height());

	$(".mapBut").click((e) => {
		locationMain = $(e.currentTarget).attr("data-field");
		console.log(locationMain + " calling gameMapLink");
		let linkMap = getMapLink(locationMain);
		if ($(window).width() < 560){
			$(".map").append(linkMap);
			$("#findLocation").hide();
			$("#mapDiv").show();
		} else {
			$("#findLocation").removeClass("buttons");
			$("#findLocation").addClass("buttonsL");
			$("#rightSide").empty();
			$("#rightSide").append(linkMap);
			$("#rightSide").show();
		}

	});
}

function listOfTeams(){
	let teamsArray = [];
	
	matchesArray.forEach((match) => {
		if (!teamsArray.includes(match.team1.name)){
			teamsArray.push(match.team1.name);
		} else if (!teamsArray.includes(match.team2.name)){
			teamsArray.push(match.team1.name);
		}
	});
	teamsArray.sort();
	let teamsArrayFormatted = teamsArray.map((team) => team.replace(/ /g, ""));

	for (let i = 0; i < teamsArray.length; i++){
		let logoLinkPart = '';
		clubs.forEach((club) => {
			if(club.name == teamsArray[i]){
				logoLinkPart = club.logo;
			}
		});
		let logoLink = '<img src="' + logoLinkPart + '" alt="logo">';
		$('#teamButtons').append("<a data-field=" + teamsArrayFormatted[i] + " href=\"#\" class=\"buttonSM teamsBut\">" + logoLink + "<br>" + teamsArray[i] + "</a>");
	}

	$(".teamsBut").click((e) => {
		teamMain = $(e.currentTarget).attr("data-field");
		console.log(teamMain);
		listOfMonths();
		$("#teamDiv").hide();
		$("#dBut").show();
		$("#rightSide").show();
	});
}

function listOfMonths(){
	let monthsArray = [];
	
	matchesArray.forEach((match) => {
		let tempDate = new Date(match.date);
		let tempMonth = getMonthName(tempDate.getMonth());

		if ((!monthsArray.includes(tempMonth)) && (teamMain == '' || match.team1.name.replace(/ /g, "") == teamMain || match.team2.name.replace(/ /g, "") == teamMain)){
			monthsArray.push(tempMonth);
		}
	});

	//remove old monthBut to create new one
	$('.monthBut').remove();
	console.log("monthsArray: " + monthsArray);
	monthsArray.forEach((month) => $('#dBut').append("<a data-field=" + month + " href=\"#\" class=\"monthBut button\">" + month + "</a>"));

	$(".monthBut").click(function(){
		monthMain = $(this).attr("data-field");
		listOfDays();
		$("#dBut").hide();
		$("#dmBut").show();
	});


	$("#cgd").click(function(e){
		e.preventDefault();
		closestGameday();
		$("#dBut").hide();
		$("#rightSide").hide();
		$("#gd").show();
	});
}

function listOfDays(){
	console.log(monthMain);
	$('#dmBut').append("<a href=\"#\" class=\"notActiv\">" + monthMain + "</a>");

	let daysArray = [];
	matchesArray.forEach((match) => {
		let tempDate = new Date(match.date);
		let tempMonth = getMonthName(tempDate.getMonth());
		let tempDay = tempDate.getDate();

		if (tempMonth == monthMain && !daysArray.includes(tempDay) && (teamMain == '' || match.team1.name.replace(/ /g, "") == teamMain || match.team2.name.replace(/ /g, "") == teamMain)){
			daysArray.push(tempDay);
		}
	});

	//remove old monthBut to create new one
	$('.dayBut').remove();
	console.log("daysArray: " + daysArray);
	daysArray.forEach((day) => $('#dmBut').append("<a data-field=" + day + " href=\"#\" class=\"buttonSM dayBut\">" + day + "</a>"));

	$(".dayBut").click(function(){
		dayMain = $(this).attr("data-field");
		setOneDay();
		$("#dmBut").hide();
		$("#rightSide").hide();
		$("#gd").show();
	});
}

function setOneDay(){
	let selectedDay = dayMain;
	let selectedMonth = monthMain;
	
	let selectedGames = [];
	matchesArray.forEach((match) => {
		let tempDate = new Date(match.date);
		let tempMonth = getMonthName(tempDate.getMonth());
		let tempDay = tempDate.getDate();

		if (tempMonth == selectedMonth && tempDay == selectedDay){
			selectedGames.push(match);
		}
	});

	console.log("selectedGames: ");
	console.log(selectedGames);

	printOneDay(selectedGames);
}

function login() {
    
    // Provider
    var provider = new firebase.auth.GoogleAuthProvider();

    // Log In With popup window - google account
    firebase.auth().signInWithPopup(provider)
        .then(function(result){
            $('#mainDiv').removeClass('container');
            $('#mainDiv').removeClass('containerChat');
            getPosts(chatMain);
            $("#loginDiv").hide();
            $("#chatDiv").show();
            let user = firebase.auth().currentUser;
            console.log(user);
        })
        .catch(function(error) {
            alert('error' + error.message);
        });
}


function loginEmail() {

    event.preventDefault();
    let email = $('#userEmail').val();
    console.log(email);
    let password = $('#userPass').val();
    console.log(password);

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (result) {
            $('#mainDiv').removeClass('container');
            $('#mainDiv').removeClass('containerChat');
            getPosts(chatMain);
            $("#loginEmailDiv").hide();
            $("#chatDiv").show();
            let user = firebase.auth().currentUser;
            console.log(user);
        })
        .catch(function (error) {
            alert('error' + error.message);
        });
}


function writeNewPost(dbName) {

    var text = $("#postInput").val();
    var userName = (firebase.auth().currentUser.displayName == null) ? firebase.auth().currentUser.email : firebase.auth().currentUser.displayName;
    var postDate = new Date();

    var post = {
        name: userName,
        body: text,
        time: postDate
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child(dbName).push().key;

    //Write data
    var updates = {};
    updates[newPostKey] = post;
    
//    console.log(updates);
    
    return firebase.database().ref(dbName).update(updates);
}


function getPosts(dbName) {

     firebase.database().ref(dbName).on('value', function (data) {

         var postsFB = data.val();

         $("#postsDiv").empty();
         
         var options = { year: 'numeric', month: 'long', day: 'numeric', hour: '', minute: '', second: ''}; 
         for(let i in postsFB) {
            let thisDate = new Date(postsFB[i].time);
            if (firebase.auth().currentUser.displayName == postsFB[i].name || firebase.auth().currentUser.email == postsFB[i].name) {
                $("#postsDiv").append("<a class=\"chatMsg usersPost\" href=\"#\"><small>" + postsFB[i].name + "</small><br>" + postsFB[i].body + "<br><small>" + thisDate.toLocaleString('en-US') + "</small></a>");
            } else {
                $("#postsDiv").append("<a class=\"chatMsg othersPost\" href=\"#\"><small>" + postsFB[i].name + "</small><br>" + postsFB[i].body + "<br><small>" + thisDate.toLocaleString('en-US') + "</small></a>"); 
            }
         };

     })
}

function registeration() {

    let newEmail = $('#newEmail').val();
    console.log(newEmail);
    let newPassword = $('#newPass').val();
    console.log(newPassword);

    firebase.auth().createUserWithEmailAndPassword(newEmail, newPassword)
        .then(function (result) {
            alert('registration complete');
            $('#signInDiv').hide(); 
            $('#loginEmailDiv').show();
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function logOut(){
    
    firebase.auth().signOut()
        .then(function() {
            alert('You are logged out!');
            $("#chatDiv").hide();
            $("#indexDiv").show();
        })
        .catch(function(error) {
            alert(error.message);
        });
}

function showPass(id) {
    if (id.type === "password") {
        id.type = "text";
    } else {
        id.type = "password";
    }
}

function chatNameButton(inChatName) {
    console.log("in chat name change");
    if(chatMain == 'posts'){
        $("#chatName").replaceWith("<a id=\"chatName\" href=\"#\" class=\"notActivSM\">Chat</a>");
    } else {
        let part1 = inChatName.slice(0, 3);
        let part2 = inChatName.slice(4, 7);
        $("#chatName").replaceWith("<a id=\"chatName\" href=\"#\" class=\"notActivSM\">Chat " + part1 + " - " + part2 + "</a>");
    }
}

