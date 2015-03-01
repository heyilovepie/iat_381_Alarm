$(function(){

	var z
		h = $(window).height(),
		w = $(window).width(),
		clock = $('#clock'),
		alarm = clock.find('.alarm'),
		ampm = clock.find('.ampm'),
		dialog = $('#alarm-dialog'),
		dialog_p = dialog.parent(),
		alarm_set = $('#alarm-set'),
		alarm_clear = $('#alarm-clear'),
		alarm_box = $('#alarm-box'),
		time_is_up = $('#time-is-up'),
		time_is_up_p = time_is_up.parent(),
		alarmbox = false,
		clock_move_1 = .1;
		clock_move_2 = .2;

	var alarm_counter = [-1, -1, -1]; //the counters for the 3 alarms
	var current_alarm = 0; //the current location of the alarm

	// Map digits to their names (this will be an array)
	var digit_to_name = 'zero one two three four five six seven eight nine'.split(' ');

	// This object will hold the digit elements
	var digits = {};

	// Positions for the hours, minutes, and seconds
	var positions = [
		'h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'
	];

	// Generate the digits with the needed markup,
	// and add them to the clock

	var digit_holder = clock.find('.digits');

	$.each(positions, function(){

		if(this == ':'){
			digit_holder.append('<div class="dots">');
		}
		else{

			var pos = $('<div>');

			for(var i=1; i<8; i++){
				pos.append('<span class="d' + i + '">');
			}

			// Set the digits as key:value pairs in the digits object
			digits[this] = pos;

			// Add the digit elements to the page
			digit_holder.append(pos);
		}

	});

	// Add the weekday names

	var weekday_names = 'MON TUE WED THU FRI SAT SUN'.split(' '),
		weekday_holder = clock.find('.weekdays');

	$.each(weekday_names, function(){
		weekday_holder.append('<span>' + this + '</span>');
	});

	var weekdays = clock.find('.weekdays span');


	// Run a timer every second and update the clock

	(function update_time(){

		// Use moment.js to output the current time as a string
		// hh is for the hours in 12-hour format,
		// mm - minutes, ss-seconds (all with leading zeroes),
		// d is for day of week and A is for AM/PM

		var now = moment().format("hhmmssdA");

		digits.h1.attr('class', digit_to_name[now[0]]);
		digits.h2.attr('class', digit_to_name[now[1]]);
		digits.m1.attr('class', digit_to_name[now[2]]);
		digits.m2.attr('class', digit_to_name[now[3]]);
		digits.s1.attr('class', digit_to_name[now[4]]);
		digits.s2.attr('class', digit_to_name[now[5]]);

		// The library returns Sunday as the first day of the week.
		// Stupid, I know. Lets shift all the days one position down, 
		// and make Sunday last

		var dow = now[6];
		dow--;
		
		// Sunday!
		if(dow < 0){
			// Make it last
			dow = 6;
		}

		// Mark the active day of the week
		weekdays.removeClass('active').eq(dow).addClass('active');

		// Set the am/pm text:
		ampm.text(now[7]+now[8]);


		// Is there an alarm set?
		var alarms_active = 0;
		for(var i = 0; i < alarm_counter.length; i++){
			if(alarm_counter[i] >= 1){
				
				// Decrement the counter with one second
				alarm_counter[i]--;
				alarms_active++;
			}
			else if(alarm_counter[i] >= 0){
				time_is_up_p.fadeIn();
				alarm_counter[i] = -1;
				alarms_active++;

				// Play the alarm sound. This will fail
				// in browsers which don't support HTML5 audio
				try{
					$('#alarm-ring')[0].play();
				}
				catch(e){}
			}
		}

		if( alarms_active > 0 ){ 
			alarm.addClass('active');
		} else {
			alarm.removeClass('active');
		}
		// Schedule this function to be run again in 1 sec
		setTimeout(update_time, 1000);

	})();

	function configure(){
		h = $(window).height();
		w = $(window).width();

		alarm_box.css({ top: h - 50 });

		var cWidth = 370 - 80;
		if(w < 370){
			cWidth = w - 20;
		}
		clock.css({ width: cWidth});

		var adTop = 200; //alarm_dialogue top
		if(h < 400){
			clock_move_1 = .2;
			clock_move_2 = clock_move_1;
			adTop = 10;
		}
		else{
			clock_move_2 = .2;
			clock_move_1 = clock_move_2 * .4;
		}
		dialog.css({top: adTop});
		time_is_up.css({top: adTop});
	};

	//When you flip the phone
	$( window ).resize(configure);
	configure();

	// Switch the theme

	$('#switch-theme').click(function(){
		clock.toggleClass('light dark');
	});


	// Handle setting and clearing alamrs

	$('.alarm-button').click(function(){
		if(alarmbox){
			alarm_box.trigger('hide');
			setTimeout(function(){
				clock.velocity({translateY: 0}, 300);
			}, 100);
		}else{
			alarm_box.trigger('show');
			setTimeout(function(){
				clock.velocity({translateY: - h * clock_move_1}, 300);
			}, 75);
		}
	});

	$('#new-alarm-button').click(function(){	 
		//find out which alarm it is
		var made_alarm = false;
		for(var i = 0; i < alarm_counter.length; i++){
			if(alarm_counter[i] == -1){
				current_alarm = i; //specify which alarm you are making 
				made_alarm = true;
				break;
			}
		}

		/////////////Change this to allow choice? ////////////
		if ( !made_alarm ){ //if you have made 3 alarms then override the oldest one
			current_alarm ++;
			if ( current_alarm > alarm_counter.length -1 ) current_alarm = 0;
			alarm_counter[current_alarm] = -1;
		}

		console.log("Current alarm is " + current_alarm);
		/////////////////////////////////////////////////////

		// Show the dialog
 		dialog_p.trigger('show');		
 		clock.velocity({translateY: - h * clock_move_2}, 300);	
	});

	dialog.find('.close').click(function(){

		dialog_p.trigger('hide')
	});

	dialog_p.click(function(e){

		// When the overlay is clicked, 
		// hide the dialog_p.

		if($(e.target).is('.overlay')){
			// This check is need to prevent
			// bubbled up events from hiding the dialog
			dialog_p.trigger('hide');
		}
	});


	alarm_set.click(function(){
		var valid = true, after = 0,
			to_seconds = [3600, 60, 1];

		dialog.find('input').each(function(i){

			// Using the validity property in HTML5-enabled browsers:

			if(this.validity && !this.validity.valid){

				// The input field contains something other than a digit,
				// or a number less than the min value

				valid = false;
				this.focus();

				return false;
			}

			after += to_seconds[i] * parseInt(parseInt(this.value));
		});

		if(!valid){
			alert('Please enter a valid number!');
			return;
		}

		if(after < 1){
			alert('Please choose a time in the future!');
			return;	
		}

		alarm_counter[current_alarm] = after;
		dialog_p.trigger('hide');
	});

	alarm_clear.click(function(){
		alarm_counter[current_alarm] = -1;
		dialog_p.trigger('hide');
	});

	var breakTime = function(time){
		var break_time = [0, 0, 0];
		break_time[0] = Math.floor(time/3600);
		time = time%3600;

		break_time[1] = Math.floor(time/60);
		time = time%60;

		break_time[2]=time;

		return break_time;
	}

	// Custom events to keep the code clean
	dialog_p.on('hide',function(){
		alarm_box.trigger('hide');
		clock.velocity({translateY: 0}, 300);
		dialog_p.fadeOut();

	}).on('show',function(){

		// Calculate how much time is left for the alarm to go off.
		var hours = 0, minutes = 0, seconds = 0;

		if(alarm_counter[current_alarm] > 0){
			
			// There is an alarm set, calculate the remaining time
			var time_left = breakTime(alarm_counter[current_alarm]);
			hours = time_left[0];
			minutes = time_left[1];
			seconds = time_left[2];
		}

		// Update the input fields
		dialog_p.find('input').eq(0).val(hours).end().eq(1).val(minutes).end().eq(2).val(seconds);

		dialog_p.fadeIn();

	});

	time_is_up.click(function(){
		time_is_up_p.fadeOut();
	});

	$('body').on("swipeup", function(){
		if(alarmbox) alarm_box.trigger('hide');
	});

	$('body').on("swipedown", function(){
		if(!alarmbox) alarm_box.trigger('show');
	});

	// Custom events to keep the code clean
	alarm_box.on('hide',function(){
		alarm_box.velocity({translateY: 0}, 300, function(){
			alarmbox = false;
		});
	}).on('show',function(){
		alarm_box.velocity({translateY: -100}, 300, function(){
			alarmbox = true;
		});
	});
});