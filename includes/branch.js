function branchGet(req, res) {
    if (typeof req.session.user !== 'undefined') {
		res.render('branch-type',{
			title: 'Branch File',
			hasHeader: true,
			
			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/file-manager',
			breadcrumbsText: 'File Manager',

			footerBorder: true,
			hasLogout: true
		});
	}
	else {
		res.redirect('/');
	}
}

module.exports = {
    branchGet: branchGet
}