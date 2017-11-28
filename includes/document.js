/**
 * 
 * @param {*} client 
 * @param {*} req 
 * @param {*} res 
 */
function documentGet(client, req, res) {

    if (typeof req.session.user !== 'undefined') {

		var query = "id:" + req.params.docID;
		var searchTerm = client.query().q(query);
        client.search(searchTerm, function (err, results) {
            if (err) { console.log(err); return; }
			
			// Check for versions
			var versionQuery = "branchID:" + req.params.docID;
			var versionSearchTerm = client.query().q(versionQuery);

			client.search(versionSearchTerm, function(err,versionResults) {
				
				if (err) { console.log(err); return; }

				// Replace all instances of \n with <br/>
				var formattedFileContent = results.response.docs[0].contents;
				
           		res.render('document', {
		
					title: results.response.docs[0].title,
					subtitle: results.response.docs[0].description,
					hasHeader: true,
					
					hasHeaderBreadcrumbs: true,
					breadcrumbsPath: '/file-manager',
					breadcrumbsText: 'File Manager',
		
					hasHeaderDownload: true,
					fileID: results.response.docs[0].id,
					uploadDate: results.response.docs[0].date,

					versions: versionResults.response.docs,
					contents: formattedFileContent,
		
					footerBorder: true,
					hasLogout: true
				});

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