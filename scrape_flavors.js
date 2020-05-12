const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
	// Start browser & navigate to page
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('https://www.benjerry.com/flavors/ice-cream-pints');
	await page.setViewport({
		width: 1200,
		height: 800,
	});
	await autoScroll(page);

	// Build list of flavors
	await page.waitForSelector('.flavors');
	await page.waitForSelector('.image-alt-name');
	const flavors = await page.evaluate(() => {
		let res = '';
		let items = document.querySelectorAll('.landing-item').forEach(item => {
			res = res.concat(
				`${item.getAttribute('data-pname')}\t${item.querySelector(
					'.ingredients > p'
				).textContent}\t${item.querySelector('.image-alt-name').src}\n`
			);
		});
		return res;
	});
	await browser.close();

	// Write tsv file
	fs.writeFile('flavors.tsv', flavors, 'utf8', function(err) {
		if (err) {
			console.log('unable to write file');
		}
	});

	console.log('finished');
})();

// Helper function from here:
// https://stackoverflow.com/questions/57044231/puppeteer-with-lazy-loading-images
async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			let totalHeight = 0, distance = 100;
			let timer = setInterval(
				() => {
					var scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					totalHeight += distance;

					if (totalHeight >= scrollHeight) {
						clearInterval(timer);
						resolve();
					}
				},
				100
			);
		});
	});
}
