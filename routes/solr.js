const express = require('express');
const router = express.Router();
const SolrNode = require('solr-node');

const client = new SolrNode({
	host: '127.0.0.1',
	port: '8983',
	core: 'mannschaft',
	protocol: 'http'
});
client.autoCommit = true;

/* GET solr client. */
router.get('/', function (req, res, next) {
	const q = client.query().q('*:*');
	const docs = new Array();
	client.search(q, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		console.log(`Response: ${result.response.docs[0].title}`);
		res.render('solr', {
			title: 'Solr Client',
			docs: result.response.docs
		});
	});
});

/* POST to solr client. */
router.post('/', function (req, res, next) {
	if (!req.body) return res.sendStatus(400)

	const now = Date.now(); // todo: consider changing to https://developer.mozilla.org/en-US/docs/Web/API/Performance/now,
	const doc = {
		id: now,
		title: req.body.title,
		author: "pst7@students.uwf.edu",
		description: req.body.description,
		contents: req.body.contents,
		date: now
	};

	client.update(doc, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log(doc);
		}
	});

	res.redirect(303, '/solr');
});

module.exports = router;
