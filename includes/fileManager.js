/**
 * 
 * @param {object} client 
 * @param {object} req 
 * @param {object} res 
 */
function fileManagerGet(client, req, res) {
    // If session established
    if (typeof req.session.user !== 'undefined') {

        // Pull from solr
        const diffTerm = "q=*:*&sort=id desc";
        const searchTerm = client.query().q('*:*');
        client.search(diffTerm, function (err, results) {
            if (err) {
                console.log(err);
                return;
            }

            // Check to see if any docs or empty
            const resultDocs = "";
            if (typeof results.response.docs !== 'undefined') {
                resultDocs = results.response.docs;
            }

            res.render('file-manager', {
                title: 'File Manager',
                hasHeader: true,
                hasHeaderMerge: true,
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

/**
 * 
 * @param {object} client 
 * @param {object} req 
 * @param {object} res 
 */
function fileManagerPost(client, req, res) {
    if (typeof req.session.user !== 'undefined') {

        // Pull from solr
        const term = "*" + req.body.searchTerm + "*";
        const searchTerm = client.query().q(term);
        client.search(searchTerm, function (err, results) {
            if (err) {
                console.log(err);
                return;
            }

            // Check to see if any docs or empty
            const resultDocs = "";
            if (typeof results.response.docs !== 'undefined') {
                resultDocs = results.response.docs;
            }

            //console.log("Search Value: " + req.body.searchTerm);

            res.render('file-manager', {
                title: 'Search Results',
                hasHeader: true,
                hasHeaderUpload: true,
                hasHeaderBreadcrumbs: true,
                searchValue: req.body.searchTerm,
                breadcrumbsPath: '/file-manager',
                breadcrumbsText: 'File Manager',
                footerBorder: true,
                hasLogout: true,
                docs: resultDocs
            });
        });

    }
    else {
        res.redirect('/');
    };
}

module.exports = {
    fileManagerGet: fileManagerGet,
    fileManagerPost: fileManagerPost
}