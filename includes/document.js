function documentGet(client, req, res) {

    if (typeof req.session.user !== 'undefined') {

		var query = "id:" + req.params.docID;
		var searchTerm = client.query().q(query);
        client.search(searchTerm, function (err, results) {
            if (err) {
                console.log(err);
                return;
			}
			
            console.log('Title: ', results.response.docs[0].title);
			
			// Replace all instances of \n with <br/>
			var formattedFileContent = results.response.docs[0].contents;
			console.log("Contents: " + formattedFileContent);

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
				fileID: results.response.docs[0].id,
				uploadDate: results.response.docs[0].date,

				contents: formattedFileContent,
	
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