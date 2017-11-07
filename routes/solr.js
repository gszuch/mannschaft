const express = require('express');
const router = express.Router();
const solr = require('solr-client');

const client = solr.createClient();

/* GET solr client. */
router.get('/solr', function (req, res, next) {
    res.render('solr', {
        title: 'Solr Client'
    });
});

/* POST to solr client. */
router.post('/solr', function (req, res, next) {
    if (!req.body) return res.sendStatus(400)

    const now = Date.now();// todo: consider changing to https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    const ymd = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}`;
    const hmss = `${now.getUTCHours()}${now.getUTCMinutes()}${now.getUTCSeconds()}${now.getUTCMilliseconds()}`;
    const id = `${ymd}${hmss}`;
    const doc = {
        id: id,
        title_t: req.body.title,
        description_t: req.body.description
    };

    client.add(doc, function (err, obj) {
        if (err) {
            console.log(err);
        } else {
            console.log(obj);
        }
    });

    res.redirect(303, '/solr');
});

module.exports = router;
