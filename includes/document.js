function documentGet(client, req, res) {


    if (typeof req.session.user !== 'undefined') {

		console.log("ID: " + req.params.docID);
		var query = "id:" + req.params.docID;
		var searchTerm = client.query().q(query);
        client.search(searchTerm, function (err, results) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Response: ', results.response);
			
            res.render('document',{
				// replace w/ dynamic document name from querystring
	
				title: results.response.docs[0].title,
				// replace w/ dynamic document description
				subtitle: results.response.docs[0].description,
				hasHeader: true,
				
				hasHeaderBreadcrumbs: true,
				breadcrumbsPath: '/file-manager',
				breadcrumbsText: 'File Manager',
	
				hasHeaderDownload: true,
				fileSize: '7kb',
				uploadDate: results.response.docs[0].date,
	
				footerBorder: true,
				hasLogout: true
			});
        });

		
	}
	else {
		res.redirect('/');
	}
}

module.exports = {
    documentGet: documentGet
}