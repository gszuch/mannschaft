
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

            // Check to see if any docs or empty
            var resultDocs = "";
            if (typeof results.response.docs !== 'undefined') {
               resultDocs = results.response.docs;
            }

            res.render('file-manager', {
                title: 'File Manager',
                hasHeader: true,
                hasHeaderUpload: true,
                footerBorder: true,
                hasLogout: true,
                docs: resultDocs
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