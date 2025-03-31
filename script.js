function numFromWord(word) {

    if (word.match(/cookies/)) {
	word = word.replace('cookies', '');
    }	

    if (word.match(/\d{1,3}(.\d{1,3})?\smillion/)) {
	return Number.parseFloat(word.replace('million', ''))* 1000000;
    }
    if (word.match(/\d{1,3}(.\d{1,3})?\sbillion/)) {
	return Number.parseFloat(word.replace('billion', ''))* 1000000000;
    }
    if (word.match(/\d{1,3}(.\d{1,3})?\strillion/)) {
	return Number.parseFloat(word.replace('trillion', ''))* 1000000000000;
    }
    if (word.match(/\d{1,3}(.\d{1,3})?\squadrillion/)) {
	return Number.parseFloat(word.replace('quadrillion', ''))* 1000000000000000;
    }
    if (word.match(/\d{1,3},\d{3}/)) {
	return Number.parseFloat(word.replace(',', ''));
    }
    if (word.match(/\d{1,3}(.\d{1,3})?/)) {
	return Number.parseFloat(word);	    
    }

    if (word.match(/\d{1,3}$/)) {
	return Number.parseFloat(word);
    }


}

function display_data(data) {
	const sorted = Object.entries(data).sort((a,b)=> a[1].cost_per_cookie - b[1].cost_per_cookie);
console.log(sorted.reduce((sz, [k,v]) => `${sz}\n${k} - ${v.cost_per_cookie}`,''));
}

function get_cookie_data() {



const unlocked = [...document.querySelectorAll('#products .unlocked.enabled')];
let data = {};
let unlocked_count = 0;
let tooltip_then_next = () => {
	if (unlocked_count >= unlocked.length) { 
		display_data(data);
		unlocked_count = 0; 
		return; 
	}
	unlocked[unlocked_count++].onmouseover();

	const tooltip = document.querySelector('#tooltip');
	const [incre, total, ...rest] = [...tooltip.querySelectorAll('.descriptionBlock > b')].map(x => numFromWord(x.innerText));
	const price = numFromWord(document.querySelector('#tooltip .price').innerText);
	const name = tooltip.querySelector('.name').innerText;
	data[name] = {
		price,
		incre,
		total,
		cost_per_cookie: price/incre
	    	};
	setTimeout(tooltip_then_next, 100);
}
tooltip_then_next();
}

function get_upgrade_data() {
    const data = {};

    const upgrades = document.querySelectorAll('#upgrades .enabled');

    let upgrade_count = 0;
    let tooltip_then_next = () => {
	if (upgrade_count >= upgrades.length) { 
		display_data(data);
		upgrade_count = 0; 
		return; 
	}
	upgrades[upgrade_count++].onmouseover();

	const tooltip = document.querySelector('#tooltip');
	
	// types: +x%, twice
	// Cookie production multiplier +x%
	// Mines are twice as efficient.\nFinally caved in?

	const text = tooltip.querySelector('.description').innerText;
	const bold = tooltip.querySelectorAll('.description b').innerText;

	if (bold === "twice") {
		text.match(/^[a-zA-Z]+\s/)
	}
	
	setTimeout(tooltip_then_next, 100);
    }	
	tooltip_then_next();
}

function periodically_recalculate() {
	get_cookie_data();
	setTimeout(periodically_recalculate, 4000);
}
