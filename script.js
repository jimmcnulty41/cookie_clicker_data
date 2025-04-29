
data = {};

function numFromWord(word) {
	if (word.match(/cookies/)) {
		word = word.replace('cookies', '');
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\smillion/)) {
		return Number.parseFloat(word.replace('million', '')) * 1000000;
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\sbillion/)) {
		return Number.parseFloat(word.replace('billion', '')) * 1000000000;
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\strillion/)) {
		return Number.parseFloat(word.replace('trillion', '')) * 1000000000000;
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\squadrillion/)) {
		return Number.parseFloat(word.replace('quadrillion', '')) * 1000000000000000;
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\squintillion/)) {
		return Number.parseFloat(word.replace('quintillion', '')) * 10000000000000000000;
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\ssextillion/)) {
		return Number.parseFloat(word.replace('sextillion', '')) * 10000000000000000000000;
	}
	if (word.match(/\d{1,3}(.\d{1,3})?\sseptillion/)) {
		return Number.parseFloat(word.replace('septillion', '')) * 10000000000000000000000000;
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
	const sorted = Object.entries(data).sort((a, b) => a[1].cost_per_cookie - b[1].cost_per_cookie);
	console.log(sorted.reduce((sz, [k, v]) => `${sz}\n${k} - ${v.cost_per_cookie}`, ''));
}

function populate_cookie_data() {
	const unlocked = [...document.querySelectorAll('#products .unlocked.enabled')];
	data = {}
	let unlocked_count = 0;
	let tooltip_then_next = () => {
		if (unlocked_count >= unlocked.length) {
			return get_upgrade_data();
		}
		unlocked[unlocked_count++].onmouseover();

		const tooltip = document.querySelector('#tooltip');
		const [incre, total, ...rest] = [...tooltip.querySelectorAll('.descriptionBlock > b')].map(x => numFromWord(x.innerText));
		const price = numFromWord(document.querySelector('#tooltip .price').innerText);
		const name = tooltip.querySelector('.descriptionBlock').innerText.match(/each\s[a-zA-Z]+/)[0].slice(5).toLowerCase();

		data[name] = {
			price,
			incre,
			total,
			cost_per_cookie: price / incre
		};
		setTimeout(tooltip_then_next, 100);
	}
	tooltip_then_next();
}

function unpluralize(word) {
	const naive = word.slice(0, -2).toLowerCase();
	if (naive.slice(-2) === "ie") {
		return naive.slice(0,-2) + "y";
	} else {
		return naive;
	}
}

function get_currency(text) {
	// wizard towers
	const wiz = text.match(/^Wizard towers/);
	if (wiz) {
		return "wizard";
	}
	const alc = text.match(/^Alchemy labs/);
	if (alc) {
		return "alchemy";
	}
	const time = text.match(/^Time machines/);
	if (time) {
		return "time";
	}
	// "Antimatter condensers are twice as efficient.\nSweet firm bosons."
	const anti = text.match(/^Antimatter condensers/);
	if (anti) {
		return "antimatter";
	}
	// Fractal engines are twice as efficient.
	const frac = text.match(/^Fractal engines/);
	if (frac) {
		return "fractal";
	}
	const jav = text.match(/^Javascript console/);
	if (jav) {
		return "javascript";
	}
	const cor = text.match(/^Cortex baker/);
	if (cor) {
		return "cortex";
	}
	const match_res = text.match(/^[a-zA-Z]+\s/);
	if (!match_res) {
		console.error("Didn't find an affected currency in ");
		console.error(name);
	}
	return unpluralize(match_res[0]);
}

function get_upgrade_data() {
	console.log(`data starts as:`);
	console.log(data);
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
		// Grandmas are twice as efficient. Factories gain +1% CpS per 3 grandmas.\nA nice worker to manufacture more cookies.

		const name = tooltip.querySelector('.name').innerText.toLowerCase();
		const text = tooltip.querySelector('.description').innerText;
		const bold = tooltip.querySelectorAll('.description b');
		const price = numFromWord(document.querySelector('#tooltip .price').innerText);
		const cps = numFromWord(document.querySelector("#cookiesPerSecond").innerText.slice(12));

		if ([...bold].length === 1 || [...bold].length === 2) {
			if (bold[0].innerText === "twice") {

				const affected_currency = get_currency(text);
				if (!data[affected_currency]) {
					console.warn(`no data for ${affected_currency}`);
				}
				const incre = data[affected_currency].total;
				data[name] = {
					price,
					incre,
					cost_per_cookie: price / incre
				};
			} else {
				const pct_match = bold[0].innerText.match(/\+\d%/);

				if (pct_match) {
					const amt = Number.parseInt(bold[0].innerText);
					const incre = amt * cps / 100;
					data[name] = {
						price,
						incre,
						cost_per_cookie: price/ incre
					};
				}
			}
		}

		setTimeout(tooltip_then_next, 100);
	}
	tooltip_then_next();
}

function periodically_recalculate() {
	populate_cookie_data();
	setTimeout(periodically_recalculate, 10000);
}
