
function branchGet(req, res) {
    if (typeof req.session.user !== 'undefined') {

		/*var url = require("url");
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		*/

		if (typeof req.query.id !== 'undefined') {
			res.redirect('/upload-branch?id=' + req.query.id);
		}

		/*console.log("Query ID: " + req.query.id);
		
		res.render('branch-type',{
			title: 'Branch File',
			hasHeader: true,
			
			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/file-manager',
			breadcrumbsText: 'File Manager',

			id: req.query.id,

			footerBorder: true,
			hasLogout: true
		});
		*/
	}
	else {
		res.redirect('/');
	}
}

module.exports = {
    branchGet: branchGet
}