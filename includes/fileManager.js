
function fileManagerGet(client, req, res) {
    // If session established
    if (typeof req.session.user !== 'undefined') {

        // Pull from solr
        console.log("Retrieving records from Solr...");

        var searchTerm = client.query().q('*:*');
        client.search(searchTerm, function (err, results) {
            if (err) {
                console.log(err);
                return;
            }
            //console.log('Response: ', results.response);

            res.render('file-manager', {
                title: 'File Manager',
                hasHeader: true,
                hasHeaderUpload: true,
                footerBorder: true,
                hasLogout: true,
                docs: results.response.docs
            });
        });

    }
    else {
        res.redirect('/');
    }
}

module.exports = {
    fileManagerGet: fileManagerGet
}